export function initializeGravityVectorArray(gridConfig, EGFMap) {
    const { gridWidth, gridHeight, influenceRadius } = gridConfig;

    // Create the shadow array
    const GravityVectorArray = Array.from({ length: gridHeight }, () =>
        Array.from({ length: gridWidth }, () => ({ x: 0, y: 0, magnitude: 0 }))
    );

    // Calculate gravity vectors for each cell
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            GravityVectorArray[y][x] = calculateGravityVector(x, y, influenceRadius, gridConfig, EGFMap);
        }
    }

    return GravityVectorArray;
}

export function calculateGravityVector(targetX, targetY, radius, gridConfig, EGFMap) {
    const { gridWidth, gridHeight } = gridConfig;
    let vectorX = 0;
    let vectorY = 0;

    for (let offsetY = -radius; offsetY <= radius; offsetY++) {
        for (let offsetX = -radius; offsetX <= radius; offsetX++) {
            const neighborX = targetX + offsetX;
            const neighborY = targetY + offsetY;

            if (neighborX < 0 || neighborX >= gridWidth || neighborY < 0 || neighborY >= gridHeight) {
                continue;
            }

            const distanceSquared = offsetX ** 2 + offsetY ** 2;
            if (distanceSquared > radius ** 2) {
                continue;
            }

            const influence = EGFMap[neighborY][neighborX]; // Access EGFMap directly

            // Reverse the direction of the influence
            vectorX -= influence * offsetX;
            vectorY -= influence * offsetY;
        }
    }

    const magnitude = Math.sqrt(vectorX ** 2 + vectorY ** 2);
    return { x: vectorX, y: vectorY, magnitude };
}