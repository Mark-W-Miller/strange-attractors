export const basicRules = [
    {
        name: 'GravityVectorSensitivity',
        evaluate: (aut, database) => {
            const { position, velocity, physics } = aut;
            const { GravityVectorArray } = database;

            const x = Math.floor(position.x);
            const y = Math.floor(position.y);

            if (y >= 0 && y < GravityVectorArray.length && x >= 0 && x < GravityVectorArray[0].length) {
                const gv = GravityVectorArray[y][x];
                velocity.x += gv.x * physics.coreSize * 0.01;
                velocity.y += gv.y * physics.coreSize * 0.01;
            }
        },
    },
    {
        name: 'TerrainSensitivity',
        evaluate: (aut, database) => {
            const { position, velocity } = aut;
            const { TerrainMap } = database;

            const x = Math.floor(position.x);
            const y = Math.floor(position.y);

            if (y >= 0 && y < TerrainMap.length && x >= 0 && x < TerrainMap[0].length) {
                const terrainType = TerrainMap[y][x];
                if (terrainType === 'water') {
                    velocity.x *= 0.5;
                    velocity.y *= 0.5;
                } else if (terrainType === 'rough') {
                    velocity.x *= 0.8;
                    velocity.y *= 0.8;
                }
            }
        },
    },
];