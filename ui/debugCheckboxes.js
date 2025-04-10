// ui/debugCheckboxes.js
import { DB } from '../debug/DB.js';

export function populateDebugCheckboxes() {
    const debugCheckboxes = document.getElementById('debugCheckboxes');
    if (!debugCheckboxes) {
        DB(DB.INIT, '[DebugCheckboxes] Debug checkboxes container not found.');
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
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(debugClass));
        debugCheckboxes.appendChild(label);
    }

    DB(DB.INIT, '[DebugCheckboxes] Debug options populated.');
}