import { Database } from '../../logic/simulator/database/database.js';
import { drawEGF } from './draw/drawEGF.js';
import { drawTerrain } from './draw/drawTerrain.js';
import { drawAUTs } from './draw/drawAUTs.js';
import { drawGVs } from './draw/drawGVs.js'; // Import for Gravity Vectors
import { D_, DB } from '../../debug/DB.js';

export const layers = ['EGF', 'Terrain', 'AUT', 'GV']; // Centralized layers array

export async function initializeCanvas(initializerConfigUrl = '../data/initializers/default.json') {
    D_(DB.DB_INIT, '[Canvas] Initializing canvas...');
    await Database.initialize('../data/gridConfig.json', initializerConfigUrl);
    D_(DB.DB_INIT, '[Canvas] Database initialized.');

    initCanvas();
    D_(DB.DB_INIT, '[Canvas] Canvas initialized.');

    window.addEventListener('resize', handleResize);

    try {
        const handlersModule = await import('./eventHandlers.js');
        handlersModule.setupEventHandlers({ redrawCanvas });
        D_(DB.DB_INIT, '[Canvas] Event handlers set up.');
    } catch (error) {
        D_(DB.DB_INIT, '[Canvas] Failed to load or set up event handlers:', error);
    }

    Database.addChangeListener(() => {
        redrawCanvas(); // Trigger a redraw whenever the Database changes
    });
}

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

    try {
        switch (layer) {
            case 'Terrain':
                drawTerrain(ctx, canvas.width, canvas.height);
                break;
            case 'GV': // Gravity Vectors layer
                drawGVs(ctx, canvas.width, canvas.height); 
                break;
            case 'EGF':
                drawEGF(ctx, canvas.width, canvas.height);
                break;
            case 'AUT':
                drawAUTs(ctx, canvas.width, canvas.height);
                break;
        }
    } catch (error) {
        D_(DB.ERROR, `Error drawing layer ${layer}: ${error.message}`);
    }
}

function handleResize() {
    const container = document.getElementById('gameCanvas');
    const availableWidth = container.clientWidth;
    const availableHeight = container.clientHeight;

    const totalGridWidth = Database.gridConfig.gridWidth;
    const totalGridHeight = Database.gridConfig.gridHeight;
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