import { initializeGravityVectorArray, calculateGravityVector } from '../../../logic/simulator/database/physics/gravity.js';
import { strict as assert } from 'assert';

describe('Gravity Vector Calculations', () => {
    const gridConfig = {
        gridWidth: 10,
        gridHeight: 10,
        influenceRadius: 2, // Test with a small radius for simplicity
    };

    it('should calculate gravity vectors for a grid filled with 0s', () => {
        const EGFMap = Array.from({ length: gridConfig.gridHeight }, () =>
            Array.from({ length: gridConfig.gridWidth }, () => 0)
        );

        const GravityVectorArray = initializeGravityVectorArray(gridConfig, EGFMap);

        // All vectors should have zero magnitude
        for (let y = 0; y < gridConfig.gridHeight; y++) {
            for (let x = 0; x < gridConfig.gridWidth; x++) {
                const vector = GravityVectorArray[y][x];
                assert.equal(vector.magnitude, 0, `Expected magnitude 0 at (${x}, ${y}), got ${vector.magnitude}`);
                assert.equal(vector.x, 0, `Expected x-component 0 at (${x}, ${y}), got ${vector.x}`);
                assert.equal(vector.y, 0, `Expected y-component 0 at (${x}, ${y}), got ${vector.y}`);
            }
        }
    });

    it('should calculate gravity vectors for a grid filled with 255s', () => {
        const EGFMap = Array.from({ length: gridConfig.gridHeight }, () =>
            Array.from({ length: gridConfig.gridWidth }, () => 255)
        );

        const GravityVectorArray = initializeGravityVectorArray(gridConfig, EGFMap);

        // All vectors should have zero magnitude because the grid is uniform
        for (let y = 0; y < gridConfig.gridHeight; y++) {
            for (let x = 0; x < gridConfig.gridWidth; x++) {
                const vector = GravityVectorArray[y][x];
                assert.equal(vector.magnitude, 0, `Expected magnitude 0 at (${x}, ${y}), got ${vector.magnitude}`);
                assert.equal(vector.x, 0, `Expected x-component 0 at (${x}, ${y}), got ${vector.x}`);
                assert.equal(vector.y, 0, `Expected y-component 0 at (${x}, ${y}), got ${vector.y}`);
            }
        }
    });

    it('should calculate gravity vectors after modifying the grid', () => {
        const EGFMap = Array.from({ length: gridConfig.gridHeight }, () =>
            Array.from({ length: gridConfig.gridWidth }, () => 0)
        );

        // Set a single high value in the center
        EGFMap[5][5] = 255;

        const GravityVectorArray = initializeGravityVectorArray(gridConfig, EGFMap);

        // Check vectors around the high-value cell
        for (let y = 4; y <= 6; y++) {
            for (let x = 4; x <= 6; x++) {
                if (x === 5 && y === 5) continue; // Skip the center cell
                const vector = GravityVectorArray[y][x];
                assert(vector.magnitude > 0, `Expected non-zero magnitude at (${x}, ${y}), got ${vector.magnitude}`);
            }
        }

        // Check that vectors far from the high-value cell are zero
        for (let y = 0; y < gridConfig.gridHeight; y++) {
            for (let x = 0; x < gridConfig.gridWidth; x++) {
                if (Math.abs(x - 5) > gridConfig.influenceRadius || Math.abs(y - 5) > gridConfig.influenceRadius) {
                    const vector = GravityVectorArray[y][x];
                    assert.equal(vector.magnitude, 0, `Expected magnitude 0 at (${x}, ${y}), got ${vector.magnitude}`);
                }
            }
        }
    });
});