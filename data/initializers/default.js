export const Simulation = {
    // Grid Configuration
    gridConfig: {
        gridWidth: 120,
        gridHeight: 60,
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
            name: 'basic',
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
            name: 'Killer',
            type: 'killer.aut',
            physics: {
                lifeTime: 300,
            },

            graphics: {
                shape: 'square',
                color: 'red',
                size: 8,
            },
            rules: ['TerrainSensitivity', 'GravityVectorSensitivity'], // Only apply gravity
        },
        {
            name: 'Food',
            type: 'food.aut',
            physics: {
                mass: 1,
                coreSize: 4,
                maxSpeed: 10,
                lifeTime: 10000,
            },
            graphics: {
                shape: 'circle',
                color: 'green',
                size: 8,
            },
            rules: ['TerrainSensitivity', 'GravityVectorSensitivity'],
        },
        {
            name: 'Food Source',
            type: 'source.aut',
            physics: {
                maxSpeed: 0,
            },
            graphics: {
                shape: 'square',
                color: 'green',
                size: 10,
            },
            spawn: {
                autType: 'food.aut',
                frequency: 1000,
            },
            rules: [],
        },
        {
            name: 'killer Source',
            type: 'killer.source.aut',
            physics: {
                maxSpeed: 0,
            },
            graphics: {
                shape: 'square',
                color: 'black',
                size: 10,
            },
            spawn: {
                autType: 'killer.aut',
                frequency: 1000,
            },
            rules: [],
        },
        {
            name: 'Ground Food',
            type: 'ground.food.aut',
            physics: {
                mass: 1,
                coreSize: 4,
                maxSpeed: 10,
            },
            graphics: {
                shape: 'circle',
                color: 'orange',
                size: 8,
            },
            rules: [],
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
                maxSize: 48,
                bondSize: 32,
            },
            rules: ['GravityVectorSensitivity'],
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
                bondSize: 32,
                splitSize: 64,
                splitTo: 'red.female.aut,blue.male.aut',
            },
            rules: ['TerrainSensitivity', 'GravityVectorSensitivity'],
        },
        {
            name: 'Female Source',
            type: 'red.female.source.aut',
            physics: {
                maxSpeed: 0,
            },
            graphics: {
                shape: 'circle',
                color: 'red',
                size: 20,
            },
            spawn: {
                autType: 'red.female.aut',
                frequency: 1000,
            },
            rules: [],
        },
        {
            name: 'Blue Male Source',
            type: 'blue.male.source.aut',
            physics: {
                maxSpeed: 0,
            },
            graphics: {
                shape: 'triangle',
                color: 'blue',
                size: 20,
            },
            spawn: {
                autType: 'blue.male.aut',
                frequency: 1000,
            },
            rules: [],
        },
    ],

    bondTypes: [
        { type: 'attraction', strength: 12, fromTo: 'blue.male.aut,red.female.aut' },
        { type: 'attraction', strength: -1, fromTo: 'red.female.aut,blue.male.aut' },
        { type: 'absorb', massAbsorb: 0.5, sizeGrowth: 0.1, fromTo: 'blue.male.aut,food.aut' },
        { type: 'absorb', massAbsorb: 0.8, sizeGrowth: 0.2, fromTo: 'red.female.aut,food.aut' },
        { type: 'absorb', massAbsorb: 0.5, sizeGrowth: 0.1, fromTo: 'blue.male.aut,ground.food.aut' },
        { type: 'absorb', massAbsorb: 0.8, sizeGrowth: 0.2, fromTo: 'red.female.aut,ground.food.aut' },
        { type: 'kill', damage: 1, fromTo: 'blue.male.aut,killer.aut' },
        { type: 'kill', damage: 1, sizeGrowth: 0.2, fromTo: 'red.female.aut,killer.aut' },
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