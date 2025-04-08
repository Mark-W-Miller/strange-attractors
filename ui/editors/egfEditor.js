import { DB } from '../../debug/DB.js';
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
                    DB(DB.MSE, `EGF row ${y} explicitly not initialized.`);
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

                DB(DB.MSE, `Edited EGF at (${x}, ${y}) to ${Database.EGFMap[y][x]}`);
            }
        }
    }
    redrawCanvas();
}

export function drawEGF(ctx, width, height) {
    const { gridWidth, gridHeight, gridLineColors } = Database.gridConfig;
    const cellSize = Math.min(width / gridWidth, height / gridHeight);

    // Draw grayscale explicitly based on ARV from EGFMap
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const arv = Database.EGFMap[y][x]; // Use EGFMap values directly (0 to 255)
            ctx.fillStyle = `rgb(${arv},${arv},${arv})`;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    // Then explicitly draw gridlines on top
    ctx.strokeStyle = gridLineColors.EGF || '#CCCCCC';
    ctx.lineWidth = 1;

    for (let x = 0; x <= gridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, gridHeight * cellSize);
        ctx.stroke();
    }

    for (let y = 0; y <= gridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(gridWidth * cellSize, y * cellSize);
        ctx.stroke();
    }
}
