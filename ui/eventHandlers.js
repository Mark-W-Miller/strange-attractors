import { redrawCanvas } from './canvas.js';
import { DB } from '../debug/DB.js';

window.addEventListener('resize', handleResize);

function handleResize() {
    const canvases = ['canvas-EGF', 'canvas-Terrain', 'canvas-AUT'];
    const referenceCanvas = document.getElementById('canvas-EGF');
    
    canvases.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            canvas.width = referenceCanvas.clientWidth;
            canvas.height = referenceCanvas.clientHeight;
            DB(DB.RND, `Canvas ${id} explicitly resized to:`, canvas.width, canvas.height);
        }
    });

    redrawCanvas(); // Explicitly redraw after resize
}

document.addEventListener('DOMContentLoaded', handleResize);