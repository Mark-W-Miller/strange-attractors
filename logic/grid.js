// Explicit EGF class for Einstein's Gravity Floor management

class EGF {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = this.createGrid(width, height);
    }

    // Explicit grid initialization with ARV values (default neutral: 0)
    createGrid(width, height) {
        const grid = [];
        for (let j = 0; j < height; j++) {
            const row = [];
            for (let i = 0; i < width; i++) {
                row.push({ ARV: 0 }); // ARV explicitly set to neutral by default
            }
            grid.push(row);
        }
        return grid;
    }

    // Explicit method to set ARV at (I,J)
    setARV(i, j, value) {
        if (this.isValidCell(i, j)) {
            this.cells[j][i].ARV = value;
        }
    }

    // Explicit method to get ARV at (I,J)
    getARV(i, j) {
        if (this.isValidCell(i, j)) {
            return this.cells[j][i].ARV;
        }
        return null;
    }

    // Explicit cell validity check
    isValidCell(i, j) {
        return (i >= 0 && i < this.width && j >= 0 && j < this.height);
    }
}

// Explicitly export the EGF class for usage
export { EGF };

export class TerrainGrid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = Array.from({ length: height }, () => Array(width).fill('flat'));
    }

    setTerrain(i, j, type) {
        if (this.isValidCell(i, j)) this.grid[j][i] = type;
    }

    getTerrain(i, j) {
        return this.isValidCell(i, j) ? this.grid[j][i] : null;
    }

    isValidCell(i, j) {
        return i >= 0 && j >= 0 && i < this.width && j < this.height;
    }
}