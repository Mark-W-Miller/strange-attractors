import { DB } from '../debug/DB.js';
import { drawEGF } from './editors/egfEditor.js';
import { drawTerrain } from './editors/terrainEditor.js';
import { drawAUTs } from './editors/autEditor.js';


export const layers = ['EGF', 'Terrain', 'AUT']; // explicitly define layers
export let gridConfig;
export let EGFMap = [];
export let TerrainMap = [];
export const terrainTypes = ['flat', 'wall', 'rough', 'water'];
export const terrainImages = {};

fetch('../data/gridConfig.json')
    .then(response => response.json())
    .then(async (config) => {
        gridConfig = config;
        await DB.initializeForDebug(gridConfig, EGFMap, TerrainMap);
        initCanvas();
        window.addEventListener('resize', handleResize);

        const handlersModule = await import('./eventHandlers.js');
        handlersModule.setupEventHandlers({ EGFMap, TerrainMap, gridConfig, redrawCanvas });
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




terrainTypes.forEach(type => {
    terrainImages[type] = new Image();
    terrainImages[type].src = `../images/terrain/${type}.png`;

    // Explicit error logging
    terrainImages[type].onerror = () => {
        console.error(`Failed to explicitly load image: ${terrainImages[type].src}`);
        DB(DB.INIT, `Image failed to load explicitly: ${terrainImages[type].src}`);
    };
});



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