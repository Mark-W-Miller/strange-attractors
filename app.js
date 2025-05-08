import { initializeCanvas } from './ui/canvas.js';
import { Simulations } from './Simulations.js';
import { D_, DB } from './debug/DB.js';
import { initializeSimulation } from './logic/simulator/simulationInitializer.js';
import { saveSimulationDebugInfo, loadSimulationDebugInfo } from './logic/simulator/storage.js';
import { Database } from './logic/simulator/database/database.js';

async function initializeApp() {
    D_(DB.INIT, '[App] Starting application initialization...');

    try {
        // Load the Default Simulation from Simulations.js
        const defaultSimulation = Simulations.find(sim => sim.name === 'Default');
        if (!defaultSimulation) {
            throw new Error('[App] Default simulation not found in Simulations.js.');
        }

        D_(DB.INIT, `[App] Attempting to import simulation from: ${defaultSimulation.path}`);
        const { Simulation } = await import(defaultSimulation.path);

        // Load debug info if available
        const debugInfo = loadSimulationDebugInfo();
        if (debugInfo) {
            D_(DB.INIT, '[App] Loaded debug info:', debugInfo);
        }

        // Initialize the simulation
        await initializeSimulation(Simulation);

        // Save debug info after initialization
        saveSimulationDebugInfo(Simulation);
        D_(DB.INIT, '[App] Simulation debug info saved.');

        // Initialize the FPS control after Simulation is loaded
        initializeFPSControl(Simulation);

        // Initialize the canvas last
        D_(DB.INIT, '[App] Initializing canvas...');
        initializeCanvas();
        D_(DB.INIT, '[App] Canvas initialized.');

        D_(DB.INIT, '[App] Application initialization complete.');
    } catch (error) {
        console.error('[App] Failed to initialize application:', error);
    }
}

function initializeFPSControl(Simulation) {
    const fpsControl = document.getElementById('fps-control');
    if (fpsControl) {
        fpsControl.value = Simulation.gridConfig.FPS; // Set the initial FPS value
        D_(DB.DEBUG, `[Simulation] FPS control initialized to: ${Simulation.gridConfig.FPS}`);
    } else {
        D_(DB.ERROR, '[Simulation] FPS control element not found.');
    }
}

// Update FPS dynamically when the user changes the value
function updateFPS(newFPS, Simulation) {
    const fps = parseInt(newFPS, 10);
    if (!isNaN(fps) && fps > 0) {
        Simulation.gridConfig.FPS = fps;
        D_(DB.DEBUG, `[Simulation] FPS updated to: ${fps}`);
    } else {
        D_(DB.ERROR, '[Simulation] Invalid FPS value.');
    }
}

function clearSelectedAUTs() {
    const autTypeSelect = document.getElementById('autTypeSelect');
    if (autTypeSelect) {
        const selectedOptions = Array.from(autTypeSelect.selectedOptions);
        if (selectedOptions.length > 0) {
            const selectedTypes = selectedOptions.map(option => option.value);

            // Use the Database to delete AUTs of the selected types
            Database.deleteAUTsByType(selectedTypes);
        } else {
            D_(DB.DEBUG, '[AUT Editor] No AUT types selected to clear.');
        }
    } else {
        D_(DB.ERROR, '[AUT Editor] AUT selector element not found.');
    }
}

// Attach the clear button event listener
document.addEventListener('DOMContentLoaded', () => {
    const clearAutBtn = document.getElementById('clearAutBtn');
    if (clearAutBtn) {
        clearAutBtn.addEventListener('click', clearSelectedAUTs);
        D_(DB.INIT, '[AUT Editor] Clear button initialized.');
    } else {
        D_(DB.ERROR, '[AUT Editor] Clear button element not found.');
    }
});

// Start the application when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});