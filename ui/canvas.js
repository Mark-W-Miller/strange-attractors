// ui/canvas.js
import { DB } from '../debug/DB.js';

const layers = ['EGF', 'Terrain', 'AUT'];

export function redrawCanvas() {
    DB(DB.RND, "Redrawing explicitly all visible layers.");
    layers.forEach(layer => {
        const canvas = document.getElementById(`canvas-${layer}`);
        if (canvas && canvas.style.display !== 'none') {
            drawLayer(layer);
        }
    });
}

function drawLayer(layer) {
    const canvas = document.getElementById(`canvas-${layer}`);
    if (!canvas) {
        DB(DB.RND, `Canvas for layer "${layer}" explicitly not found.`);
        return;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    DB(DB.RND, `Drawing explicitly layer: ${layer}`);

    switch (layer) {
        case 'EGF':
            drawEGF(ctx, canvas.width, canvas.height);
            break;
        case 'Terrain':
            drawTerrain(ctx, canvas.width, canvas.height);
            break;
        case 'AUT':
            drawAUTs(ctx, canvas.width, canvas.height);
            break;
        default:
            DB(DB.RND, `No explicit drawing method for layer "${layer}"`);
    }
}

function drawEGF(ctx, width, height) {
    DB(DB.RND, "Drawing explicitly the EGF layer.");

    // Example explicit EGF grid drawing
    const cellSize = 20;
    ctx.strokeStyle = '#ccc';
    for (let x = 0; x <= width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y <= height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawTerrain(ctx, width, height) {
    DB(DB.RND, "Drawing explicitly the Terrain layer.");

    // Explicit terrain example (grid-aligned squares)
    const cellSize = 20;
    ctx.fillStyle = 'rgba(139,69,19,0.5)'; // brownish color

    for (let x = 0; x < width; x += cellSize * 2) {
        for (let y = 0; y < height; y += cellSize * 2) {
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }
}

function drawAUTs(ctx, width, height) {
    DB(DB.RND, "Drawing explicitly the AUTs layer.");

    // Explicit placeholder for AUT rendering
    ctx.fillStyle = 'rgba(0,128,255,0.7)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 10, 0, Math.PI * 2);
    ctx.fill();
}

// Explicit resize handler for alignment
function handleResize() {
    const container = document.getElementById('gameCanvas');
    const width = container.clientWidth;
    const height = container.clientHeight;

    layers.forEach(layer => {
        const canvas = document.getElementById(`canvas-${layer}`);
        if (canvas) {
            canvas.width = width;
            canvas.height = height;
            DB(DB.RND, `Canvas explicitly resized: ${layer} (${width}x${height})`);
        }
    });

    redrawCanvas();
}

// Explicit initial setup
function initCanvas() {
    handleResize();
    redrawCanvas();
}

// Explicitly add event listeners
window.addEventListener('resize', handleResize);
document.addEventListener('DOMContentLoaded', initCanvas);