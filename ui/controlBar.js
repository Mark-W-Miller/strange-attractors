import { Database } from '../../logic/simulator/database/database.js';
import { D_, DB } from '../../debug/DB.js';
import { Simulator } from '../../logic/simulator/engine/simulator.js';

// Simulator control buttons
const startSimulatorBtn = document.getElementById('startSimulatorBtn');
const pauseSimulatorBtn = document.getElementById('pauseSimulatorBtn');
const stopSimulatorBtn = document.getElementById('stopSimulatorBtn');

const terrainControls = document.getElementById('terrainControls');
const mouseFeedback = document.getElementById('mouseFeedback');
const mouseInfo = document.getElementById('mouseInfo');
const initializerSelect = document.getElementById('initializerSelect');

// Update mouse feedback dynamically
export function updateMouseFeedback(e) {
    if (!Database.gridConfig) {
        D_(DB.FEEDBACK, '[MouseFeedback] Database.gridConfig is not initialized yet.');
        return;
    }

    const canvasEGF = document.getElementById('canvas-EGF');
    const rectEGF = canvasEGF.getBoundingClientRect();

    const adjustedXEGF = e.clientX - rectEGF.left;
    const adjustedYEGF = e.clientY - rectEGF.top;

    const cellWidthEGF = rectEGF.width / Database.gridConfig.gridWidth;
    const cellHeightEGF = rectEGF.height / Database.gridConfig.gridHeight;

    // Calculate grid indices
    const egfI = Math.floor(adjustedYEGF / cellHeightEGF);
    const egfJ = Math.floor(adjustedXEGF / cellWidthEGF);

    // Ensure indices are within bounds
    if (egfI >= 0 && egfI < Database.gridConfig.gridHeight && egfJ >= 0 && egfJ < Database.gridConfig.gridWidth) {
        // Retrieve EGF value
        const egfValue = Database.getEGFValue(egfJ, egfI);

        // Retrieve Gravity Vector value
        const gv = Database.GravityVectorArray[egfI][egfJ];
        const gvValue = `x=${gv.x.toFixed(2)}, y=${gv.y.toFixed(2)}, magnitude=${gv.magnitude.toFixed(2)}`;

        // Log feedback
        D_(DB.FEEDBACK, '[MouseFeedback] Feedback:', { egfI, egfJ, egfValue, gvValue });

        // Update mouse info display
        mouseInfo.innerHTML = `
            <div>Mouse X: ${adjustedXEGF.toFixed(2)}, Y: ${adjustedYEGF.toFixed(2)}</div>
            <div>EGF IJ: (${egfI}, ${egfJ})</div>
            <div>EGF Value: ${egfValue}</div>
            <div>GV Value: ${gvValue}</div>
        `;
    } else {
        // Log out-of-bounds feedback
        D_(DB.FEEDBACK, '[MouseFeedback] Out of bounds:', { egfI, egfJ });

        // Update mouse info display for out-of-bounds
        mouseInfo.innerHTML = `
            <div>Mouse X: ${adjustedXEGF.toFixed(2)}, Y: ${adjustedYEGF.toFixed(2)}</div>
            <div>EGF IJ: (Out of bounds)</div>
            <div>EGF Value: Out of bounds</div>
            <div>GV Value: Out of bounds</div>
        `;
    }
}

// Add event listeners for simulator controls
startSimulatorBtn.addEventListener('click', () => {
    D_(DB.EVENTS, '[ControlBar] Start button clicked.');
    Simulator.start();
});

pauseSimulatorBtn.addEventListener('click', () => {
    D_(DB.EVENTS, '[ControlBar] Pause button clicked.');
    if (Simulator.isPaused) {
        Simulator.resume();
        pauseSimulatorBtn.textContent = 'Pause'; // Update button text
    } else {
        Simulator.pause();
        pauseSimulatorBtn.textContent = 'Resume'; // Update button text
    }
});

stopSimulatorBtn.addEventListener('click', () => {
    D_(DB.EVENTS, '[ControlBar] Stop button clicked.');
    Simulator.stop();
});


// Populate AUT types dropdown
function populateAUTTypes() {
    const autTypeSelect = document.getElementById('autTypeSelect');
    if (!autTypeSelect) {
        D_(DB.UI, '[ControlBar] AUT types dropdown not found.');
        return;
    }

    autTypeSelect.innerHTML = ''; // Clear existing options

    // Filter valid AUT types (those ending in `.aut` or `aut`)
    const validAUTTypes = Object.entries(Database.AUTTypes).filter(([_, typeData]) => {
        const isValid = typeData.type.endsWith('.aut') || typeData.type === 'aut';
        D_(DB.DB_INIT, `[ControlBar] Checking type: ${typeData.type}, isValid: ${isValid}`);
        return isValid;
    });

    // Sort so sources (with spawn property) are at the top
    validAUTTypes.sort(([, a], [, b]) => {
        const aIsSource = !!a.spawn;
        const bIsSource = !!b.spawn;
        return bIsSource - aIsSource; // sources (true) come before non-sources (false)
    });

    validAUTTypes.forEach(([name, typeData], index) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        option.setAttribute('data-type', typeData.type); // Add AUT type for later access

        // Set the first option as selected by default
        if (index === 0) {
            option.selected = true;
        }

        autTypeSelect.appendChild(option);
    });

    D_(DB.DB_INIT, '[ControlBar] AUT types dropdown populated with valid types.', validAUTTypes);
}

// Set active layer and update controls accordingly
function setActiveLayer(selectedLayer) {
    // Show/hide controls based on selected layer
    terrainControls.style.display = selectedLayer === 'Terrain' ? 'block' : 'none';
    document.getElementById('autControls').style.display = selectedLayer === 'AUT' ? 'block' : 'none';

    if (selectedLayer === 'AUT') {
        populateAUTTypes();
    }

    D_(DB.UI, `[ControlBar] Switched mode to ${selectedLayer}`);
}

// Populate initializers on load
document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const selectedLayer = btn.getAttribute('data-layer');
        // Your layer switching logic here
        setActiveLayer(selectedLayer); // Replace with your actual function
        // Optionally highlight the selected button
        document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});
// Set initial active layer on page load
setActiveLayer('AUT'); // Or 'Terrain' or 'AUT' as your default
// Optionally, highlight the default button
document.querySelectorAll('.layer-btn').forEach(b => {
    if (b.getAttribute('data-layer') === 'EGF') b.classList.add('active');
});
