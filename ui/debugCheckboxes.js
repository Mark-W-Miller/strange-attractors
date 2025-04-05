// ui/debugCheckboxes.js
import { DB } from '../debug/DB.js';

const debugCheckboxContainer = document.getElementById('debugCheckboxes');

// Explicitly generate checkboxes based on DB classes
Object.entries(DB)
    .filter(([key, value]) => typeof value === 'number')
    .forEach(([name, classId]) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = DB.enabledDB.has(classId);
        checkbox.id = `db-checkbox-${name}`;

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                DB.enabledDB.add(classId);
            } else {
                DB.enabledDB.delete(classId);
            }
            DB(DB.RND, `Toggled debug: ${name}`, checkbox.checked);
        });

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = name;

        const wrapper = document.createElement('div');
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        debugCheckboxContainer.appendChild(wrapper);
    });