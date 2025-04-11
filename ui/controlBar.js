import { Database } from '../../logic/simulator/database/database.js';
import { DB } from '../../debug/DB.js';
import { Simulator } from '../../logic/simulator/engine/simulator.js';
import { initializeCanvas } from './canvas.js';

// Simulator control buttons
const startSimulatorBtn = document.getElementById('startSimulatorBtn');
const pauseSimulatorBtn = document.getElementById('pauseSimulatorBtn');
const stopSimulatorBtn = document.getElementById('stopSimulatorBtn');

const layerSelect = document.getElementById('layerSelect');
const terrainControls = document.getElementById('terrainControls');
const mouseFeedback = document.getElementById('mouseFeedback');
const mouseInfo = document.getElementById('mouseInfo');
const initializerSelect = document.getElementById('initializerSelect');

// Canvas elements
const canvasContainer = document.getElementById('canvas-container');

// Update mouse feedback dynamically
export function updateMouseFeedback(e) {
    if (!Database.gridConfig) {
        DB(DB.FEEDBACK, '[MouseFeedback] Database.gridConfig is not initialized yet.');
        return;
    }

    DB(DB.FEEDBACK, '[MouseFeedback] Processing mouse event:', e.clientX, e.clientY);

    const canvasEGF = document.getElementById('canvas-EGF');
    const canvasTerrain = document.getElementById('canvas-Terrain');

    // Use the specific canvas rect for each layer
    const rectEGF = canvasEGF.getBoundingClientRect();
    const rectTerrain = canvasTerrain.getBoundingClientRect();

    // Adjust mouse coordinates to account for the canvas's top-left corner
    const adjustedXEGF = e.clientX - rectEGF.left;
    const adjustedYEGF = e.clientY - rectEGF.top;

    const adjustedXTerrain = e.clientX - rectTerrain.left;
    const adjustedYTerrain = e.clientY - rectTerrain.top;

    DB(DB.FEEDBACK, '[MouseFeedback] Adjusted coordinates:', {
        adjustedXEGF,
        adjustedYEGF,
        adjustedXTerrain,
        adjustedYTerrain
    });

    // Calculate cell size based on the canvas dimensions and grid configuration
    const cellWidthEGF = rectEGF.width / Database.gridConfig.gridWidth;
    const cellHeightEGF = rectEGF.height / Database.gridConfig.gridHeight;

    const cellWidthTerrain = rectTerrain.width / (Database.gridConfig.gridWidth / Database.gridConfig.terrainScaleFactor);
    const cellHeightTerrain = rectTerrain.height / (Database.gridConfig.gridHeight / Database.gridConfig.terrainScaleFactor);

    DB(DB.FEEDBACK, '[MouseFeedback] Cell sizes:', {
        cellWidthEGF,
        cellHeightEGF,
        cellWidthTerrain,
        cellHeightTerrain
    });

    // Initialize placeholders for feedback values
    let egfI = 'N/A';
    let egfJ = 'N/A';
    let egfValue = 'EGF layer hidden';
    let terrainI = 'N/A';
    let terrainJ = 'N/A';
    let terrainType = 'Terrain layer hidden';

    // Check if the EGF layer is visible
    if (canvasEGF.style.display !== 'none') {
        egfI = Math.floor(adjustedYEGF / cellHeightEGF);
        egfJ = Math.floor(adjustedXEGF / cellWidthEGF);

        // Look up EGF value if indices are within bounds
        if (egfI >= 0 && egfI < Database.gridConfig.gridHeight && egfJ >= 0 && egfJ < Database.gridConfig.gridWidth) {
            const rawValue = Database.EGFMap[egfI]?.[egfJ];
            egfValue = rawValue !== undefined ? rawValue.toFixed(2) : 'Out of bounds';
        } else {
            egfValue = 'Out of bounds';
        }
    }

    DB(DB.FEEDBACK, '[MouseFeedback] EGF feedback:', { egfI, egfJ, egfValue });

    // Check if the Terrain layer is visible
    if (canvasTerrain.style.display !== 'none') {
        terrainI = Math.floor(adjustedYTerrain / cellHeightTerrain);
        terrainJ = Math.floor(adjustedXTerrain / cellWidthTerrain);

        // Look up Terrain type if indices are within bounds
        if (terrainI >= 0 && terrainI < Database.gridConfig.gridHeight / Database.gridConfig.terrainScaleFactor &&
            terrainJ >= 0 && terrainJ < Database.gridConfig.gridWidth / Database.gridConfig.terrainScaleFactor) {
            terrainType = Database.TerrainMap[terrainI]?.[terrainJ] ?? 'Out of bounds';
        } else {
            terrainType = 'Out of bounds';
        }
    }

    DB(DB.FEEDBACK, '[MouseFeedback] Terrain feedback:', { terrainI, terrainJ, terrainType });

    // Update the mouse feedback section
    mouseInfo.innerHTML = `
        <div>Mouse X: ${adjustedXEGF.toFixed(2)}, Y: ${adjustedYEGF.toFixed(2)}</div>
        <div>EGF IJ: (${egfI}, ${egfJ})</div>
        <div>EGF Value: ${egfValue}</div>
        <div>Terrain IJ: (${terrainI}, ${terrainJ})</div>
        <div>Terrain Type: ${terrainType}</div>
    `;
}

