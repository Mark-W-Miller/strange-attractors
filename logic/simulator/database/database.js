import { DB } from '../../../debug/DB.js';

export const Database = {
    gridConfig: null,
    EGFMap: [],
    TerrainMap: [],
    terrainTypes: ['flat', 'wall', 'rough', 'water'],
    terrainImages: {},

    async initialize(gridConfigUrl) {
        DB(DB.DB_INIT, '[Database] Starting initialization...');
        try {
            const response = await fetch(gridConfigUrl);
            this.gridConfig = await response.json();
            DB(DB.DB_INIT, '[Database] gridConfig loaded:', this.gridConfig);

            // Initialize EGFMap and TerrainMap
            this.EGFMap = Array.from({ length: this.gridConfig.gridHeight }, () =>
                Array.from({ length: this.gridConfig.gridWidth }, () => this.gridConfig.initialARV || 0)
            );
            DB(DB.DB_INIT, '[Database] EGFMap initialized with dimensions:', this.EGFMap.length, 'x', this.EGFMap[0]?.length);

            const terrainGridWidth = this.gridConfig.gridWidth / this.gridConfig.terrainScaleFactor;
            const terrainGridHeight = this.gridConfig.gridHeight / this.gridConfig.terrainScaleFactor;
            this.TerrainMap = Array.from({ length: terrainGridHeight }, () =>
                Array.from({ length: terrainGridWidth }, () => this.gridConfig.defaultTerrainType || 'flat')
            );
            DB(DB.DB_INIT, '[Database] TerrainMap initialized with dimensions:', this.TerrainMap.length, 'x', this.TerrainMap[0]?.length);

            // Load terrain images
            this.terrainTypes.forEach(type => {
                this.terrainImages[type] = new Image();
                this.terrainImages[type].src = `../images/terrain/${type}.png`;
                this.terrainImages[type].onerror = () => {
                    DB(DB.DB_INIT, `[Database] Failed to load image for terrain type: ${type}`);
                };
            });
            DB(DB.DB_INIT, '[Database] Terrain images initialized:', Object.keys(this.terrainImages));

            DB(DB.DB_INIT, '[Database] Initialization complete.');
        } catch (error) {
            DB(DB.DB_INIT, '[Database] Failed to initialize:', error);
        }
    },

    initializeForDebug() {
        DB(DB.DB_INIT, '[Database] Initializing for debug...');
        if (!this.gridConfig) {
            DB(DB.DB_INIT, '[Database] gridConfig is not set. Cannot initialize for debug.');
            return;
        }

        for (let y = 0; y < this.gridConfig.gridHeight; y++) {
            for (let x = 0; x < this.gridConfig.gridWidth; x++) {
                this.EGFMap[y][x] = Math.floor(Math.random() * 256); // Random values for debugging
            }
        }
        DB(DB.DB_INIT, '[Database] EGFMap populated with random values for debugging.');

        const terrainGridWidth = this.gridConfig.gridWidth / this.gridConfig.terrainScaleFactor;
        const terrainGridHeight = this.gridConfig.gridHeight / this.gridConfig.terrainScaleFactor;
        for (let y = 0; y < terrainGridHeight; y++) {
            for (let x = 0; x < terrainGridWidth; x++) {
                const types = this.terrainTypes;
                this.TerrainMap[y][x] = types[Math.floor(Math.random() * types.length)];
            }
        }
        DB(DB.DB_INIT, '[Database] TerrainMap populated with random terrain types for debugging.');
    }
};