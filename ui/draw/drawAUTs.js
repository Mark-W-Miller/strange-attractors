import { Database } from '../../logic/simulator/database/database.js';
import { D_, DB } from '../../debug/DB.js';

export function drawAUTs(ctx, width, height) {
    D_(DB.DRAW, '[drawAUTs] Starting AUT layer drawing...');
    D_(DB.DRAW, '[drawAUTs] Canvas dimensions:', { width, height });

    Database.AUTInstances.forEach(({ x, y, properties }) => {
        const { graphics } = properties;

        ctx.fillStyle = graphics.color || 'black';

        if (graphics.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2); // Draw circle at pixel coordinates
            ctx.fill();
        } else if (graphics.shape === 'square') {
            const size = 20;
            ctx.fillRect(x - size / 2, y - size / 2, size, size); // Draw square at pixel coordinates
        } else if (graphics.shape === 'triangle') {
            const size = 20;
            ctx.beginPath();
            ctx.moveTo(x, y - size / 2);
            ctx.lineTo(x - size / 2, y + size / 2);
            ctx.lineTo(x + size / 2, y + size / 2);
            ctx.closePath();
            ctx.fill();
        }

        D_(DB.DRAW, `[drawAUTs] Rendered AUT at (${x}, ${y}) with properties:`, properties);
    });

    D_(DB.DRAW, '[drawAUTs] Finished AUT layer drawing.');
}