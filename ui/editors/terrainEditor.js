import { TerrainGrid } from '../../logic/grid.js';

let mouseIsDown = false, mouseButton, lastCellKey, massEditRadius = 0;
let mousePos = null, terrainGrid, terrainTypeSelect, brushShapeSelect;

export function initTerrainEditor(config) {
    terrainGrid = new TerrainGrid(config.gridWidth, config.gridHeight);
    terrainTypeSelect = document.getElementById('terrainType');
    brushShapeSelect = document.getElementById('brushShape');
}

export function handleTerrainMouseEvents(type, event, canvas, cellSize, offsetX, offsetY, renderCanvas) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const i = Math.floor((mouseX - offsetX) / cellSize);
    const j = Math.floor((mouseY - offsetY) / cellSize);
    const cellKey = `${i},${j}`;

    if (type === 'mousedown') {
        mouseIsDown = true;
        mouseButton = event.button;
        applyTerrainEdit(i, j);
        renderCanvas();
    } else if (type === 'mouseup') {
        mouseIsDown = false;
        lastCellKey = null;
    } else if (type === 'mousemove') {
        mousePos = { x: mouseX, y: mouseY };
        if (mouseIsDown && cellKey !== lastCellKey) {
            applyTerrainEdit(i, j);
            lastCellKey = cellKey;
        }
        renderCanvas();
    } else if (type === 'wheel' && !mouseIsDown) {
        event.preventDefault();
        massEditRadius = Math.max(0, massEditRadius + (event.deltaY < 0 ? 1 : -1));
        renderCanvas();
    } else if (type === 'mouseleave') {
        mousePos = null;
        renderCanvas();
    }
}

function applyTerrainEdit(centerI, centerJ) {
    const shape = brushShapeSelect.value;
    const type = terrainTypeSelect.value;

    for (let di = -massEditRadius; di <= massEditRadius; di++) {
        for (let dj = -massEditRadius; dj <= massEditRadius; dj++) {
            if (shape === 'circle' && (di ** 2 + dj ** 2 > massEditRadius ** 2)) continue;

            const i = centerI + di, j = centerJ + dj;
            terrainGrid.setTerrain(i, j, type);
        }
    }
}

export function renderTerrain(ctx, cellSize, offsetX, offsetY) {
    for (let i = 0; i < terrainGrid.width; i++) {
        for (let j = 0; j < terrainGrid.height; j++) {
            const type = terrainGrid.getTerrain(i, j);
            const img = new Image();
            img.src = `images/terrain/${type}.png`;
            img.onload = () => ctx.drawImage(img, offsetX + i * cellSize, offsetY + j * cellSize, cellSize, cellSize);
        }
    }

    if (mousePos) {
        ctx.strokeStyle = "rgba(0,100,255,0.6)";
        ctx.lineWidth = 2;
        if (brushShapeSelect.value === 'circle') {
            ctx.beginPath();
            ctx.arc(mousePos.x, mousePos.y, massEditRadius * cellSize + cellSize / 2, 0, 2 * Math.PI);
            ctx.stroke();
        } else {
            ctx.strokeRect(
                mousePos.x - (massEditRadius + 0.5) * cellSize,
                mousePos.y - (massEditRadius + 0.5) * cellSize,
                (massEditRadius * 2 + 1) * cellSize,
                (massEditRadius * 2 + 1) * cellSize
            );
        }
    }
}