import { initializeCanvas } from './ui/canvas.js';
import { populateDebugCheckboxes } from './ui/debugCheckboxes.js'; // Import the debug checkboxes logic
import { createLayerCheckboxes } from './ui/layersVisibleCheckboxes.js'; // Import the layersVisible logic
import { D_, DB } from './debug/DB.js';

async function initializeApp() {
    D_(DB.INIT, '[App] Initializing application...');

    try {
        // Populate debug checkboxes
        populateDebugCheckboxes();
        D_(DB.INIT, '[App] Debug checkboxes populated.');

        // Populate visible layers checkboxes
        createLayerCheckboxes();
        D_(DB.INIT, '[App] Layers visible checkboxes populated.');

        // Initialize the canvas and related components
        await initializeCanvas();
        D_(DB.INIT, '[App] Canvas initialized successfully.');

        D_(DB.INIT, '[App] Application initialization complete.');
    } catch (error) {
        D_(DB.INIT, '[App] Failed to initialize application:', error);
    }
}

// Start the application when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});