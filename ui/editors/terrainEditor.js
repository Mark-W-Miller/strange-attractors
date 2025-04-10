import { DB } from '../../debug/DB.js';
import { TerrainGrid } from '../../logic/grid.js';
import { selectedBrushShape, cursorSize } from '../eventHandlers.js';
import { redrawCanvas } from '../canvas.js';
import { Database } from '../../logic/simulator/database/database.js';

let mouseIsDown = false, mouseButton, lastCellKey, massEditRadius = 0;
let mousePos = null, terrainGrid, terrainTypeSelect, brushShapeSelect;

export function initTerrainEditor(config) {
    terrainGrid = new TerrainGrid(config.gridWidth, config.gridHeight);
    terrainTypeSelect = document.getElementById('terrainType');
    brushShapeSelect = document.getElementById('brushShape');
}

export function handleEditTerrain(e, buttonType) {
    if (buttonType !== 0) return;

    const terrainTypeSelect = document.getElementById('terrainType');
    const selectedTerrainType = terrainTypeSelect.value;

    const terrainGridWidth = Database.gridConfig.gridWidth / Database.gridConfig.terrainScaleFactor;
    const terrainGridHeight = Database.gridConfig.gridHeight / Database.gridConfig.terrainScaleFactor;

    const canvasTerrain = document.getElementById('canvas-Terrain');
    const rect = canvasTerrain.getBoundingClientRect();
    const cellWidth = rect.width / terrainGridWidth;
    const cellHeight = rect.height / terrainGridHeight;

    const centerX = Math.floor((e.clientX - rect.left) / cellWidth);
    const centerY = Math.floor((e.clientY - rect.top) / cellHeight);

    // Adjust radius calculation to handle small cursor sizes
    const radius = Math.max(0, Math.floor(cursorSize / Math.min(cellWidth, cellHeight) / 2));

    for (let y = centerY - radius; y <= centerY + radius; y++) {
        for (let x = centerX - radius; x <= centerX + radius; x++) {
            if (y >= 0 && y < terrainGridHeight && x >= 0 && x < terrainGridWidth) {
                if (!Database.TerrainMap[y]) {
                    DB(DB.MSE, `Terrain row ${y} explicitly not initialized.`);
                    continue;
                }

                // Square brush logic: Ensure only cells within the square are edited
                if (selectedBrushShape === 'square') {
                    const withinSquare = Math.abs(x - centerX) <= radius && Math.abs(y - centerY) <= radius;
                    if (!withinSquare) continue;
                }

                // Circle brush logic: Ensure only cells within the circle are edited
                if (selectedBrushShape === 'circle') {
                    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    if (distance > radius) continue;
                }

                Database.TerrainMap[y][x] = selectedTerrainType;

                DB(DB.MSE, `Edited Terrain at (${x}, ${y}) with ${selectedTerrainType}`);
            }
        }
    }

    redrawCanvas();
}

export function drawTerrain(ctx, width, height) {
    const { gridWidth, gridHeight, terrainScaleFactor, terrainOpacity } = Database.gridConfig;
    const terrainGridWidth = gridWidth / terrainScaleFactor;
    const terrainGridHeight = gridHeight / terrainScaleFactor;
    const cellWidth = width / terrainGridWidth;
    const cellHeight = height / terrainGridHeight;

    for (let y = 0; y < terrainGridHeight; y++) {
        for (let x = 0; x < terrainGridWidth; x++) {
            const terrainType = Database.TerrainMap[y][x];
            const img = Database.terrainImages[terrainType];

            if (!img || !img.complete) {
                DB(DB.RND, `[drawTerrain] Missing or incomplete image for terrain type: ${terrainType}`);
                ctx.fillStyle = `rgba(204, 204, 204, ${terrainOpacity})`; // Fallback color with opacity
                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                continue;
            }

            // Save the current context state
            ctx.save();

            // Apply opacity
            ctx.globalAlpha = terrainOpacity;

            // Draw the terrain image
            ctx.drawImage(img, x * cellWidth, y * cellHeight, cellWidth, cellHeight);

            // Restore the context state
            ctx.restore();
        }
    }
}
