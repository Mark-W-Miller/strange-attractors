import { D_, DB } from '../../debug/DB.js';
import { Database } from '../../logic/simulator/database/database.js';
import { redrawCanvas } from '../canvas.js';

export function handleEditAUT(e, buttonType) {
    const autTypeSelect = document.getElementById('autTypeSelect');
    if (!autTypeSelect) {
        D_(DB.UI, '[AUTEditor] AUT type dropdown not found.');
        return;
    }

    const selectedTypes = Array.from(autTypeSelect.selectedOptions).map(option => option.value);
    if (selectedTypes.length === 0) {
        D_(DB.UI, '[AUTEditor] No AUT types selected.');
        return;
    }

    const canvasAUT = document.getElementById('canvas-AUT');
    const rect = canvasAUT.getBoundingClientRect();

    const gridWidth = Database.gridConfig.gridWidth;
    const gridHeight = Database.gridConfig.gridHeight;
    const positionScaleFactor = Database.gridConfig.positionScaleFactor;

    // Translate mouse coordinates into the Arena Space system
    const posX = Math.floor(((e.clientX - rect.left) / rect.width) * gridWidth * positionScaleFactor);
    const posY = Math.floor(((e.clientY - rect.top) / rect.height) * gridHeight * positionScaleFactor);

    // Find the largest AUT type among the selected types
    let largestAUTSize = 0;
    selectedTypes.forEach(typeName => {
        const type = Database.AUTTypes[typeName];
        if (type && type.graphics && type.physics.coreSize > largestAUTSize) {
            largestAUTSize = type.physics.coreSize; // Use size directly from the config
            D_(DB.UI, `[AUTEditor] Selected AUT type: ${typeName}, coreSize: ${type.physics.coreSize}, posX: ${posX}, posY: ${posY}`);
        }
    });

    // Check for overlap based on the size of the AUT in Arena Space
    const doesOverlap = window.tempAUTPlacements.some(({ posX: existingPosX, posY: existingPosY, graphics }) => {
        const existingSize = graphics.size;
        const distance = Math.sqrt((existingPosX - posX) ** 2 + (existingPosY - posY) ** 2);

        // Minimum distance is the larger of the two AUT sizes
        const minDistance = Math.max(largestAUTSize, existingSize);

        // Debug logs for distance calculation
        D_(DB.UI_DEEP, `[AUTEditor] Overlap check:`);
        D_(DB.UI_DEEP, `  Current AUT: posX=${posX}, posY=${posY}, size=${largestAUTSize}`);
        D_(DB.UI_DEEP, `  Existing AUT: posX=${existingPosX}, posY=${existingPosY}, size=${existingSize}`);
        D_(DB.UI_DEEP, `  Calculated distance=${distance.toFixed(2)}, minDistance=${minDistance}`);
        D_(DB.UI_DEEP, `  Overlap result: ${distance <= minDistance}`);

        return distance <= minDistance; // Check if the distance is less than or equal to the minimum distance
    });

    if (doesOverlap) {
        D_(DB.UI, `[AUTEditor] Skipping placement at (${posX}, ${posY}) due to overlap.`);
        return;
    }

    // Place the AUTs at the new position
    selectedTypes.forEach(typeName => {
        const type = Database.AUTTypes[typeName];
        if (!type) {
            D_(DB.UI, `[AUTEditor] Unknown AUT type: ${typeName}`);
            return;
        }

        const newAUT = {
            id: `${typeName}-${Date.now()}`, // Unique ID
            type: typeName,
            position: { x: posX, y: posY }, // Store coordinates under position
            velocity: { x: 0, y: 0 }, // Default velocity
            rules: type.rules || [], // Assign rules from autType
            physics: type.physics, // Include physics properties
            graphics: type.graphics, // Include graphics properties
        };

        window.tempAUTPlacements.push(newAUT);
    });

    D_(DB.UI, `[AUTEditor] Placed AUTs at Arena Space coordinates (${posX}, ${posY}):`, selectedTypes);

    // Redraw the canvas to reflect changes
    redrawCanvas();
}