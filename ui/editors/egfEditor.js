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

    const radius = Math.max(0, Math.floor(cursorSize / Math.min(cellWidth, cellHeight) / 2));

    for (let y = centerY - radius; y <= centerY + radius; y++) {
        for (let x = centerX - radius; x <= centerX + radius; x++) {
            if (y >= 0 && y < Database.gridConfig.gridHeight && x >= 0 && x < Database.gridConfig.gridWidth) {
                // Square brush logic
                if (selectedBrushShape === 'square') {
                    const withinSquare = Math.abs(x - centerX) <= radius && Math.abs(y - centerY) <= radius;
                    if (!withinSquare) continue;
                }

                // Circle brush logic
                if (selectedBrushShape === 'circle') {
                    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    if (distance > radius) continue;
                }

                try {
                    const currentValue = Database.getEGFValue(x, y);
                    if (buttonType === 0) {
                        Database.setEGFValue(x, y, Math.max(0, currentValue - 10)); // Decrease value
                    } else if (buttonType === 2) {
                        Database.setEGFValue(x, y, Math.min(255, currentValue + 10)); // Increase value
                    }
                } catch (error) {
                    D_(DB.MSE, error.message);
                }
            }
        }
    }
}

