import { DB } from '../../debug/DB.js';

let mouseIsDown = false;
let mouseButton = null;
let lastCellKey = null;
let massEditRadius = 0;
let mousePos = null;

export function handleEGFMouseEvents(type, event, canvas, egf, cellSize, offsetX, offsetY, renderCanvas) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const i = Math.floor((mouseX - offsetX) / cellSize);
    const j = Math.floor((mouseY - offsetY) / cellSize);
    const cellKey = `${i},${j}`;

    DB(DB.MSE, `EGF Mouse event: ${type}`, {mouseX, mouseY, i, j, cellKey});

    switch (type) {
        case 'mousedown':
            mouseIsDown = true;
            mouseButton = event.button;
            applyMassEdit(i, j, egf, mouseButton);
            renderCanvas();
            break;

        case 'mouseup':
            mouseIsDown = false;
            lastCellKey = null;
            renderCanvas();
            break;

        case 'mousemove':
            if (mouseIsDown && cellKey !== lastCellKey) {
                applyMassEdit(i, j, egf, mouseButton);
                lastCellKey = cellKey;
                renderCanvas();
            }
            break;

        case 'wheel':
            if (!mouseIsDown) {
                event.preventDefault();
                massEditRadius += (event.deltaY < 0 ? 1 : -1);
                massEditRadius = Math.max(0, massEditRadius);
                renderCanvas();
            }
            break;

        case 'mouseleave':
            mouseIsDown = false;
            lastCellKey = null;
            mousePos = null;
            renderCanvas();
            break;
    }
}

function applyMassEdit(centerI, centerJ, egf, button) {
    const brushShapeSelect = document.getElementById('brushShape');
    const shape = brushShapeSelect.value;

    DB(DB.MSE, `Applying mass edit:`, {centerI, centerJ, shape, button});

    for (let di = -massEditRadius; di <= massEditRadius; di++) {
        for (let dj = -massEditRadius; dj <= massEditRadius; dj++) {
            let applyChange = false;
            if (shape === 'circle') {
                applyChange = (di ** 2 + dj ** 2 <= massEditRadius ** 2);
            } else if (shape === 'square') {
                applyChange = true;
            }

            if (applyChange) {
                const i = centerI + di;
                const j = centerJ + dj;
                if (egf.isValidCell(i, j)) {
                    const currentARV = egf.getARV(i, j);
                    const newARV = button === 0 ? currentARV - 1 : currentARV + 1;
                    DB(DB.MSE, `EGF cell updated: (${i},${j})`, {currentARV, newARV});
                    egf.setARV(i, j, newARV);
                }
            }
        }
    }
}

export function renderEGF(ctx, egf, gridConfig, cellSize, offsetX, offsetY) {
    const brushShapeSelect = document.getElementById('brushShape');

    DB(DB.RND_EGF, 'Rendering EGF');

    for (let i = 0; i < gridConfig.gridWidth; i++) {
        for (let j = 0; j < gridConfig.gridHeight; j++) {
            const arv = egf.getARV(i, j);
            ctx.fillStyle = arvColor(arv);
            ctx.fillRect(offsetX + i * cellSize, offsetY + j * cellSize, cellSize, cellSize);
            ctx.strokeStyle = "#e0d0c0";
            ctx.strokeRect(offsetX + i * cellSize, offsetY + j * cellSize, cellSize, cellSize);
        }
    }

    if (mousePos) {
        ctx.strokeStyle = "rgba(255,0,0,0.6)";
        ctx.lineWidth = 2;

        if (brushShapeSelect.value === 'circle') {
            ctx.beginPath();
            ctx.arc(mousePos.x, mousePos.y, massEditRadius * cellSize + cellSize / 2, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (brushShapeSelect.value === 'square') {
            ctx.strokeRect(
                mousePos.x - (massEditRadius + 0.5) * cellSize,
                mousePos.y - (massEditRadius + 0.5) * cellSize,
                (massEditRadius * 2 + 1) * cellSize,
                (massEditRadius * 2 + 1) * cellSize
            );
        }

        DB(DB.RND_EGF, 'Rendered brush shape', {shape: brushShapeSelect.value, mousePos, massEditRadius});
    }
}

function arvColor(arv) {
    const greyValue = Math.max(-16, Math.min(16, arv));
    const normalizedGrey = Math.floor(((greyValue + 16) / 32) * 255);
    const color = `rgb(${normalizedGrey},${normalizedGrey},${normalizedGrey})`;

    DB(DB.RND_EGF, 'Computed ARV color:', {arv, color});

    return color;
}