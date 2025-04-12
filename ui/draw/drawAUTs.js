import { Database } from '../../logic/simulator/database/database.js';
import { D_, DB } from '../../debug/DB.js';

export function drawAUTs(ctx, width, height) {
    const arenaWidth = Database.gridConfig.gridWidth * Database.gridConfig.positionScaleFactor; // Arena Grid width in cells
    const arenaHeight = Database.gridConfig.gridHeight * Database.gridConfig.positionScaleFactor; // Arena Grid height in cells

    const cellWidth = width / arenaWidth; // Width of an Arena Space cell in pixels
    const cellHeight = height / arenaHeight; // Height of an Arena Space cell in pixels

    D_(DB.DRAW, `[drawAUTs] Canvas dimensions: width=${width}, height=${height}`);
    D_(DB.DRAW, `[drawAUTs] Arena dimensions: arenaWidth=${arenaWidth}, arenaHeight=${arenaHeight}`);
    D_(DB.DRAW, `[drawAUTs] Cell dimensions: cellWidth=${cellWidth.toFixed(2)}, cellHeight=${cellHeight.toFixed(2)}`);

    // Helper function to draw a single AUT
    const drawAUT = ({ posX, posY, properties }) => {
        const { graphics } = properties;

        if (!graphics) {
            D_(DB.DRAW, `[drawAUTs] Skipping AUT at (${posX}, ${posY}) due to missing graphics.`);
            return;
        }

        const size = graphics.size * Math.min(cellWidth, cellHeight); // Scale size from Arena Space to Canvas Space
        const screenX = posX * cellWidth; // Translate posX from Arena Space to Canvas Space
        const screenY = posY * cellHeight; // Translate posY from Arena Space to Canvas Space

        D_(DB.DRAW, `[drawAUTs] Drawing AUT at Arena (${posX}, ${posY}) -> Canvas (${screenX.toFixed(2)}, ${screenY.toFixed(2)}): size=${size.toFixed(2)}, color=${graphics.color}`);

        ctx.fillStyle = graphics.color || 'black';

        if (graphics.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (graphics.shape === 'square') {
            ctx.fillRect(
                screenX - size / 2,
                screenY - size / 2,
                size,
                size
            );
        } else if (graphics.shape === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - size / 2);
            ctx.lineTo(screenX - size / 2, screenY + size / 2);
            ctx.lineTo(screenX + size / 2, screenY + size / 2);
            ctx.closePath();
            ctx.fill();
        } else {
            D_(DB.DRAW, `[drawAUTs] Unknown shape for AUT at (${posX}, ${posY}):`, graphics.shape);
        }
    };

    // Draw permanent AUTs
    Database.AUTInstances.forEach(drawAUT);

    // Draw temporary AUTs
    (window.tempAUTPlacements || []).forEach(drawAUT);

    D_(DB.DRAW, '[drawAUTs] Finished rendering AUT layer.');
}