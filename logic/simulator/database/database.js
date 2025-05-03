import { D_, DB } from '../../../debug/DB.js';
import { initializeEGFMap, initializeTerrainMap } from './initialize/initialize.js';
import { loadAUTTypes, buildTypeMap } from './autLoader.js';
import { initializeGravityVectorArray, calculateGravityVector } from './physics/gravity.js';

export const Database = {
    gridConfig: null,
    terrainTypes: {},
    AUTTypes: {},
    listeners: [],
    AUTInstances: [],
    Rules: null,
    _EGFMap: [],
    GravityVectorArray: [],
    TerrainMap: [],
    terrainImages: {}, // Initialize terrainImages as an empty object

    async initialize(Simulation) {
        try {
            D_(DB.DB_INIT, '[Database] Starting initialization...');

            // Load grid configuration
            this.gridConfig = Simulation.gridConfig;
            D_(DB.DB_INIT, '[Database] Grid configuration loaded:', this.gridConfig);

            // Initialize EGFMap
            this._EGFMap = initializeEGFMap(
                this.gridConfig.egfInitializer,
                this.gridConfig.gridWidth,
                this.gridConfig.gridHeight
            );
            D_(DB.DB_INIT, '[Database] EGFMap initialized.');

            // Initialize TerrainMap
            this.TerrainMap = initializeTerrainMap(
                this.gridConfig.terrainInitializer,
                this.gridConfig.gridWidth,
                this.gridConfig.gridHeight,
                this.gridConfig.terrainScaleFactor
            );

            // Load and resolve AUT types
            const allTypes = await loadAUTTypes(Simulation);
            this.AUTTypes = buildTypeMap(allTypes);

            // Precompute scaled AUT sizes
            this.precomputeAUTSizes();

            D_(DB.DB_INIT, '[Database] AUT types loaded:', this.AUTTypes);

            // Debug: List all resolved types
            Object.entries(this.AUTTypes).forEach(([name, type]) => {
                D_(DB.DB_INIT, `[Database] Resolved AUT Type: ${name}`, type);
            });

            // Load terrain images
            await this.loadTerrainImages(Simulation.terrainTypes);

            // Initialize Gravity Vector Array
            this.GravityVectorArray = initializeGravityVectorArray(this.gridConfig, this._EGFMap);

            // Log debugging information
            this.logDebugInfo();

            D_(DB.DB_INIT, '[Database] Initialization complete.');
        } catch (error) {
            D_(DB.DB_INIT, '[Database] Failed to initialize:', error);
        }
    },

    async loadTerrainImages(terrainTypes) {
        if (!terrainTypes || !Array.isArray(terrainTypes)) {
            throw new Error('[Database] terrainTypes is not defined or not an array.');
        }

        for (const terrain of terrainTypes) {
            if (!terrain.type || !terrain.img) {
                throw new Error(`[Database] Missing 'type' or 'img' property in terrain type: ${JSON.stringify(terrain)}`);
            }

            const img = new Image();
            img.src = terrain.img; // Use the 'img' property for the image path
            await new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error(`[Database] Failed to load terrain image for type: ${terrain.type}`));
            });
            this.terrainImages[terrain.type] = img; // Store the loaded image using terrain.type as the key
        }
        D_(DB.DB_INIT, '[Database] Terrain images loaded:', this.terrainImages);
    },

    verifyEGFMap() {
        const { gridWidth, gridHeight } = this.gridConfig;

        if (!this._EGFMap || this._EGFMap.length !== gridHeight) {
            throw new Error(`[Database] EGFMap has an invalid number of rows: ${this._EGFMap?.length || 0}`);
        }

        for (let y = 0; y < gridHeight; y++) {
            if (!this._EGFMap[y] || this._EGFMap[y].length !== gridWidth) {
                throw new Error(`[Database] EGFMap row ${y} has an invalid number of columns: ${this._EGFMap[y]?.length || 0}`);
            }
        }

        D_(DB.DB_INIT, '[Database] EGFMap integrity verified.');
    },

    logDebugInfo() {
        D_(DB.DB_INIT, '[Database] gridConfig loaded:', this.gridConfig);
        D_(DB.DB_INIT, `[Database] Scaled grid dimensions: ${this.scaledGridWidth}x${this.scaledGridHeight}`);
        D_(DB.DB_INIT, '[Database] EGFMap initialized:', this._EGFMap);
        D_(DB.DB_INIT, '[Database] TerrainMap initialized:', this.TerrainMap);
        D_(DB.DB_INIT, '[Database] AUT types loaded:', this.AUTTypes);
        D_(DB.DB_INIT, '[Database] Gravity Vector Array initialized:', this.GravityVectorArray);
        D_(DB.DB_INIT, '[Database] Terrain images loaded:', this.terrainImages);
    },

    addAUTInstance(typeName, posX, posY) {
        const type = this.AUTTypes[typeName];
        if (!type) {
            throw new Error(`[Database] Unknown AUT type: ${typeName}`);
        }

        const autInstance = {
            id: `${typeName}-${Date.now()}`, // Unique ID
            type: typeName,
            posX, // Store grid X coordinate
            posY, // Store grid Y coordinate
            properties: { ...type } // Copy properties from the type
        };

        this.AUTInstances.push(autInstance);
        D_(DB.UI_DEEP, `[Database] Added AUT instance at grid coordinates (${posX}, ${posY}):`, autInstance);
    },

    precomputeAUTSizes() {
        const scaleFactor = this.gridConfig.positionScaleFactor || 1;

        Object.entries(this.AUTTypes).forEach(([name, type]) => {
            if (type.graphics && type.graphics.size) {
                type.graphics.scaledSize = type.graphics.size * scaleFactor;
                D_(DB.DB_INIT, `[Database] Precomputed scaled size for AUT type "${name}": ${type.graphics.scaledSize}`);
            }
        });
    },

    addChangeListener(listener) {
        if (typeof listener === 'function') {
            this.listeners.push(listener);
        }
    },

    notifyChange() {
        this.listeners.forEach(listener => listener());
    },

    getEGFValue(x, y) {
        if (y < 0 || y >= this.gridConfig.gridHeight || x < 0 || x >= this.gridConfig.gridWidth) {
            throw new Error(`[Database] Invalid EGF access at (${x}, ${y})`);
        }
        return this._EGFMap[y][x];
    },

    setEGFValue(x, y, newValue) {
        if (y < 0 || y >= this.gridConfig.gridHeight || x < 0 || x >= this.gridConfig.gridWidth) {
            throw new Error(`[Database] Invalid EGF update at (${x}, ${y})`);
        }

        this._EGFMap[y][x] = newValue;
        D_(DB.MSE, `[Database] Updated EGF at (${x}, ${y}) to ${newValue}`);

        // Dynamically recalculate the affected gravity vectors
        this.updateGravityVectorsAround(x, y);

        // Notify listeners of the change
        this.notifyChange();
    },

    updateGravityVectorsAround(x, y) {
        const { gridWidth, gridHeight, influenceRadius } = this.gridConfig;

        for (let offsetY = -influenceRadius; offsetY <= influenceRadius; offsetY++) {
            for (let offsetX = -influenceRadius; offsetX <= influenceRadius; offsetX++) {
                const neighborX = x + offsetX;
                const neighborY = y + offsetY;

                if (neighborX < 0 || neighborX >= gridWidth || neighborY < 0 || neighborY >= gridHeight) {
                    continue;
                }

                const distanceSquared = offsetX ** 2 + offsetY ** 2;
                if (distanceSquared > influenceRadius ** 2) {
                    continue;
                }

                this.GravityVectorArray[neighborY][neighborX] = calculateGravityVector(
                    neighborX,
                    neighborY,
                    this.gridConfig,
                    this._EGFMap
                );
            }
        }

        D_(DB.MSE, `[Database] Updated Gravity Vectors around (${x}, ${y})`);
    },

    recalculateGravityVectors() {
        const { gridWidth, gridHeight } = this.gridConfig;

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const egfValue = this._EGFMap[y][x];

                // Example logic: Calculate the vector based on the EGF value
                const dx = egfValue - (this._EGFMap[y][x - 1] || egfValue); // Difference with left neighbor
                const dy = egfValue - (this._EGFMap[y - 1]?.[x] || egfValue); // Difference with top neighbor
                const magnitude = Math.sqrt(dx ** 2 + dy ** 2);

                // Normalize the vector and store it in the GravityVectorArray
                this.GravityVectorArray[y][x] = {
                    x: dx / magnitude || 0,
                    y: dy / magnitude || 0,
                    magnitude,
                };
            }
        }

        D_(DB.MSE, '[Database] Recalculated Gravity Vectors.');
    },
};