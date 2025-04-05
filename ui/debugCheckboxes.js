// ui/debugCheckboxes.js
import { DB } from '../debug/DB.js';

const debugCheckboxes = document.getElementById('debugCheckboxes');

function createDebugCheckboxes() {
    Object.entries(DB)
        .filter(([_, val]) => typeof val === 'number')
        .forEach(([name, classId]) => {
            const label = document.createElement('label');
            
            // Explicitly create checkbox input
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = DB.enabledDB.has(classId);
            checkbox.id = `db-checkbox-${name}`;

            checkbox.onchange = () => {
                checkbox.checked
                    ? DB.enabledDB.add(classId)
                    : DB.enabledDB.delete(classId);
                DB(DB.RND, `Debug ${name}:`, checkbox.checked);
            };

            // Explicitly append checkbox and text to label correctly
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(name));

            debugCheckboxes.appendChild(label);
        });
}

document.addEventListener('DOMContentLoaded', createDebugCheckboxes);