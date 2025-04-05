// ui/canvas.js
import { DB } from '../debug/DB.js';
import gridConfig from '../gridConfig.json';

const layers = ['EGF', 'Terrain', 'AUT'];

// Explicitly use gridConfig
const {
    gridWidth,
    gridHeight,
    terrainScaleFactor
} = gridConfig;

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

    const cellWidth = width / gridWidth;
    const cellHeight = height / gridHeight;

    ctx.strokeStyle = '#aaa';
    for (let x = 0; x <= gridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellWidth, 0);
        ctx.lineTo(x * cellWidth, height);
        ctx.stroke();
    }

    for (let y = 0; y <= gridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellHeight);
        ctx.lineTo(width, y * cellHeight);
        ctx.stroke();
    }
}

function drawTerrain(ctx, width, height) {
    DB(DB.RND, "Drawing explicitly the Terrain layer.");

    // Explicitly calculate the terrain grid size
    const terrainGridWidth = gridWidth / terrainScaleFactor;
    const terrainGridHeight = gridHeight / terrainScaleFactor;

    const cellWidth = width / terrainGridWidth;
    const cellHeight = height / terrainGridHeight;

    ctx.fillStyle = 'rgba(139,69,19,0.5)';
    for (let x = 0; x < terrainGridWidth; x++) {
        for (let y = 0; y < terrainGridHeight; y++) {
            if ((x + y) % 2 === 0) {
                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
            }
        }
    }
}

function drawAUTs(ctx, width, height) {
    DB(DB.RND, "Drawing explicitly the AUTs layer.");

    // Placeholder example
    ctx.fillStyle = 'rgba(0,128,255,0.7)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 10, 0, Math.PI * 2);
    ctx.fill();
}

// Explicit resize handler for perfect alignment
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