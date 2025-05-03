export function saveSimulationDebugInfo(simulation, key = 'simulationDebugInfo') {
    try {
        // Extract only the debug-relevant information from the Simulation object
        const debugInfo = {
            gridConfig: simulation.gridConfig, // Store grid configuration
            autPositions: simulation.autPositions, // Store AUT initial positions
            rules: simulation.rules.map(rule => rule.name), // Store rule names only
        };

        const serializedDebugInfo = JSON.stringify(debugInfo);
        localStorage.setItem(key, serializedDebugInfo);
        console.log(`[Storage] Simulation debug info saved to local storage with key: ${key}`);
    } catch (error) {
        console.error('[Storage] Failed to save simulation debug info to local storage:', error);
    }
}

export function loadSimulationDebugInfo(key = 'simulationDebugInfo') {
    try {
        const serializedDebugInfo = localStorage.getItem(key);
        if (!serializedDebugInfo) {
            console.warn(`[Storage] No simulation debug info found in local storage with key: ${key}`);
            return null;
        }

        const debugInfo = JSON.parse(serializedDebugInfo);
        console.log(`[Storage] Simulation debug info loaded from local storage with key: ${key}`);
        return debugInfo;
    } catch (error) {
        console.error('[Storage] Failed to load simulation debug info from local storage:', error);
        return null;
    }
}