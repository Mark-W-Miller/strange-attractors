import { D_, DB } from '../../debug/DB.js';
import { Database } from '../../logic/simulator/database/database.js';
import { redrawCanvas } from '../canvas.js';
import { selectedBrushShape, cursorSize } from '../eventHandlers.js';

export function handleEditAUT(e, buttonType) {
    const canvasAUT = document.getElementById('canvas-AUT');
    const rect = canvasAUT.getBoundingClientRect();

    const gridWidth = Database.gridConfig.gridWidth;
    const gridHeight = Database.gridConfig.gridHeight;
    const positionScaleFactor = Database.gridConfig.positionScaleFactor;

    // Translate mouse coordinates into the Arena Space system
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * gridWidth * positionScaleFactor);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * gridHeight * positionScaleFactor);

    // Get the selected types from the dropdown
    const autTypeSelect = document.getElementById('autTypeSelect');
    const selectedTypes = Array.from(autTypeSelect.selectedOptions).map(option => option.value);

    if (selectedTypes.length === 0) {
        D_(DB.UI, `[AUTEditor] No AUT types selected.`);
        return;
    }

    selectedTypes.forEach(type => {
        if (!Database.AUTTypes[type]) {
            D_(DB.UI, `[AUTEditor] Invalid AUT type selected: ${type}`);
            return;
        }
    });

    // Determine the largest AUT based on size
    const largestAUT = selectedTypes.reduce((largest, type) => {
        const graphics = Database.AUTTypes[type].graphics;
        return graphics.size > largest.graphics.size ? { type, graphics } : largest;
    }, 
    { type: selectedTypes[0], graphics: Database.AUTTypes[selectedTypes[0]].graphics }); // Initialize with the first selected type

    const { graphics: largestGraphics } = largestAUT;

    // Spread AUTs out if cursor is large
    const spreadRadius = Math.max(1, Math.floor(cursorSize / 2));
    const numAUTs = Math.max(1, Math.floor(cursorSize / 8));
    const angleStep = (2 * Math.PI) / numAUTs;

    let placed = 0;
    for (let i = 0; i < numAUTs; i++) {
        const angle = i * angleStep;
        const px = Math.floor(x + Math.cos(angle) * spreadRadius);
        const py = Math.floor(y + Math.sin(angle) * spreadRadius);

        // Check for overlap using the largest AUT
        const doesOverlap = window.tempAUTPlacements.some(({ position: existingPosition, graphics: existingGraphics }) => {
            const dx = existingPosition.x - px;
            const dy = existingPosition.y - py;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = Math.max(existingGraphics.size, largestGraphics.size);
            return distance < minDistance;
        });

        if (doesOverlap) {
            D_(DB.UI, `[AUTEditor] Skipping placement at (${px}, ${py}) due to overlap.`);
            continue;
        }

        // Add all selected AUTs to temporary placements at this position
        selectedTypes.forEach(type => {
            const graphics = Database.AUTTypes[type].graphics;
            window.tempAUTPlacements.push({
                type,
                position: { x: px, y: py },
                graphics,
            });
            D_(DB.UI, `[AUTEditor] Placed AUT of type ${type} at (${px}, ${py}).`);
        });
        placed++;
    }

    if (placed === 0) {
        D_(DB.UI, `[AUTEditor] No AUTs placed due to overlap.`);
    }

    // Trigger a canvas redraw to show the newly placed AUTs
    redrawCanvas();
}