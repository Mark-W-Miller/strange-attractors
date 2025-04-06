const layerSelect = document.getElementById('layerSelect');
const terrainControls = document.getElementById('terrainControls');

layerSelect.addEventListener('change', (e) => {
    const mode = e.target.value;
    terrainControls.style.display = mode === 'Terrain' ? 'flex' : 'none';
    console.log(`Switched mode to ${mode}`);
});
