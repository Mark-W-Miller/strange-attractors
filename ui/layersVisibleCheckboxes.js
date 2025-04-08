import { DB } from '../debug/DB.js';
import { redrawCanvas } from './canvas.js';

const layers = ['EGF', 'Terrain', 'AUT'];
const layersVisible = new Set(['EGF', 'Terrain', 'AUT']); // Initially: all layers visible

const container = document.getElementById('layersVisibleCheckboxes');


export function createLayerCheckboxes() {
    container.innerHTML = ''; // Clear existing checkboxes first

    layers.forEach(layer => {
        const row = document.createElement('div');
        row.className = 'checkbox-row'; // Add a class for styling

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = layersVisible.has(layer);
        checkbox.id = `layer-checkbox-${layer}`;

        checkbox.onchange = () => {
            checkbox.checked
                ? layersVisible.add(layer)
                : layersVisible.delete(layer);
            setLayerVisibility(layer, checkbox.checked);
            redrawCanvas(); // Redraw canvas on visibility change
        };

        const label = document.createElement('label');
        label.htmlFor = `layer-checkbox-${layer}`;
        label.textContent = layer;

        row.appendChild(checkbox);
        row.appendChild(label);

        container.appendChild(row);

        setLayerVisibility(layer, checkbox.checked);
    });
}

function setLayerVisibility(layer, isVisible) {
    DB(DB.RND, `Layer ${layer} visibility set to:`, isVisible);

    // Explicitly handle canvas visibility
    const canvas = document.getElementById(`canvas-${layer}`);
    if (canvas) {
        canvas.style.display = isVisible ? 'block' : 'none';
    } else {
        DB(DB.RND, `Canvas not found explicitly for layer: ${layer}`);
    }
}
