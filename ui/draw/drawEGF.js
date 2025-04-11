import { Database } from '../../logic/simulator/database/database.js';

export function drawEGF(ctx, width, height) {
    const { gridWidth, gridHeight, gridLineColors } = Database.gridConfig;
    const cellSize = Math.min(width / gridWidth, height / gridHeight);

    // Draw grayscale based on EGFMap values
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const arv = Database.EGFMap[y][x]; // Use EGFMap values directly (0 to 255)
            ctx.fillStyle = `rgb(${arv},${arv},${arv})`;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    // Draw gridlines on top
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