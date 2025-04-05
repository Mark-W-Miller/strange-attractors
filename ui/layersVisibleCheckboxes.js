import { DB } from '../debug/DB.js';

const layers = ['EGF', 'Terrain', 'AUT'];
const layersVisible = new Set(['EGF', 'Terrain']); // Initially: AUT not selected

const container = document.getElementById('layersVisibleCheckboxes');

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

function createLayerCheckboxes() {
    container.innerHTML = ''; // explicitly clear existing checkboxes first

    layers.forEach(layer => {
        const label = document.createElement('label');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = layersVisible.has(layer);
        checkbox.id = `layer-checkbox-${layer}`;

        checkbox.onchange = () => {
            checkbox.checked
                ? layersVisible.add(layer)
                : layersVisible.delete(layer);
            setLayerVisibility(layer, checkbox.checked);
            redrawCanvas(); // Explicitly redraw canvas on visibility change
        };

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(layer));

        container.appendChild(label);

        setLayerVisibility(layer, checkbox.checked);
    });
}

document.addEventListener('DOMContentLoaded', createLayerCheckboxes);