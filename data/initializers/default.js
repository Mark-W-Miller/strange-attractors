export const Simulation = {
    // Grid Configuration
    gridConfig: {
        gridWidth: 80,
        gridHeight: 40,
        terrainScaleFactor: 1,
        positionScaleFactor: 32,
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
            value: 20,
            // type: 'random',
            // minValue: 20,
            // maxValue: 220,
        },
        terrainInitializer: {
            type: 'constant',
            terrainType: 'flat',
        },
        FPS: 5, // Frames per second for the simulation
    },

    // AUT Initial Positions
    autPositions: [
        // { name: 'Basic AUT 1', type: 'Basic', position: { x: 5, y: 5 }, velocity: { x: 0, y: 0 } },
        // { name: 'Little Blue Male 1', type: 'Little Blue Male', position: { x: 10, y: 10 }, velocity: { x: 1, -1 } },
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
                size: 8,
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
                size: 12,
            },
            rules: ['TerrainSensitivity', 'GravityVectorSensitivity'], // Apply both rules
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
        { type: 'flat', img: '/images/terrain/flat.png', velocityModifier: 1.0, bounce: 'none' }, // No bounce
        { type: 'rough', img: '/images/terrain/rough.png', velocityModifier: 0.8, bounce: 'none' }, // No bounce
        { type: 'tower', img: '/images/terrain/tower.png', velocityModifier: 0.0, bounce: 'round' }, // Square bounce
        { type: 'wall', img: '/images/terrain/wall.png', velocityModifier: 0.0, bounce: 'square' }, // Square bounce
        { type: 'water', img: '/images/terrain/water.png', velocityModifier: 0.5, bounce: 'none' }, // Round bounce
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
                const { TerrainMap, terrainTypes, gridConfig } = database;
                const { positionScaleFactor, terrainScaleFactor } = gridConfig;

                // Convert arena coordinates to terrain grid coordinates
                const cellSize = positionScaleFactor * terrainScaleFactor;
                const x = Math.floor(position.x / cellSize);
                const y = Math.floor(position.y / cellSize);

                // Ensure the terrain grid coordinates are within bounds
                if (y >= 0 && y < TerrainMap.length && x >= 0 && x < TerrainMap[0].length) {
                    const terrainType = TerrainMap[y][x];
                    const terrain = terrainTypes.find(t => t.type === terrainType);

                    if (terrain) {
                        if (terrain.bounce === 'round') {
                            // Handle round (circular) bounce
                            const centerX = x * cellSize + cellSize / 2;
                            const centerY = y * cellSize + cellSize / 2;

                            const dx = position.x - centerX;
                            const dy = position.y - centerY;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            const radius = cellSize / Math.sqrt(2); // Larger radius to cover corners

                            if (distance <= radius) {
                                const normalX = dx / distance;
                                const normalY = dy / distance;

                                const dotProduct = velocity.x * normalX + velocity.y * normalY;
                                velocity.x -= 2 * dotProduct * normalX;
                                velocity.y -= 2 * dotProduct * normalY;

                                const overlap = distance - radius;
                                position.x -= overlap * normalX;
                                position.y -= overlap * normalY;
                            }
                        } else if (terrain.bounce === 'square') {
                            // Handle square bounce
                            const leftBoundary = x * cellSize;
                            const rightBoundary = (x + 1) * cellSize;
                            const topBoundary = y * cellSize;
                            const bottomBoundary = (y + 1) * cellSize;

                            if (position.x >= leftBoundary && position.x <= rightBoundary) {
                                velocity.x = -velocity.x; // Reverse x velocity
                            }
                            if (position.y >= topBoundary && position.y <= bottomBoundary) {
                                velocity.y = -velocity.y; // Reverse y velocity
                            }
                        } else if (terrain.bounce === 'none') {
                            // No bounce, apply velocity modifier if defined
                            if (terrain.velocityModifier !== undefined) {
                                velocity.x *= terrain.velocityModifier;
                                velocity.y *= terrain.velocityModifier;
                            }
                        }
                    }
                }
            },
        },
    ],
};