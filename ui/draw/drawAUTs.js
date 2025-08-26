import { Database } from '../../logic/simulator/database/database.js';
import { D_, DB } from '../../debug/DB.js';

export function drawAUTs(ctx, width, height) {
    const arenaWidth = Database.gridConfig.gridWidth * Database.gridConfig.positionScaleFactor;
    const arenaHeight = Database.gridConfig.gridHeight * Database.gridConfig.positionScaleFactor;

    const cellWidth = width / arenaWidth;
    const cellHeight = height / arenaHeight;

    const allAUTs = [...Database.AUTInstances, ...(window.tempAUTPlacements || [])];
    allAUTs.sort((a, b) => b.graphics.size - a.graphics.size);

    const sources = allAUTs.filter(aut => aut.spawn);
    const nonSources = allAUTs.filter(aut => !aut.spawn);

    sources.forEach(aut => drawAUT(aut, ctx, cellWidth, cellHeight));
    nonSources.forEach(aut => drawAUT(aut, ctx, cellWidth, cellHeight));

    D_(DB.DRAW, '[drawAUTs] Finished rendering AUT layer.');
}

// --- Draw helper functions for each shape ---

function drawAUT(aut, ctx, cellWidth, cellHeight, offset = { x: 0, y: 0 }) {
    if (!aut.position || !aut.graphics) {
        D_(DB.DRAW, `[drawAUTs] Skipping AUT due to missing position or graphics.`);
        return;
    }

    // If this is a structure, delegate to drawStructure
    if (aut.type === 'structure') {
        drawStructure(ctx, aut, cellWidth, cellHeight, offset);
        return;
    }

    const { x, y } = aut.position;
    const absX = (x || 0) + (offset.x || 0);
    const absY = (y || 0) + (offset.y || 0);

    const size = aut.graphics.size * Math.min(cellWidth, cellHeight);
    const screenX = absX * cellWidth;
    const screenY = absY * cellHeight;

    ctx.fillStyle = aut.graphics.color || 'black';

    // Decide stroke color before drawing
    let strokeColor = null;
    if (aut.inStructure) {
        strokeColor = 'yellow';
    } else if (aut.bondedTo) {
        strokeColor = 'white';
    }

    if (aut.graphics.shape === 'circle') {
        drawCircle(ctx, screenX, screenY, size, aut.graphics.color, strokeColor);
    } else if (aut.graphics.shape === 'square') {
        drawSquare(ctx, screenX, screenY, size, aut.graphics.color, strokeColor);
    } else if (aut.graphics.shape === 'triangle') {
        drawTriangle(ctx, screenX, screenY, size, aut.graphics.color, strokeColor);
    } else if (aut.graphics.shape === 'hexagon') {
        drawHexagon(ctx, screenX, screenY, size, aut.graphics.color, strokeColor);
    } else {
        D_(DB.DRAW, `[drawAUTs] Unknown shape for AUT at (${absX}, ${absY}):`, aut.graphics.shape);
    }
}

function drawCircle(ctx, screenX, screenY, size, color, strokeColor) {
    ctx.beginPath();
    ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color || 'black';
    ctx.fill();
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawSquare(ctx, screenX, screenY, size, color, strokeColor) {
    ctx.fillStyle = color || 'black';
    ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size);
    }
}

function drawTriangle(ctx, screenX, screenY, size, color, strokeColor) {
    ctx.fillStyle = color || 'black';
    ctx.beginPath();
    ctx.moveTo(screenX, screenY - size / 2);
    ctx.lineTo(screenX - size / 2, screenY + size / 2);
    ctx.lineTo(screenX + size / 2, screenY + size / 2);
    ctx.closePath();
    ctx.fill();
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawHexagon(ctx, screenX, screenY, size, color, strokeColor) {
    ctx.fillStyle = color || 'black';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i;
        const px = screenX + Math.cos(angle) * size / 2;
        const py = screenY + Math.sin(angle) * size / 2;
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// --- Structure draw helper at the bottom ---

function drawStructure(ctx, structure, cellWidth, cellHeight, offset = { x: 0, y: 0 }) {
    // Calculate the absolute position of the structure
    const absX = (structure.position.x || 0) + (offset.x || 0);
    const absY = (structure.position.y || 0) + (offset.y || 0);

    // Optionally, draw a visual marker for the structure itself
    // ctx.save();
    // ctx.globalAlpha = 0.2;
    // drawCircle(ctx, absX * cellWidth, absY * cellHeight, structure.graphics.size * Math.min(cellWidth, cellHeight), null, structure.graphics.color || 'gray');
    // ctx.globalAlpha = 1.0;
    // ctx.restore();

    // Recursively draw children, adding the structure's position as offset
    if (Array.isArray(structure.children)) {
        structure.children.forEach(child => {
            if (child.type === 'structure') {
                drawStructure(ctx, child, cellWidth, cellHeight, { x: absX, y: absY });
            } else {
                drawAUT(child, ctx, cellWidth, cellHeight, { x: absX, y: absY });
            }
        });
    }
}