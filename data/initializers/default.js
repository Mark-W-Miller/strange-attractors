export const Simulation = {
    // Grid Configuration
    gridConfig: {
        gridWidth: 80,
        gridHeight: 40,
        terrainScaleFactor: 2,
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
            type: 'depression',
            value: 0,
            // type: 'random',
            // minValue: 20,
            // maxValue: 220,
        },
        terrainInitializer: {
            type: 'constant',
            terrainType: 'flat',
        },
        FPS: 10, // Frames per second for the simulation
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
            type: 'blue.male.aut',
            physics: {
                mass: 3,
                coreSize: 4,
            },
            graphics: {
                shape: 'triangle',
                color: 'blue',
                size: 12,
            },
            rules: ['TerrainSensitivity', 'GravityVectorSensitivity'], 
        },
        {
            name: 'Big Red Female',
            type: 'red.female.aut',
            physics: {
                mass: 16,
                coreSize: 16,
            },
            graphics: {
                shape: 'circle',
                color: 'red',
                size: 16,
            },
            rules: ['TerrainSensitivity', 'GravityVectorSensitivity'], 
        },
    ],

    bondTypes: [
        { type: 'attraction', strength: 12, fromTo: 'blue.male.aut,red.female.aut' },
       { type: 'attraction', strength: -1, fromTo: 'red.female.aut,blue.male.aut' },
    ],

    // Terrain Types
    terrainTypes: [
        { type: 'flat', img: '/images/terrain/flat.png', velocityModifier: 1.0, bounce: 'none' }, // No bounce
        { type: 'rough', img: '/images/terrain/rough.png', velocityModifier: 0.8, bounce: 'none' }, // No bounce
        { type: 'tower', img: '/images/terrain/tower.png', velocityModifier: 0.0, bounce: 'round' }, // Square bounce
        { type: 'wall', img: '/images/terrain/wall.png', velocityModifier: 0.0, bounce: 'square' }, // Square bounce
        { type: 'water', img: '/images/terrain/water.png', velocityModifier: 0.5, bounce: 'none' }, // Round bounce
    ],
};