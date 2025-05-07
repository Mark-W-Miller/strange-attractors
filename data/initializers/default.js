export const Simulation = {
    // Grid Configuration
    gridConfig: {
        gridWidth: 40,
        gridHeight: 20,
        terrainScaleFactor: 1,
        positionScaleFactor: 16,
        terrainOpacity: 0.5,
        gridLineColors: {
            EGF: '#CCCCCC',
            Terrain: '#AAAAAA',
        },
        initialARV: 0,
        influenceRadius: 4,
        defaultTerrainType: 'flat',
        egfInitializer: {
            type: 'gradient',
            startValue: 20,
            endValue: 220,
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
        { type: 'flat', img: '/images/terrain/flat.png', velocityModifier: 1.0, bounce: false }, // No bounce
        { type: 'rough', img: '/images/terrain/rough.png', velocityModifier: 0.8, bounce: false }, // No bounce
        { type: 'wall', img: '/images/terrain/wall.png', velocityModifier: 0.0, bounce: true }, // Bounce off walls
        { type: 'water', img: '/images/terrain/water.png', velocityModifier: 0.5, bounce: false }, // No bounce
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
                        if (terrain.bounce) {
                            // Calculate the center of the terrain cell
                            const centerX = x * cellSize + cellSize / 2;
                            const centerY = y * cellSize + cellSize / 2;

                            // Calculate the distance from the AUT to the center of the cell
                            const dx = position.x - centerX;
                            const dy = position.y - centerY;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            // Define the radius of the enlarged circular boundary
                            const radius = cellSize / Math.sqrt(2); // Larger radius to cover corners

                            // Check if the AUT is outside the circular boundary
                            if (distance <= radius) {
                                // Normalize the direction vector (dx, dy)
                                const normalX = dx / distance;
                                const normalY = dy / distance;

                                // Reflect the velocity vector across the normal
                                const dotProduct = velocity.x * normalX + velocity.y * normalY;
                                velocity.x -= 2 * dotProduct * normalX;
                                velocity.y -= 2 * dotProduct * normalY;

                                // Adjust the position to ensure the AUT is inside the boundary
                                const overlap = distance - radius;
                                position.x -= overlap * normalX;
                                position.y -= overlap * normalY;
                            }
                        } else if (terrain.velocityModifier !== undefined) {
                            // Apply the terrain's velocity modifier
                            velocity.x *= terrain.velocityModifier;
                            velocity.y *= terrain.velocityModifier;
                        }
                    }
                }
            },
        },
    ],
};