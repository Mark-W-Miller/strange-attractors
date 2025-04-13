export function initializeGravityVectorArray(gridConfig, EGFMap) {
    const { gridWidth, gridHeight } = gridConfig;

    // Create the shadow array
    const GravityVectorArray = Array.from({ length: gridHeight }, () =>
        Array.from({ length: gridWidth }, () => ({ x: 0, y: 0, magnitude: 0 }))
    );

    // Calculate gravity vectors for each cell
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            GravityVectorArray[y][x] = calculateGravityVector(x, y, gridConfig, EGFMap);
        }
    }

    return GravityVectorArray;
}

export function calculateGravityVector(targetX, targetY, gridConfig, EGFMap) {
    const { gridWidth, gridHeight } = gridConfig;

    const centerValue = EGFMap[targetY][targetX]; // Value of the center cell
    let vectorX = 0;
    let vectorY = 0;
    let maxGradient = 0; // Track the steepest gradient

    // Iterate over the 8 neighbors
    for (let offsetY = -1; offsetY <= 1; offsetY++) {
        for (let offsetX = -1; offsetX <= 1; offsetX++) {
            if (offsetX === 0 && offsetY === 0) continue; // Skip the center cell

            const neighborX = targetX + offsetX;
            const neighborY = targetY + offsetY;

            // Ensure the neighbor is within bounds
            if (neighborX >= 0 && neighborX < gridWidth && neighborY >= 0 && neighborY < gridHeight) {
                const neighborValue = EGFMap[neighborY][neighborX];
                const gradient = centerValue - neighborValue; // Difference between center and neighbor

                if (gradient > maxGradient) {
                    maxGradient = gradient; // Update the steepest gradient
                    vectorX = offsetX; // Direction toward the steepest gradient
                    vectorY = offsetY;
                }
            }
        }
    }

    return { x: vectorX, y: vectorY, magnitude: maxGradient };
}