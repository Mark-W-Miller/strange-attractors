import { DB } from '../../../../debug/DB.js';

export function initializeEGFMap(config, gridWidth, gridHeight) {
    const EGFMap = Array.from({ length: gridHeight }, () =>
        Array.from({ length: gridWidth }, () => 0)
    );

    if (config.type === 'random') {
        const { minValue, maxValue } = config;
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                EGFMap[y][x] = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            }
        }
        DB(DB.DB_INIT, '[Initializer] EGFMap initialized with random values.');
    } else if (config.type === 'constant') {
        const { value } = config;
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                EGFMap[y][x] = value;
            }
        }
        DB(DB.DB_INIT, '[Initializer] EGFMap initialized with constant values.');
    }

    // Verify that the EGFMap is valid
    if (EGFMap.length !== gridHeight || EGFMap.some(row => row.length !== gridWidth)) {
        throw new Error('[Initializer] EGFMap dimensions are invalid.');
    }

    return EGFMap;
}

export function initializeTerrainMap(config, gridWidth, gridHeight, scaleFactor) {
    const terrainGridWidth = gridWidth / scaleFactor;
    const terrainGridHeight = gridHeight / scaleFactor;
    const TerrainMap = Array.from({ length: terrainGridHeight }, () =>
        Array.from({ length: terrainGridWidth }, () => 'flat')
    );

    if (config.type === 'random') {
        const { terrainTypes } = config;
        for (let y = 0; y < terrainGridHeight; y++) {
            for (let x = 0; x < terrainGridWidth; x++) {
                TerrainMap[y][x] = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
            }
        }
        DB(DB.DB_INIT, '[Initializer] TerrainMap initialized with random terrain types.');
    } else if (config.type === 'constant') {
        const { terrainType } = config;
        for (let y = 0; y < terrainGridHeight; y++) {
            for (let x = 0; x < terrainGridWidth; x++) {
                TerrainMap[y][x] = terrainType;
            }
        }
        DB(DB.DB_INIT, '[Initializer] TerrainMap initialized with constant terrain type.');
    } else if (config.type === 'alternating') {
        const { terrainTypes } = config;
        for (let y = 0; y < terrainGridHeight; y++) {
            for (let x = 0; x < terrainGridWidth; x++) {
                TerrainMap[y][x] = terrainTypes[(x + y) % terrainTypes.length];
            }
        }
        DB(DB.DB_INIT, '[Initializer] TerrainMap initialized with alternating terrain types.');
    }

    // Verify that the TerrainMap is valid
    if (TerrainMap.length !== terrainGridHeight || TerrainMap.some(row => row.length !== terrainGridWidth)) {
        throw new Error('[Initializer] TerrainMap dimensions are invalid.');
    }

    return TerrainMap;
}