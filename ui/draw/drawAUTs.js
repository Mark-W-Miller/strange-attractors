import { Database } from '../../logic/simulator/database/database.js';
import { D_, DB } from '../../debug/DB.js';

export function drawAUTs(ctx, width, height) {
    const arenaWidth = Database.gridConfig.gridWidth * Database.gridConfig.positionScaleFactor; // Arena Grid width in cells
    const arenaHeight = Database.gridConfig.gridHeight * Database.gridConfig.positionScaleFactor; // Arena Grid height in cells

    const cellWidth = width / arenaWidth; // Width of an Arena Space cell in pixels
    const cellHeight = height / arenaHeight; // Height of an Arena Space cell in pixels

    // Combine permanent and temporary AUTs, then sort by size (largest first)
    const allAUTs = [...Database.AUTInstances, ...(window.tempAUTPlacements || [])];
    allAUTs.sort((a, b) => b.graphics.size - a.graphics.size);

    // Helper function to draw a single AUT
    const drawAUT = ({ position, graphics, bondedTo }) => {
        if (!position || !graphics) {
            D_(DB.DRAW, `[drawAUTs] Skipping AUT due to missing position or graphics.`);
            return;
        }

        const { x, y } = position;
        D_(DB.DRAW, `[drawAUTs] AUT Details:`, { x, y, graphics });

        const size = graphics.size * Math.min(cellWidth, cellHeight);
        const screenX = x * cellWidth;
        const screenY = y * cellHeight;

        D_(DB.DRAW, `[drawAUTs] Drawing AUT at Arena (${x}, ${y}) -> Canvas (${screenX.toFixed(2)}, ${screenY.toFixed(2)}): size=${size.toFixed(2)}, color=${graphics.color}`);

        ctx.fillStyle = graphics.color || 'black';

        // Draw shape
        if (graphics.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
            ctx.fill();
            if (bondedTo) {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        } else if (graphics.shape === 'square') {
            ctx.fillRect(
                screenX - size / 2,
                screenY - size / 2,
                size,
                size
            );
            if (bondedTo) {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    screenX - size / 2,
                    screenY - size / 2,
                    size,
                    size
                );
            }
        } else if (graphics.shape === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - size / 2);
            ctx.lineTo(screenX - size / 2, screenY + size / 2);
            ctx.lineTo(screenX + size / 2, screenY + size / 2);
            ctx.closePath();
            ctx.fill();
            if (bondedTo) {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        } else {
            D_(DB.DRAW, `[drawAUTs] Unknown shape for AUT at (${x}, ${y}):`, graphics.shape);
        }
    };

    // Draw all AUTs
    allAUTs.forEach(drawAUT);

    D_(DB.DRAW, '[drawAUTs] Finished rendering AUT layer.');
}