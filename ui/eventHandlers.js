// ui/eventHandlers.js
import { D_, DB } from '../debug/DB.js';
import { handleEditEGF } from './editors/egfEditor.js';
import { handleEditTerrain } from './editors/terrainEditor.js';
import { updateMouseFeedback } from './controlBar.js';
import { Database } from '../logic/simulator/database/database.js';

export let selectedBrushShape = 'circle';
export let cursorSize = 20;
export let isMouseDown = false;

export function setupEventHandlers({ EGFMap, TerrainMap, gridConfig, redrawCanvas }) {
    const gameCanvas = document.getElementById('gameCanvas');

    const getCurrentEditMode = () => document.getElementById('layerSelect').value;

    const brushShapeSelect = document.getElementById('brushShape');

    brushShapeSelect.addEventListener('change', (e) => {
        selectedBrushShape = e.target.value; 
        D_(DB.UI, `Brush shape explicitly changed to ${selectedBrushShape}`);
    });

    gameCanvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isMouseDown = true;
        handleEditAt(e, e.button);
    });

    function handleEditAt(e, buttonType) {
        const editMode = getCurrentEditMode();

        if (editMode === 'EGF') {
            handleEditEGF(e, buttonType);
        } else if (editMode === 'Terrain') {
            handleEditTerrain(e, buttonType);
        } else if (editMode === 'AUT') {
            handleEditAUT(e, buttonType);
        } else {
            D_(DB.MSE, `Unsupported edit mode: ${editMode}`);
        }
    }

    function handleEditAUT(e, buttonType) {
        const autTypeSelect = document.getElementById('autTypeSelect');
        if (!autTypeSelect) {
            D_(DB.UI, '[EventHandlers] AUT type dropdown not found.');
            return;
        }

        const selectedTypes = Array.from(autTypeSelect.selectedOptions).map(option => option.value);
        if (selectedTypes.length === 0) {
            D_(DB.UI, '[EventHandlers] No AUT types selected.');
            return;
        }

        const canvasAUT = document.getElementById('canvas-AUT');
        const rect = canvasAUT.getBoundingClientRect();

        // Calculate pixel coordinates
        const pixelX = e.clientX - rect.left;
        const pixelY = e.clientY - rect.top;

        // Find the largest AUT type among the selected types
        let largestAUTSize = 0;
        selectedTypes.forEach(typeName => {
            const type = Database.AUTTypes[typeName];
            if (type && type.size > largestAUTSize) {
                largestAUTSize = type.size;
            }
        });

        // Check if the new position overlaps with any existing AUTs
        const doesOverlap = Database.AUTInstances.some(({ x, y }) => {
            const distance = Math.sqrt((x - pixelX) ** 2 + (y - pixelY) ** 2);
            return distance < largestAUTSize; // Overlap if distance is less than the largest AUT size
        });

        if (doesOverlap) {
            D_(DB.UI, `[EventHandlers] Skipping placement at (${pixelX}, ${pixelY}) due to overlap.`);
            return;
        }

        // Place the AUTs at the new position
        selectedTypes.forEach(typeName => {
            Database.addAUTInstance(typeName, pixelX, pixelY);
        });

        D_(DB.UI, `[EventHandlers] Placed AUTs at pixel coordinates (${pixelX}, ${pixelY}):`, selectedTypes);
        redrawCanvas();
    }

    gameCanvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    gameCanvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cursorSize += Math.sign(e.deltaY) * 6;
        cursorSize = Math.max(1, Math.min(cursorSize, 500));
        D_(DB.MSE, `Cursor size changed to ${cursorSize}`);
    
        // Immediately redraw cursor after size change
        const event = new MouseEvent('mousemove', {
            clientX: e.clientX,
            clientY: e.clientY
        });
        gameCanvas.dispatchEvent(event);
    });

    gameCanvas.addEventListener('mousemove', (e) => {
        const canvasAUT = document.getElementById('canvas-AUT');
        const ctx = canvasAUT.getContext('2d');
        const rect = canvasAUT.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Redraw the canvas
        redrawCanvas();

        // Draw the cursor
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 1;

        if (selectedBrushShape === 'circle') {
            ctx.beginPath();
            ctx.arc(x, y, cursorSize, 0, Math.PI * 2);
            ctx.stroke();
        } else if (selectedBrushShape === 'square') {
            ctx.strokeRect(x - cursorSize / 2, y - cursorSize / 2, cursorSize, cursorSize);
        } else if (selectedBrushShape === 'crosshair') {
            ctx.beginPath();
            ctx.moveTo(x - cursorSize / 2, y);
            ctx.lineTo(x + cursorSize / 2, y);
            ctx.moveTo(x, y - cursorSize / 2);
            ctx.lineTo(x, y + cursorSize / 2);
            ctx.stroke();
        }

        // Update mouse feedback
        updateMouseFeedback(e);

        // Handle editing if the mouse is down
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
}