import { Database } from '../../logic/simulator/database/database.js';
import { D_, DB } from '../../debug/DB.js';

export function drawAUTs(ctx, width, height) {
    D_(DB.DRAW, '[drawAUTs] Starting AUT layer drawing...');
    D_(DB.DRAW, '[drawAUTs] Canvas dimensions:', { width, height });

    Database.AUTInstances.forEach(({ x, y, properties }) => {
        const { graphics } = properties;

        // Default size if not specified
        const size = graphics.size || 10;

        ctx.fillStyle = graphics.color || 'black';

        if (graphics.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2); // Use size as radius
            ctx.fill();
        } else if (graphics.shape === 'square') {
            const diameter = size * 2; // Convert size to diameter
            ctx.fillRect(x - diameter / 2, y - diameter / 2, diameter, diameter); // Use diameter as width and height
        } else if (graphics.shape === 'triangle') {
            const diameter = size * 2; // Convert size to diameter
            ctx.beginPath();
            ctx.moveTo(x, y - diameter / 2); // Top vertex
            ctx.lineTo(x - diameter / 2, y + diameter / 2); // Bottom-left vertex
            ctx.lineTo(x + diameter / 2, y + diameter / 2); // Bottom-right vertex
            ctx.closePath();
            ctx.fill();
        } else {
            D_(DB.DRAW, `[drawAUTs] Unknown shape for AUT at (${x}, ${y}):`, graphics.shape);
        }

        D_(DB.DRAW, `[drawAUTs] Rendered AUT at (${x}, ${y}) with size=${size} and properties:`, properties);
    });

    D_(DB.DRAW, '[drawAUTs] Finished AUT layer drawing.');
}