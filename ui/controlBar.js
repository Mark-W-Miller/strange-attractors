import { Database } from '../../logic/simulator/database/database.js';
import { DB } from '../../debug/DB.js';
import { Simulator } from '../../logic/simulator/engine/simulator.js';

// Simulator control buttons
const startSimulatorBtn = document.getElementById('startSimulatorBtn');
const pauseSimulatorBtn = document.getElementById('pauseSimulatorBtn');
const stopSimulatorBtn = document.getElementById('stopSimulatorBtn');

const layerSelect = document.getElementById('layerSelect');
const terrainControls = document.getElementById('terrainControls');
const mouseFeedback = document.getElementById('mouseFeedback');
const mouseInfo = document.getElementById('mouseInfo');

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
    console.log(`Switched mode to ${mode}`);
});
