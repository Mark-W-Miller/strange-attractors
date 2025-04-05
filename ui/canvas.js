// ui/canvas.js
import { DB } from '../debug/DB.js';

const layers = ['EGF', 'Terrain', 'AUT'];

let gridConfig;
let EGFMap = [];
let TerrainMap = [];

fetch('../data/gridConfig.json')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
    })
    .then(config => {
        gridConfig = config;
        DB.initializeForDebug(gridConfig, EGFMap, TerrainMap);
        initCanvas(); // Initialize explicitly after config loaded
        window.addEventListener('resize', handleResize); // Explicitly attach resize after config
    })
    .catch(err => console.error('Failed to load gridConfig:', err));

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
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    }
}

function drawEGF(ctx, width, height) {
    const { gridWidth, gridHeight } = gridConfig;
    const cellWidth = width / gridWidth;
    const cellHeight = height / gridHeight;

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const arv = EGFMap[y][x];
            const normalized = (arv + 10) / 20;
            const shade = Math.floor(255 * normalized);
            ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
    }
}

function drawTerrain(ctx, width, height) {
    const { gridWidth, gridHeight, terrainScaleFactor, terrainOpacity } = gridConfig;
    const terrainGridWidth = gridWidth / terrainScaleFactor;
    const terrainGridHeight = gridHeight / terrainScaleFactor;
    const cellWidth = width / terrainGridWidth;
    const cellHeight = height / terrainGridHeight;

    ctx.fillStyle = `rgba(139,69,19,${terrainOpacity})`;

    for (let y = 0; y < terrainGridHeight; y++) {
        for (let x = 0; x < terrainGridWidth; x++) {
            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
    }
}

function drawAUTs(ctx, width, height) {
    ctx.fillStyle = 'rgba(0,128,255,0.7)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 10, 0, Math.PI * 2);
    ctx.fill();
}

// Explicit resize handler
function handleResize() {
    const container = document.getElementById('gameCanvas');
    const width = container.clientWidth;
    const height = container.clientHeight;

    layers.forEach(layer => {
        const canvas = document.getElementById(`canvas-${layer}`);
        if (canvas) {
            canvas.width = width;
            canvas.height = height;
        }
    });

    redrawCanvas();
}

// Explicit initialization after config loads
function initCanvas() {
    handleResize();
    redrawCanvas();
}