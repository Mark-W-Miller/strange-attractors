// ui/debugCheckboxes.js
import { D_, DB } from '../debug/DB.js';
import { saveSimulationDebugInfo } from '../logic/simulator/storage.js'; // Import the save function
import { Simulation } from '../data/initializers/default.js'; // Import the Simulation object

export function populateDebugCheckboxes() {
    const debugCheckboxes = document.getElementById('debugCheckboxes');
    if (!debugCheckboxes) {
        D_(DB.INIT, '[DebugCheckboxes] Debug checkboxes container not found.');
        return;
    }

    // Clear existing checkboxes
    debugCheckboxes.innerHTML = '';

    // Populate debug options
    for (const debugClass of DB.enabledDB) {
        const label = document.createElement('label');
        label.style.display = 'block';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = DB.dbLevelsOn.has(debugClass); // Reflect current state
        checkbox.dataset.debugClass = debugClass;

        checkbox.addEventListener('change', (e) => {
            const debugClass = e.target.dataset.debugClass;
            if (e.target.checked) {
                DB.enable(debugClass);
            } else {
                DB.disable(debugClass);
            }

            // Save debug info after a checkbox is toggled
            saveSimulationDebugInfo(Simulation);
            D_(DB.INIT, `[DebugCheckboxes] Debug info saved after toggling ${debugClass}.`);
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(debugClass));
        debugCheckboxes.appendChild(label);
    }

    D_(DB.INIT, '[DebugCheckboxes] Debug options populated.');
}