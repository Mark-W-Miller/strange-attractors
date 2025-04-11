import { Database } from '../../logic/simulator/database/database.js';
import { DB } from '../../debug/DB.js';

export function drawTerrain(ctx, width, height) {
    const { gridWidth, gridHeight, terrainScaleFactor, terrainOpacity, gridLineColors } = Database.gridConfig;
    const terrainGridWidth = gridWidth / terrainScaleFactor;
    const terrainGridHeight = gridHeight / terrainScaleFactor;
    const cellWidth = width / terrainGridWidth;
    const cellHeight = height / terrainGridHeight;

    DB(DB.DRAW, '[drawTerrain] Starting Terrain layer drawing...');
    DB(DB.DRAW, '[drawTerrain] Terrain grid dimensions:', { terrainGridWidth, terrainGridHeight, cellWidth, cellHeight });

    ctx.globalAlpha = terrainOpacity;

    // Draw terrain cells
    for (let y = 0; y < terrainGridHeight; y++) {
        for (let x = 0; x < terrainGridWidth; x++) {
            const terrainType = Database.TerrainMap[y][x];
            const terrainImage = Database.terrainImages[terrainType];
            if (terrainImage) {
                ctx.drawImage(terrainImage, x * cellWidth, y * cellHeight, cellWidth, cellHeight);
            } else {
                ctx.fillStyle = 'gray'; // Fallback color
                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
            }
        }
    }

    ctx.globalAlpha = 1.0;

    // Draw gridlines on top
    ctx.strokeStyle = gridLineColors.Terrain || '#AAAAAA';
    ctx.lineWidth = 1;

    for (let x = 0; x <= terrainGridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellWidth, 0);
        ctx.lineTo(x * cellWidth, terrainGridHeight * cellHeight);
        ctx.stroke();
    }

    for (let y = 0; y <= terrainGridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellHeight);
        ctx.lineTo(terrainGridWidth * cellWidth, y * cellHeight);
        ctx.stroke();
    }

    DB(DB.DRAW, '[drawTerrain] Finished Terrain layer drawing.');
}