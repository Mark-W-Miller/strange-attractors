// ui/layersVisibleCheckboxes.js

const layers = ['EGF', 'Terrain', 'AUT'];
const layersVisible = new Set(['EGF', 'Terrain', 'AUT']); // explicitly initially selected layers

const container = document.getElementById('layersVisibleCheckboxes');

function createLayerCheckboxes() {
    layers.forEach(layer => {
        const label = document.createElement('label');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = layersVisible.has(layer);
        checkbox.id = `layer-checkbox-${layer}`;

        checkbox.onchange = () => {
            if (checkbox.checked) {
                layersVisible.add(layer);
            } else {
                layersVisible.delete(layer);
            }
            // Explicitly add your visibility toggle function here
            console.log(`Layer ${layer} visibility:`, checkbox.checked);
        };

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(layer));

        container.appendChild(label);
    });
}

document.addEventListener('DOMContentLoaded', createLayerCheckboxes);