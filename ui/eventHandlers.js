// ui/eventHandlers.js
import { redrawCanvas, gridConfig, EGFMap } from './canvas.js';
import { DB } from '../debug/DB.js';

export function setupEventHandlers({ EGFMap, TerrainMap, gridConfig, redrawCanvas }) {
    const gameCanvas = document.getElementById('gameCanvas');
    let selectedBrushShape = 'circle';
    let cursorSize = 20;
    let isMouseDown = false;

    const getCurrentEditMode = () => document.getElementById('layerSelect').value;

    const brushShapeSelect = document.getElementById('brushShape');

    brushShapeSelect.addEventListener('change', (e) => {
        selectedBrushShape = e.target.value; 
        DB(DB.UI, `Brush shape explicitly changed to ${selectedBrushShape}`);
    });


    gameCanvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isMouseDown = true;
        handleEditAt(e, e.button);
    });

    gameCanvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
    
    gameCanvas.addEventListener('wheel', (e) => {
        e.preventDefault(); // prevent page scroll
        cursorSize += Math.sign(e.deltaY); // increase or decrease cursor size explicitly
        cursorSize = Math.max(1, Math.min(cursorSize, 50)); // clamp size explicitly between 1 and 50
        DB(DB.MSE, `Cursor size changed to ${cursorSize}`);
    });

    gameCanvas.addEventListener('mousemove', (e) => {
        const canvasAUT = document.getElementById('canvas-AUT');
        const ctx = canvasAUT.getContext('2d');
        const rect = canvasAUT.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        redrawCanvas();

        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 1;

        if (selectedBrushShape === 'circle') {
            ctx.beginPath();
            ctx.arc(x, y, cursorSize, 0, Math.PI * 2);
            ctx.stroke();
        } else if (selectedBrushShape === 'square') {
            ctx.strokeRect(x - cursorSize / 2, y - cursorSize / 2, cursorSize, cursorSize);
        }

        DB(DB.MSE_MOVED, `Cursor MOVE (${x}, ${y})` + selectedBrushShape);

        if (isMouseDown) {
            let buttonType = null;
            if (e.buttons & 1) buttonType = 0;
            else if (e.buttons & 2) buttonType = 2;

            if (buttonType !== null) {
                handleEditAt(e, buttonType);
            }
        }
    });

    gameCanvas.addEventListener('contextmenu', e => e.preventDefault());

    function handleEditAt(e, buttonType) {
        const editMode = getCurrentEditMode();

        if (editMode === 'EGF') {
            handleEditEGF(e, buttonType);
        } else if (editMode === 'Terrain') {
            handleEditTerrain(e, buttonType);
        } else {
            DB(DB.MSE, `Unsupported edit mode: ${editMode}`);
        }
    }

    function handleEditEGF(e, buttonType) {
        const canvasEGF = document.getElementById('canvas-EGF');
        const rect = canvasEGF.getBoundingClientRect();
        const cellWidth = rect.width / gridConfig.gridWidth;
        const cellHeight = rect.height / gridConfig.gridHeight;

        const x = Math.floor((e.clientX - rect.left) / cellWidth);
        const y = Math.floor((e.clientY - rect.top) / cellHeight);

        if (y >= 0 && y < gridConfig.gridHeight && x >= 0 && x < gridConfig.gridWidth) {
            if (!EGFMap[y]) {
                DB(DB.MSE, `EGF row ${y} explicitly not initialized.`);
                return;
            }

            if (buttonType === 0) {
                EGFMap[y][x] = Math.max(-10, EGFMap[y][x] - 1);
                DB(DB.MSE, `Left-click decreased EGF at (${x}, ${y}) to ${EGFMap[y][x]}`);
            } else if (buttonType === 2) {
                EGFMap[y][x] = Math.min(10, EGFMap[y][x] + 1);
                DB(DB.MSE, `Right-click increased EGF at (${x}, ${y}) to ${EGFMap[y][x]}`);
            }

            redrawCanvas();
        } else {
            DB(DB.MSE, `Out of bounds edit explicitly at (${x}, ${y})`);
        }
    }

    function handleEditTerrain(e, buttonType) {
        if (buttonType !== 0) return;
    
        const terrainTypeSelect = document.getElementById('terrainType');
        const selectedTerrainType = terrainTypeSelect.value;  // explicitly use current selection
    
        const terrainGridWidth = gridConfig.gridWidth / gridConfig.terrainScaleFactor;
        const terrainGridHeight = gridConfig.gridHeight / gridConfig.terrainScaleFactor;
    
        const canvasTerrain = document.getElementById('canvas-Terrain');
        const rect = canvasTerrain.getBoundingClientRect();
        const cellWidth = rect.width / terrainGridWidth;
        const cellHeight = rect.height / terrainGridHeight;
    
        const x = Math.floor((e.clientX - rect.left) / cellWidth);
        const y = Math.floor((e.clientY - rect.top) / cellHeight);
    
        if (y >= 0 && y < terrainGridHeight && x >= 0 && x < terrainGridWidth) {
            if (!TerrainMap[y]) {
                DB(DB.MSE, `Terrain row ${y} explicitly not initialized.`);
                return;
            }
    
            TerrainMap[y][x] = selectedTerrainType;  // explicitly use selected type
    
            DB(DB.MSE, `Edited Terrain explicitly at (${x}, ${y}) with ${selectedTerrainType}`);
            redrawCanvas();
        } else {
            DB(DB.MSE, `Out of bounds edit explicitly at (${x}, ${y})`);
        }
    }
}
