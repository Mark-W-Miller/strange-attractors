// gridManager.js
export class GridManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.dirtyCells = new Set();
    }

    markDirty(i, j) {
        if (this.isValid(i, j)) this.dirtyCells.add(`${i},${j}`);
    }

    clearDirty() {
        this.dirtyCells.clear();
    }

    getDirtyCells() {
        return Array.from(this.dirtyCells).map(key => key.split(',').map(Number));
    }

    isValid(i, j) {
        return i >= 0 && j >= 0 && i < this.width && j < this.height;
    }
}