import { initializeCanvas } from './ui/canvas.js';
import { Simulations } from './Simulations.js';
import { D_, DB } from './debug/DB.js';
import { initializeSimulation } from './logic/simulator/simulationInitializer.js';
import { saveSimulationDebugInfo, loadSimulationDebugInfo } from './logic/simulator/storage.js';

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

        // Initialize the canvas last
        D_(DB.INIT, '[App] Initializing canvas...');
        initializeCanvas();
        D_(DB.INIT, '[App] Canvas initialized.');

        D_(DB.INIT, '[App] Application initialization complete.');
    } catch (error) {
        console.error('[App] Failed to initialize application:', error);
    }
}

// Start the application when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});