// Add event listeners for simulator controls
startSimulatorBtn.addEventListener('click', () => {
    DB(DB.EVENTS, '[ControlBar] Start button clicked.');
    Simulator.start();
});

pauseSimulatorBtn.addEventListener('click', () => {
    DB(DB.EVENTS, '[ControlBar] Pause button clicked.');
    Simulator.pause();
});

stopSimulatorBtn.addEventListener('click', () => {
    DB(DB.EVENTS, '[ControlBar] Stop button clicked.');
    Simulator.stop();
});

layerSelect.addEventListener('change', (e) => {
    const mode = e.target.value;
    terrainControls.style.display = mode === 'Terrain' ? 'block' : 'none';
    document.getElementById('autControls').style.display = mode === 'AUT' ? 'block' : 'none';

    if (mode === 'AUT') {
        populateAUTTypes();
    }

    DB(DB.UI, `[ControlBar] Switched mode to ${mode}`);
});

// Populate initializer dropdown
async function populateInitializers() {
    try {
        DB(DB.DB_INIT, '[ControlBar] Fetching initializer files...');
        const response = await fetch('../data/initializers/initializers.json'); // Fetch the JSON file containing the list of initializers
        if (!response.ok) {
            throw new Error(`[ControlBar] Failed to fetch initializers: ${response.statusText}`);
        }

        const files = await response.json(); // Parse the JSON array
        DB(DB.UI, '[ControlBar] Initializer files fetched:', files);

        initializerSelect.innerHTML = ''; // Clear existing options

        for (const file of files) {
            try {
                const fileResponse = await fetch(`../data/initializers/${file}`);
                if (!fileResponse.ok) {
                    throw new Error(`[ControlBar] Failed to fetch initializer file: ${file}`);
                }

                const initializerConfig = await fileResponse.json();
                const option = document.createElement('option');
                option.value = `../data/initializers/${file}`;
                option.textContent = initializerConfig.name || file.replace('.json', ''); // Use the `name` field or fallback to the filename
                initializerSelect.appendChild(option);
                DB(DB.DB_INIT, `[ControlBar] Added initializer option: ${initializerConfig.name || file}`);
            } catch (error) {
                DB(DB.DB_INIT, `[ControlBar] Error processing initializer file: ${file}`, error);
            }
        }

        DB(DB.DB_INIT, '[ControlBar] Initializer dropdown populated.');
    } catch (error) {
        DB(DB.DB_INIT, '[ControlBar] Failed to populate initializer dropdown:', error);
    }
}

// Populate AUT types dropdown
function populateAUTTypes() {
    const autTypeSelect = document.getElementById('autTypeSelect');
    if (!autTypeSelect) {
        DB(DB.UI, '[ControlBar] AUT types dropdown not found.');
        return;
    }

    autTypeSelect.innerHTML = ''; // Clear existing options

    // Filter valid AUT types (those ending in `.aut` or `aut`)
    const validAUTTypes = Object.entries(Database.AUTTypes).filter(([_, typeData]) => {
        const isValid = typeData.type.endsWith('.aut') || typeData.type === 'aut';
        DB(DB.DB_INIT, `[ControlBar] Checking type: ${typeData.type}, isValid: ${isValid}`);
        return isValid;
    });

    validAUTTypes.forEach(([name]) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        autTypeSelect.appendChild(option);
    });

    DB(DB.DB_INIT, '[ControlBar] AUT types dropdown populated with valid types.', validAUTTypes);
}

// Load selected initializer
initializerSelect.addEventListener('change', async (e) => {
    const initializerConfigUrl = e.target.value;
    await initializeCanvas(initializerConfigUrl);
    DB(DB.UI, `[ControlBar] Loaded initializer: ${initializerConfigUrl}`);
});

// Populate initializers on load
populateInitializers();