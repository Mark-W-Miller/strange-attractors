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
        checkbox.checked = true; // Default to enabled
        checkbox.dataset.debugClass = debugClass;

        checkbox.addEventListener('change', (e) => {
            const debugClass = parseInt(e.target.dataset.debugClass, 10);
            if (e.target.checked) {
                DB.enabledDB.add(debugClass);
                DB(DB.INIT, `[DebugCheckboxes] Enabled debug class: ${DB.classToString(debugClass)}`);
            } else {
                DB.enabledDB.delete(debugClass);
                DB(DB.INIT, `[DebugCheckboxes] Disabled debug class: ${DB.classToString(debugClass)}`);
            }
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(DB.classToString(debugClass)));
        debugCheckboxes.appendChild(label);
    }

    DB(DB.INIT, '[DebugCheckboxes] Debug options populated.');
}