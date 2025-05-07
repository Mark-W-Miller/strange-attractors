export const Simulation = {
    // Grid Configuration
    gridConfig: {
        gridWidth: 40,
        gridHeight: 20,
        terrainScaleFactor: 2,
        positionScaleFactor: 8,
        terrainOpacity: 0.5,
        gridLineColors: {
            EGF: '#CCCCCC',
            Terrain: '#AAAAAA',
        },
        initialARV: 0,
        influenceRadius: 4,
        defaultTerrainType: 'flat',
        egfInitializer: {
            type: 'depression',
            value: 45,
        },
        terrainInitializer: {
            type: 'constant',
            terrainType: 'flat',
        },
        FPS: 5, // Frames per second for the simulation
    },

    // AUT Initial Positions
    autPositions: [
        { name: 'Basic AUT 1', type: 'Basic', position: { x: 5, y: 5 }, velocity: { x: 0, y: 0 } },
        { name: 'Little Blue Male 1', type: 'Little Blue Male', position: { x: 10, y: 10 }, velocity: { x: 1, y: -1 } },
        // { name: 'Big Red Female 1', type: 'Big Red Female', position: { x: 15, y: 15 }, velocity: { x: -1, y: 1 } },
        // { name: 'Basic AUT 2', type: 'Basic', position: { x: 20, y: 20 }, velocity: { x: 0.5, y: -0.5 } },
    ],

    // AUT Types
    autTypes: [
        {
            name: 'Basic',
            type: 'aut',
            physics: {
                mass: 1,
                coreSize: 4,
                maxSpeed: 10,
            },
            graphics: {
                shape: 'circle',
                color: 'green',
                size: 4,
            },
            rules: ['GravityVectorSensitivity'], // Only apply gravity
        },
        {
            name: 'Little Blue Male',
            type: 'male.aut',
            physics: {
                mass: 5,
                coreSize: 4,
            },
            graphics: {
                shape: 'triangle',
                color: 'blue',
                size: 8,
            },
            rules: ['GravityVectorSensitivity', 'TerrainSensitivity'], // Apply both rules
        },
        {
            name: 'Big Red Female',
            type: 'female.aut',
            physics: {
                mass: 8,
                coreSize: 16,
            },
            graphics: {
                shape: 'circle',
                color: 'red',
                size: 16,
            },
            rules: ['TerrainSensitivity'], // Only apply terrain sensitivity
        },
    ],

    // Terrain Types
    terrainTypes: [
        { type: 'flat', img: '/images/terrain/flat.png', velocityModifier: 1.0 }, // No change to velocity
        { type: 'rough', img: '/images/terrain/rough.png', velocityModifier: 0.8 }, // Reduce velocity by 20%
        { type: 'wall', img: '/images/terrain/wall.png', velocityModifier: 0.0 }, // No movement allowed
        { type: 'water', img: '/images/terrain/water.png', velocityModifier: 0.5 }, // Reduce velocity by 50%
    ],

    // Rules
    rules: [
        {
            name: 'GravityVectorSensitivity',
            evaluate: (aut, database) => {
                const { position, velocity, physics } = aut; // Include physics for mass
                const { GravityVectorArray, gridConfig } = database;
                const { positionScaleFactor } = gridConfig;

                // Convert arena coordinates to grid coordinates
                const gridX = Math.floor(position.x / positionScaleFactor);
                const gridY = Math.floor(position.y / positionScaleFactor);

                // Ensure the grid coordinates are within bounds
                if (gridY >= 0 && gridY < GravityVectorArray.length && gridX >= 0 && gridX < GravityVectorArray[0].length) {
                    const gravityVector = GravityVectorArray[gridY][gridX];

                    // Apply the gravity vector to the AUT's velocity, scaled by mass
                    velocity.x += gravityVector.x / physics.mass;
                    velocity.y += gravityVector.y / physics.mass;
                }
            },
        },
        {
            name: 'TerrainSensitivity',
            evaluate: (aut, database) => {
                const { position, velocity } = aut;
                const { TerrainMap, terrainTypes } = database;

                const x = Math.floor(position.x);
                const y = Math.floor(position.y);

                if (y >= 0 && y < TerrainMap.length && x >= 0 && x < TerrainMap[0].length) {
                    const terrainType = TerrainMap[y][x];
                    const terrain = terrainTypes.find(t => t.type === terrainType);

                    if (terrain && terrain.velocityModifier !== undefined) {
                        velocity.x *= terrain.velocityModifier;
                        velocity.y *= terrain.velocityModifier;
                    }
                }
            },
        },
    ],
};