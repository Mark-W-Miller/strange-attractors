import { Database } from '../../logic/simulator/database/database.js';
import { D_, DB } from '../../debug/DB.js';

export function drawGVs(ctx, width, height) {
    const { gridWidth, gridHeight } = Database.gridConfig;

    const cellWidth = width / gridWidth;
    const cellHeight = height / gridHeight;

    for (let y = 0; y < gridHeight; y++) {
        if (!Database.GravityVectorArray[y]) {
            D_(DB.ERROR, `[drawGVs] GravityVectorArray row ${y} is undefined.`);
            continue;
        }

        for (let x = 0; x < gridWidth; x++) {
            const vector = Database.GravityVectorArray[y][x];
            if (!vector) {
                D_(DB.ERROR, `[drawGVs] GravityVectorArray[${y}][${x}] is undefined.`);
                continue;
            }

            const startX = x * cellWidth + cellWidth / 2;
            const startY = y * cellHeight + cellHeight / 2;

            if (vector.magnitude === 0) {
                // Draw a blue dot for zero-magnitude vectors
                ctx.beginPath();
                ctx.arc(startX, startY, 3, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.fill();
                continue;
            }

            const angle = Math.atan2(vector.y, vector.x);
            const arrowLength = Math.min(cellWidth, cellHeight) / 2 - 5;

            const endX = startX + arrowLength * Math.cos(angle);
            const endY = startY + arrowLength * Math.sin(angle);

            // Draw the vector as an orange arrow
            drawArrow(ctx, startX, startY, endX, endY, 'orange');
        }
    }
}

// Helper function to draw an arrow
function drawArrow(ctx, startX, startY, endX, endY, color) {
    const arrowHeadLength = 10; // Length of the arrowhead
    const angle = Math.atan2(endY - startY, endX - startX);

    try {
        // Draw the line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = color; // Use the provided color
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw the arrowhead
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
            endY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
            endY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = color; // Use the provided color
        ctx.fill();
    } catch (error) {
        D_(DB.ERROR, `[drawArrow] Error drawing arrow: ${error.message}`);
    }
}