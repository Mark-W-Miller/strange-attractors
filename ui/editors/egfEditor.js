import { D_, DB } from '../../debug/DB.js';
import { selectedBrushShape, cursorSize } from '../eventHandlers.js';
import { redrawCanvas } from '../canvas.js';
import { Database } from '../../logic/simulator/database/database.js';

export function handleEditEGF(e, buttonType) {
    const canvasEGF = document.getElementById('canvas-EGF');
    const rect = canvasEGF.getBoundingClientRect();
    const cellWidth = rect.width / Database.gridConfig.gridWidth;
    const cellHeight = rect.height / Database.gridConfig.gridHeight;

    const centerX = Math.floor((e.clientX - rect.left) / cellWidth);
    const centerY = Math.floor((e.clientY - rect.top) / cellHeight);

    // Adjust radius calculation to handle small cursor sizes
    const radius = Math.max(0, Math.floor(cursorSize / Math.min(cellWidth, cellHeight) / 2));

    for (let y = centerY - radius; y <= centerY + radius; y++) {
        for (let x = centerX - radius; x <= centerX + radius; x++) {
            if (y >= 0 && y < Database.gridConfig.gridHeight && x >= 0 && x < Database.gridConfig.gridWidth) {
                if (!Database.EGFMap[y]) {
                    D_(DB.MSE, `EGF row ${y} explicitly not initialized.`);
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

                if (buttonType === 0) {
                    Database.EGFMap[y][x] = Math.max(0, Database.EGFMap[y][x] - 10); // Decrease value, min 0
                } else if (buttonType === 2) {
                    Database.EGFMap[y][x] = Math.min(255, Database.EGFMap[y][x] + 10); // Increase value, max 255
                }

                D_(DB.MSE, `Edited EGF at (${x}, ${y}) to ${Database.EGFMap[y][x]}`);
            }
        }
    }
    redrawCanvas();
}

