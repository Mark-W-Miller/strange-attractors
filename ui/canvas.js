// ui/canvas.js
import { DB } from '../debug/DB.js';

const layers = ['EGF', 'Terrain', 'AUT'];


// canvas.js
export let gridConfig;
export let EGFMap = [];
export let TerrainMap = [];

fetch('../data/gridConfig.json')
    .then(response => response.json())
    .then(async (config) => {
        gridConfig = config;
        
        await DB.initializeForDebug(gridConfig, EGFMap, TerrainMap); // explicitly await
        
        await import('./eventHandlers.js'); // explicitly import AFTER initialization
        initCanvas();
        window.addEventListener('resize', handleResize);
    })
    .catch(err => console.error('Failed to load gridConfig:', err));
    
export function redrawCanvas() {
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
    const { gridWidth, gridHeight, gridLineColors } = gridConfig;
    const cellSize = Math.min(width / gridWidth, height / gridHeight);

    // Draw grayscale explicitly based on ARV from EGFMap
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const arv = EGFMap[y][x];  // explicitly use EGFMap ARV values
            const normalized = (arv + 10) / 20; // explicitly normalize -10..+10 ARV to 0..1
            const shade = Math.floor(normalized * 255);
            ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    // Then explicitly draw gridlines on top
    ctx.strokeStyle = gridLineColors.EGF || '#CCCCCC';
    ctx.lineWidth = 1;

    for (let x = 0; x <= gridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, gridHeight * cellSize);
        ctx.stroke();
    }

    for (let y = 0; y <= gridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(gridWidth * cellSize, y * cellSize);
        ctx.stroke();
    }
}

function drawTerrain(ctx, width, height) {
    const { gridWidth, gridHeight, terrainScaleFactor, terrainOpacity, gridLineColors } = gridConfig;
    const terrainGridWidth = gridWidth / terrainScaleFactor;
    const terrainGridHeight = gridHeight / terrainScaleFactor;
    const cellSize = Math.min(width / terrainGridWidth, height / terrainGridHeight);

    ctx.fillStyle = `rgba(139,69,19,${terrainOpacity})`;
    ctx.strokeStyle = gridLineColors.Terrain || '#AAAAAA';
    ctx.lineWidth = 5; // <-- explicitly set desired thickness here

    for (let y = 0; y < terrainGridHeight; y++) {
        for (let x = 0; x < terrainGridWidth; x++) {
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function drawAUTs(ctx, width, height) {
    const cellSize = Math.min(width, height) / Math.max(gridConfig.gridWidth, gridConfig.gridHeight);

    ctx.fillStyle = 'rgba(0,128,255,0.7)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, cellSize / 2, 0, Math.PI * 2);
    ctx.fill();
}

// Resize explicitly to maintain perfect square grid cells
function handleResize() {
    const container = document.getElementById('gameCanvas');
    const availableWidth = container.clientWidth;
    const availableHeight = container.clientHeight;

    const totalGridWidth = gridConfig.gridWidth;
    const totalGridHeight = gridConfig.gridHeight;
    const cellSize = Math.min(
        availableWidth / totalGridWidth,
        availableHeight / totalGridHeight
    );

    const canvasWidth = cellSize * totalGridWidth;
    const canvasHeight = cellSize * totalGridHeight;

    layers.forEach(layer => {
        const canvas = document.getElementById(`canvas-${layer}`);
        if (canvas) {
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            canvas.style.position = 'absolute';
            canvas.style.left = `${(availableWidth - canvasWidth) / 2}px`;
            canvas.style.top = `${(availableHeight - canvasHeight) / 2}px`;
        }
    });

    redrawCanvas();
}

function initCanvas() {
    handleResize();
    redrawCanvas();
}