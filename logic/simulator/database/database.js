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
    Simulation: null, // This will hold the loaded simulation
    bondTypes: [],
    bondTypeMap: {},
    simTime: 0, // in microseconds

    async initialize(Simulation) {
        try {
            this.Simulation = Simulation; // Assign Simulation to Database
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

            // Assign terrainTypes to Database
            this.terrainTypes = Simulation.terrainTypes;
            D_(DB.DB_INIT, '[Database] Terrain types assigned:', this.terrainTypes);

            // Load terrain images
            await this.loadTerrainImages(this.terrainTypes);

            // Load and resolve AUT types
            const allTypes = await loadAUTTypes(Simulation);
            this.AUTTypes = buildTypeMap(allTypes);

            // Precompute scaled AUT sizes
            this.precomputeAUTSizes();

            D_(DB.DB_INIT, '[Database] AUT types loaded:', this.AUTTypes);

            // Initialize AUT instances
            this.AUTInstances = Simulation.autPositions.map(autPosition => {
                const autType = Simulation.autTypes.find(type => type.name === autPosition.type);
                if (!autType) {
                    throw new Error(`[Database] Unknown AUT type: ${autPosition.type}`);
                }

                return {
                    name: autPosition.name,
                    position: autPosition.position || { x: 0, y: 0 },
                    velocity: autPosition.velocity || { x: 0, y: 0 },
                    rules: autType.rules || [],
                    physics: autType.physics,
                    graphics: autType.graphics,
                };
            });

            // Initialize Gravity Vector Array
            this.GravityVectorArray = initializeGravityVectorArray(this.gridConfig, this._EGFMap);

            // Log debugging information
            this.logDebugInfo();

            // Build bond type map for fast lookup
            this.bondTypes = Simulation.bondTypes || [];
            this.bondTypeMap = buildBondTypeMap(this.bondTypes);

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

    
    addAUTInstance(typeName, x, y) {
        const type = this.AUTTypes[typeName];
        if (!type) {
            throw new Error(`[Database] Unknown AUT type: ${typeName}`);
        }

        const autInstance = {
            id: `${typeName}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
            type: type.type,
            position: { x, y },
            velocity: { x: 0, y: 0 },
            rules: type.rules ? [...type.rules] : [],
            physics: { ...type.physics },
            graphics: { ...type.graphics },
            ...(type.spawn ? { spawn: { ...type.spawn } } : {}), // Copy spawn property if present
            lastSpawn: 0 // Initialize lastSpawn for runtime spawn logic
        };
        
        autInstance.birthMicroTime = Database.simTime;
        this.AUTInstances.push(autInstance);
        D_(DB.UI_DEEP, `[Database] Added AUT instance at position (${x}, ${y}):`, autInstance);
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

    deleteAUTsByType(types) {
        const toDelete = this.AUTInstances.filter(aut => types.includes(aut.type));
        const toDeleteIds = toDelete.map(aut => aut.id);

        // Clear pair bonds on AUTs to be deleted and their partners
        toDelete.forEach(aut => {
            // Clear bond on partner if bonded
            if (aut.bondedTo) {
                const partner = this.AUTInstances.find(a => a.id === aut.bondedTo);
                if (partner) {
                    partner.bondedTo = null;
                    D_(DB.EVENTS, `[Database] Bond broken: ${partner.id} (${partner.type}) no longer bonded to ${aut.id} (${aut.type})`);
                }
            }
            // Clear any bonds where other AUTs are bonded to this AUT
            this.AUTInstances.forEach(a => {
                if (a.bondedTo === aut.id) {
                    a.bondedTo = null;
                    D_(DB.EVENTS, `[Database] Bond broken: ${a.id} (${a.type}) no longer bonded to ${aut.id} (${aut.type})`);
                }
            });
        });

        const initialCount = this.AUTInstances.length;
        this.AUTInstances = this.AUTInstances.filter(
            aut => !types.includes(aut.type)
        );
        const removedCount = initialCount - this.AUTInstances.length;

        D_(DB.DEBUG, `[Database] Removed ${removedCount} AUT(s) of types: ${types.join(', ')}`);
    },

    getBondTypeMap() {
        return this.bondTypeMap || {};
    },

    getBondTypes() {
        return this.bondTypes || [];
    },

    /**
     * Returns the list of bond definitions for a given AUT type as 'from'.
     * @param {string} autType - The AUT type to look up as 'from'.
     * @returns {Array} Array of bond definitions, or empty array if none.
     */
    getBondsForType(autType) {
        const map = this.getBondTypeMap();
        return map[autType] || [];
    },

    /**
     * Removes an AUT instance by id and clears its bond on any partner.
     * Also clears any pair bonds where other AUTs are bonded to this AUT.
     * @param {string} autId - The id of the AUT to remove.
     */
    removeAUTInstanceById(autId) {
        const aut = this.AUTInstances.find(a => a.id === autId);
        if (!aut) return;

        // Clear bond on partner if bonded
        if (aut.bondedTo) {
            const partner = this.AUTInstances.find(a => a.id === aut.bondedTo);
            if (partner) {
                partner.bondedTo = null;
                D_(DB.EVENTS, `[Database] Bond broken: ${partner.id} (${partner.type}) no longer bonded to ${aut.id} (${aut.type})`);
            }
        }

        // Clear any bonds where other AUTs are bonded to this AUT
        this.AUTInstances.forEach(a => {
            if (a.bondedTo === autId) {
                a.bondedTo = null;
                D_(DB.EVENTS, `[Database] Bond broken: ${a.id} (${a.type}) no longer bonded to ${aut.id} (${aut.type})`);
            }
        });

        // Remove AUT from AUTInstances
        this.AUTInstances = this.AUTInstances.filter(a => a.id !== autId);
        D_(DB.EVENTS, `[Database] Removed AUT instance: ${aut.id} (${aut.type})`);
    },

    /**
     * Removes all AUT instances that are not sources (i.e., do not have a spawn property).
     */
    removeAllNonSourceAUTs() {
        const toDelete = this.AUTInstances.filter(aut => !aut.spawn);
        toDelete.forEach(aut => this.removeAUTInstanceById(aut.id));
        D_(DB.DEBUG, `[Database] Removed ${toDelete.length} non-source AUT(s).`);
    },
};

/**
 * Build a map of bond types for fast lookup.
 * Key: 'from' AUT type (first in fromTo string)
 * Value: Array of bond definitions where this type is the 'from'
 */
function buildBondTypeMap(bondTypes) {
    const bondTypeMap = {};
    for (const bond of bondTypes) {
        const [from, to] = bond.fromTo.split(',');
        if (!bondTypeMap[from]) {
            bondTypeMap[from] = [];
        }
        bondTypeMap[from].push({ ...bond, to });
    }
    return bondTypeMap;
}