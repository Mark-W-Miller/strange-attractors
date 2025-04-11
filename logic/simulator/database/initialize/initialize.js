import { D_, DB } from '../../../../debug/DB.js';

export function initializeEGFMap(config, gridWidth, gridHeight) {
    let EGFMap;

    switch (config.type) {
        case 'random':
            EGFMap = initializeRandomEGFMap(config, gridWidth, gridHeight);
            break;

        case 'constant':
            EGFMap = initializeConstantEGFMap(config, gridWidth, gridHeight);
            break;

        case 'gradient':
            EGFMap = initializeGradientEGFMap(config, gridWidth, gridHeight);
            break;

        case 'peaksvalleys':
            EGFMap = initializePeaksValleysEGFMap(config, gridWidth, gridHeight);
            break;

        default:
            throw new Error(`[Initializer] Unsupported EGFMap type: ${config.type}`);
    }

    // Verify that the EGFMap is valid
    if (EGFMap.length !== gridHeight || EGFMap.some(row => row.length !== gridWidth)) {
        throw new Error('[Initializer] EGFMap dimensions are invalid.');
    }

    return EGFMap;
}

// Function for 'random' type
function initializeRandomEGFMap(config, gridWidth, gridHeight) {
    const { minValue, maxValue } = config;
    const EGFMap = Array.from({ length: gridHeight }, () =>
        Array.from({ length: gridWidth }, () =>
            Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
        )
    );
    D_(DB.DB_INIT, '[Initializer] EGFMap initialized with random values.');
    return EGFMap;
}

// Function for 'constant' type
function initializeConstantEGFMap(config, gridWidth, gridHeight) {
    const { value } = config;
    const EGFMap = Array.from({ length: gridHeight }, () =>
        Array.from({ length: gridWidth }, () => value)
    );
    D_(DB.DB_INIT, '[Initializer] EGFMap initialized with constant values.');
    return EGFMap;
}

// Function for 'gradient' type
function initializeGradientEGFMap(config, gridWidth, gridHeight) {
    const { startValue, endValue } = config;
    const valueRange = endValue - startValue;

    const EGFMap = Array.from({ length: gridHeight }, (_, y) =>
        Array.from({ length: gridWidth }, (_, x) => {
            const horizontalFactor = x / (gridWidth - 1); // Normalize x to [0, 1]
            const verticalFactor = y / (gridHeight - 1); // Normalize y to [0, 1]
            const gradientValue = startValue + valueRange * (horizontalFactor + verticalFactor) / 2;
            return Math.round(gradientValue);
        })
    );

    D_(DB.DB_INIT, '[Initializer] EGFMap initialized with gradient values.');
    return EGFMap;
}

// Function for 'peaksvalleys' type
function initializePeaksValleysEGFMap(config, gridWidth, gridHeight) {
    const { midValue, points } = config;

    // Initialize the map with the midValue
    const EGFMap = Array.from({ length: gridHeight }, () =>
        Array.from({ length: gridWidth }, () => midValue)
    );

    D_(DB.DB_INIT, `[Initializer] Starting Peaks and Valleys initialization with midValue: ${midValue}`);
    D_(DB.DB_INIT, `[Initializer] Grid dimensions: ${gridWidth}x${gridHeight}`);
    D_(DB.DB_INIT, `[Initializer] Points:`, points);

    // Apply peaks and valleys
    points.forEach(({ x, y, value }, index) => {
        D_(DB.DB_INIT, `[Initializer] Processing point ${index + 1}: (${x}, ${y}) with value ${value}`);
        for (let i = 0; i < gridHeight; i++) {
            for (let j = 0; j < gridWidth; j++) {
                const distance = Math.sqrt((i - y) ** 2 + (j - x) ** 2);
                const maxDistance = Math.max(gridWidth, gridHeight) / 2;
                const influence = Math.max(0, 1 - distance / maxDistance);
                const delta = (value - midValue) * influence;

                if (influence > 0) {
                    EGFMap[i][j] = Math.round(EGFMap[i][j] + delta);
                }

                // Debugging for specific cells
                if (distance < 5) { // Log only for cells within a small distance for clarity
                    D_(DB.DB_INIT, `[Initializer] Cell (${j}, ${i}): distance=${distance.toFixed(2)}, influence=${influence.toFixed(2)}, delta=${delta.toFixed(2)}, newValue=${EGFMap[i][j]}`);
                }
            }
        }
    });

    D_(DB.DB_INIT, '[Initializer] EGFMap initialized with peaks and valleys.');
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
        D_(DB.DB_INIT, '[Initializer] TerrainMap initialized with random terrain types.');
    } else if (config.type === 'constant') {
        const { terrainType } = config;
        for (let y = 0; y < terrainGridHeight; y++) {
            for (let x = 0; x < terrainGridWidth; x++) {
                TerrainMap[y][x] = terrainType;
            }
        }
        D_(DB.DB_INIT, '[Initializer] TerrainMap initialized with constant terrain type.');
    } else if (config.type === 'alternating') {
        const { terrainTypes } = config;
        for (let y = 0; y < terrainGridHeight; y++) {
            for (let x = 0; x < terrainGridWidth; x++) {
                TerrainMap[y][x] = terrainTypes[(x + y) % terrainTypes.length];
            }
        }
        D_(DB.DB_INIT, '[Initializer] TerrainMap initialized with alternating terrain types.');
    }

    // Verify that the TerrainMap is valid
    if (TerrainMap.length !== terrainGridHeight || TerrainMap.some(row => row.length !== terrainGridWidth)) {
        throw new Error('[Initializer] TerrainMap dimensions are invalid.');
    }

    return TerrainMap;
}