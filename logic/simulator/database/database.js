import { D_, DB } from '../../../debug/DB.js';
import { initializeEGFMap, initializeTerrainMap } from './initialize/initialize.js';
import { loadAUTTypes, buildTypeMap } from './autLoader.js';

export const Database = {
    gridConfig: null,
    EGFMap: [],
    TerrainMap: [],
    terrainTypes: ['flat', 'wall', 'rough', 'water'],
    terrainImages: {},
    AUTTypes: {}, // Store resolved AUT types here
    AUTInstances: [], // Store AUT instances here

    async initialize(gridConfigUrl, initializerConfigUrl) {
        D_(DB.DB_INIT, '[Database] Starting initialization...');
        try {
            // Load grid configuration
            const gridResponse = await fetch(gridConfigUrl);
            this.gridConfig = await gridResponse.json();
            D_(DB.DB_INIT, '[Database] gridConfig loaded:', this.gridConfig);

            // Load initializer configuration
            const initializerResponse = await fetch(initializerConfigUrl);
            const initializerConfig = await initializerResponse.json();
            D_(DB.DB_INIT, '[Database] Initializer config loaded:', initializerConfig);

            // Initialize EGFMap and TerrainMap
            this.EGFMap = initializeEGFMap(initializerConfig.egfInitializer, this.gridConfig.gridWidth, this.gridConfig.gridHeight);
            this.TerrainMap = initializeTerrainMap(
                initializerConfig.terrainInitializer,
                this.gridConfig.gridWidth,
                this.gridConfig.gridHeight,
                this.gridConfig.terrainScaleFactor
            );

            // Load and resolve AUT types
            const allTypes = await loadAUTTypes('../data/auts');
            this.AUTTypes = buildTypeMap(allTypes);
            D_(DB.DB_INIT, '[Database] AUT types loaded:', this.AUTTypes);

            // Debug: List all resolved types
            Object.entries(this.AUTTypes).forEach(([name, type]) => {
                D_(DB.DB_INIT, `[Database] Resolved AUT Type: ${name}`, type);
            });

            // Load terrain images
            await this.loadTerrainImages();

            // Verify EGFMap integrity
            this.verifyEGFMap();

            D_(DB.DB_INIT, '[Database] Initialization complete.');
        } catch (error) {
            D_(DB.DB_INIT, '[Database] Failed to initialize:', error);
        }
    },

    async loadTerrainImages() {
        const terrainTypes = this.terrainTypes;
        for (const type of terrainTypes) {
            const img = new Image();
            img.src = `../images/terrain/${type}.png`; // Ensure these paths are correct
            await new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error(`[Database] Failed to load terrain image for type: ${type}`));
            });
            this.terrainImages[type] = img;
        }
        D_(DB.DB_INIT, '[Database] Terrain images loaded:', this.terrainImages);
    },

    verifyEGFMap() {
        const { gridWidth, gridHeight } = this.gridConfig;

        if (!this.EGFMap || this.EGFMap.length !== gridHeight) {
            throw new Error(`[Database] EGFMap has an invalid number of rows: ${this.EGFMap?.length || 0}`);
        }

        for (let y = 0; y < gridHeight; y++) {
            if (!this.EGFMap[y] || this.EGFMap[y].length !== gridWidth) {
                throw new Error(`[Database] EGFMap row ${y} has an invalid number of columns: ${this.EGFMap[y]?.length || 0}`);
            }
        }

        D_(DB.DB_INIT, '[Database] EGFMap integrity verified.');
    },

    // Add an AUT instance to the database
    // Add an AUT instance to the database
    addAUTInstance(typeName, pixelX, pixelY) {
        const type = this.AUTTypes[typeName];
        if (!type) {
            throw new Error(`[Database] Unknown AUT type: ${typeName}`);
        }

        const autInstance = {
            id: `${typeName}-${Date.now()}`, // Unique ID
            type: typeName,
            x: pixelX, // Store pixel X coordinate
            y: pixelY, // Store pixel Y coordinate
            properties: { ...type } // Copy properties from the type
        };

        this.AUTInstances.push(autInstance);
        D_(DB.DB_INIT, `[Database] Added AUT instance at pixel coordinates (${pixelX}, ${pixelY}):`, autInstance);
    }
};