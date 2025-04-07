import { EGFMap, TerrainMap, gridConfig } from './canvas.js';

const layerSelect = document.getElementById('layerSelect');
const terrainControls = document.getElementById('terrainControls');
const mouseFeedback = document.getElementById('mouseFeedback');
const mouseInfo = document.getElementById('mouseInfo');

// Canvas elements
const canvasContainer = document.getElementById('canvas-container');

// Update mouse feedback dynamically
function updateMouseFeedback(e) {
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

    // Calculate cell size based on the canvas dimensions and grid configuration
    const cellWidthEGF = rectEGF.width / gridConfig.gridWidth;
    const cellHeightEGF = rectEGF.height / gridConfig.gridHeight;

    const cellWidthTerrain = rectTerrain.width / (gridConfig.gridWidth / gridConfig.terrainScaleFactor);
    const cellHeightTerrain = rectTerrain.height / (gridConfig.gridHeight / gridConfig.terrainScaleFactor);

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
        if (egfI >= 0 && egfI < gridConfig.gridHeight && egfJ >= 0 && egfJ < gridConfig.gridWidth) {
            const rawValue = EGFMap[egfI]?.[egfJ];
            egfValue = rawValue !== undefined ? rawValue.toFixed(2) : 'Out of bounds';
        } else {
            egfValue = 'Out of bounds';
        }
    }

    // Check if the Terrain layer is visible
    if (canvasTerrain.style.display !== 'none') {
        terrainI = Math.floor(adjustedYTerrain / cellHeightTerrain);
        terrainJ = Math.floor(adjustedXTerrain / cellWidthTerrain);

        // Look up Terrain type if indices are within bounds
        if (terrainI >= 0 && terrainI < gridConfig.gridHeight / gridConfig.terrainScaleFactor &&
            terrainJ >= 0 && terrainJ < gridConfig.gridWidth / gridConfig.terrainScaleFactor) {
            terrainType = TerrainMap[terrainI]?.[terrainJ] ?? 'Out of bounds';
        } else {
            terrainType = 'Out of bounds';
        }
    }

    // Update the mouse feedback section
    mouseInfo.innerHTML = `
        <div>Mouse X: ${adjustedXEGF.toFixed(2)}, Y: ${adjustedYEGF.toFixed(2)}</div>
        <div>EGF IJ: (${egfI}, ${egfJ})</div>
        <div>EGF Value: ${egfValue}</div>
        <div>Terrain IJ: (${terrainI}, ${terrainJ})</div>
        <div>Terrain Type: ${terrainType}</div>
    `;
}

// Add mousemove event listener to the canvas container
canvasContainer.addEventListener('mousemove', (e) => {
    const rect = canvasContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateMouseFeedback(e);
});

layerSelect.addEventListener('change', (e) => {
    const mode = e.target.value;
    terrainControls.style.display = mode === 'Terrain' ? 'block' : 'none';
    console.log(`Switched mode to ${mode}`);
});
