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
                // Draw a red dot for zero-magnitude vectors
                ctx.beginPath();
                ctx.arc(startX, startY, 3, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
                continue;
            }

            const angle = Math.atan2(vector.y, vector.x);

            // Calculate the maximum arrow length based on the circle that fits in the rectangle
            const maxRadius = Math.min(cellWidth, cellHeight) / 2;
            const arrowLength = maxRadius * 0.9; // Slightly reduce to ensure it fits comfortably

            const endX = startX + arrowLength * Math.cos(angle);
            const endY = startY + arrowLength * Math.sin(angle);

            // Calculate opacity based on magnitude (bounded between 0.25 and 1)
            const minOpacity = 0.25; // Minimum opacity
            const maxOpacity = 1;    // Maximum opacity
            const maxMagnitude = 255; // Assuming the maximum magnitude is 255
            const opacity = minOpacity + (vector.magnitude / maxMagnitude) * (maxOpacity - minOpacity);

            // Draw the vector as a red arrow with opacity
            drawArrow(ctx, startX, startY, endX, endY, `rgba(255, 0, 0, ${opacity})`);
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
        ctx.strokeStyle = color; // Use the provided color with opacity
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
        ctx.fillStyle = color; // Use the provided color with opacity
        ctx.fill();
    } catch (error) {
        D_(DB.ERROR, `[drawArrow] Error drawing arrow: ${error.message}`);
    }
}