// ui/eventHandlers.js
import { redrawCanvas, gridConfig, EGFMap } from './canvas.js';
import { DB } from '../debug/DB.js';

export function setupEventHandlers() {
    const gameCanvas = document.getElementById('gameCanvas');
    let selectedBrushShape = 'circle';
    let cursorSize = 20;

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

        DB(DB.UI, `Cursor moved explicitly to ${x}, ${y}`);
    });

    gameCanvas.addEventListener('click', (e) => {
        const canvasEGF = document.getElementById('canvas-EGF');
        const rect = canvasEGF.getBoundingClientRect();
        const cellSize = Math.min(canvasEGF.width, canvasEGF.height) / gridConfig.gridWidth;

        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);

        DB(DB.UI, `Explicitly clicked cell (${x}, ${y})`);

        EGFMap[y][x] = 50;

        redrawCanvas();
    });
}