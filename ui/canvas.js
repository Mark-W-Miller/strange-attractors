import { EGF, TerrainGrid } from '../logic/grid.js';
import { RenderEngine } from './render/renderEngine.js';
import { GridManager } from './render/gridManager.js';
import { initTerrainEditor, handleTerrainMouseEvents } from './editors/terrainEditor.js';
import { handleEGFMouseEvents } from './editors/egfEditor.js';
import { Debug, DB } from '../debug/DB.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gridConfig, cellSize, offsetX, offsetY, egf, terrainGrid, gridManager, renderEngine;
let activeLayer = 'EGF';
let mousePos = null;
let massEditRadius = 0;

const layerSelect = document.getElementById('layerSelect');
layerSelect.addEventListener('change', (e) => {
    activeLayer = e.target.value;
    Debug.log(DB.MSE, 'Layer changed to:', activeLayer);
});

async function loadGridConfig() {
    Debug.log(DB.RND, 'Loading grid configuration');
    const response = await fetch('data/gridConfig.json');
    gridConfig = await response.json();

    egf = new EGF(gridConfig.gridWidth, gridConfig.gridHeight);
    terrainGrid = new TerrainGrid(gridConfig.gridWidth, gridConfig.gridHeight);
    gridManager = new GridManager(gridConfig.gridWidth, gridConfig.gridHeight);

    const terrainImages = {
        wall: new Image(),
        flat: new Image(),
        rough: new Image(),
        water: new Image()
    };

    for (const type in terrainImages) {
        terrainImages[type].src = `images/terrain/${type}.png`;
    }

    renderEngine = new RenderEngine(canvas, gridConfig, egf, terrainGrid, terrainImages);

    initTerrainEditor(gridConfig);

    resizeCanvas();

    for (let i = 0; i < gridConfig.gridWidth; i++) {
        for (let j = 0; j < gridConfig.gridHeight; j++) {
            gridManager.markDirty(i, j);
        }
    }
    renderCanvas();
}

function resizeCanvas() {
    Debug.log(DB.RND, 'Resizing canvas', { width: canvas.clientWidth, height: canvas.clientHeight });

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    renderEngine.resize(canvas.width, canvas.height);

    cellSize = Math.min(canvas.width / gridConfig.gridWidth, canvas.height / gridConfig.gridHeight);
    offsetX = (canvas.width - cellSize * gridConfig.gridWidth) / 2;
    offsetY = (canvas.height - cellSize * gridConfig.gridHeight) / 2;

    for (let i = 0; i < gridConfig.gridWidth; i++) {
        for (let j = 0; j < gridConfig.gridHeight; j++) {
            gridManager.markDirty(i, j);
        }
    }

    renderCanvas();
}

function renderCanvas() {
    Debug.log(DB.RND, 'Rendering canvas', { cellSize, offsetX, offsetY });

    renderEngine.renderFull(cellSize, offsetX, offsetY);
    renderCursor();
}

function renderCursor() {
    if (!mousePos) return;

    ctx.save();

    const brushShapeSelect = document.getElementById('brushShape');
    ctx.strokeStyle = "rgba(255,0,0,0.6)";
    ctx.lineWidth = 2;

    if (brushShapeSelect.value === 'circle') {
        ctx.beginPath();
        ctx.arc(
            mousePos.x,
            mousePos.y,
            massEditRadius * cellSize + cellSize / 2,
            0,
            2 * Math.PI
        );
        ctx.stroke();
    } else if (brushShapeSelect.value === 'square') {
        ctx.strokeRect(
            mousePos.x - (massEditRadius + 0.5) * cellSize,
            mousePos.y - (massEditRadius + 0.5) * cellSize,
            (massEditRadius * 2 + 1) * cellSize,
            (massEditRadius * 2 + 1) * cellSize
        );
    }

    ctx.restore();
    Debug.log(DB.RND, 'Rendered cursor at', mousePos);
}

function delegateMouseEvent(type, event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const i = Math.floor((mouseX - offsetX) / cellSize);
    const j = Math.floor((mouseY - offsetY) / cellSize);

    mousePos = { x: mouseX, y: mouseY };

    if (activeLayer === 'EGF') {
        handleEGFMouseEvents(type, event, canvas, egf, cellSize, offsetX, offsetY, renderCanvas);
    } else if (activeLayer === 'Terrain') {
        handleTerrainMouseEvents(type, event, canvas, terrainGrid, cellSize, offsetX, offsetY, renderCanvas);
    }

    renderCanvas();
}

canvas.addEventListener('mousedown', (e) => delegateMouseEvent('mousedown', e));
canvas.addEventListener('mouseup', (e) => delegateMouseEvent('mouseup', e));
canvas.addEventListener('mousemove', (e) => delegateMouseEvent('mousemove', e));
canvas.addEventListener('wheel', (e) => delegateMouseEvent('wheel', e));
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('mouseleave', (e) => { mousePos = null; renderCanvas(); });

window.addEventListener('resize', resizeCanvas);

loadGridConfig();