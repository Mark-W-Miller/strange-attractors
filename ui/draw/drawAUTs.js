import { Database } from '../../logic/simulator/database/database.js';

export function drawAUTs(ctx, width, height) {
    const { gridWidth, gridHeight } = Database.gridConfig;
    const cellWidth = width / gridWidth;
    const cellHeight = height / gridHeight;

    Database.AUTInstances.forEach(({ x, y, properties }) => {
        const { graphics } = properties;
        const centerX = x * cellWidth + cellWidth / 2;
        const centerY = y * cellHeight + cellHeight / 2;

        ctx.fillStyle = graphics.color || 'black';

        if (graphics.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(centerX, centerY, Math.min(cellWidth, cellHeight) / 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (graphics.shape === 'square') {
            const size = Math.min(cellWidth, cellHeight) / 2;
            ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
        } else if (graphics.shape === 'triangle') {
            const size = Math.min(cellWidth, cellHeight) / 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - size / 2);
            ctx.lineTo(centerX - size / 2, centerY + size / 2);
            ctx.lineTo(centerX + size / 2, centerY + size / 2);
            ctx.closePath();
            ctx.fill();
        }
    });
}