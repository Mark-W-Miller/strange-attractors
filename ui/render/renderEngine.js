import { CanvasLayer } from './canvasLayers.js';
import { D_, DB } from '../../debug/DB.js';

export class RenderEngine {
  constructor(mainCanvas, gridConfig, egf, terrainGrid, terrainImages) {
    D_(DB.RND, 'Constructor called', { gridConfig });

    this.mainCanvas = mainCanvas;
    this.ctx = mainCanvas.getContext('2d');
    this.gridConfig = gridConfig;
    this.egf = egf;
    this.terrainGrid = terrainGrid;
    this.terrainImages = terrainImages;
    this.scaleFactor = gridConfig.terrainScaleFactor;

    this.egfLayer = new CanvasLayer(mainCanvas.width, mainCanvas.height);
    this.terrainLayer = new CanvasLayer(mainCanvas.width, mainCanvas.height);
  }

  resize(width, height) {
    D_(DB.RND, 'Resizing layers', { width, height });

    this.egfLayer.canvas.width = width;
    this.egfLayer.canvas.height = height;
    this.terrainLayer.canvas.width = width;
    this.terrainLayer.canvas.height = height;
  }

  renderFull(cellSize, offsetX, offsetY) {
    D_(DB.RND, 'Rendering full canvas', { cellSize, offsetX, offsetY });

    this.renderEGFLayer(cellSize, offsetX, offsetY);
    this.renderTerrainLayer(cellSize, offsetX, offsetY);
    this.combineLayers();
  }

  renderDirty(dirtyCells, cellSize, offsetX, offsetY) {
    D_(DB.RND, 'Rendering dirty cells', { dirtyCells });

    dirtyCells.forEach(([i, j]) => {
      this.renderEGFCell(i, j, cellSize, offsetX, offsetY);
      const terrainI = Math.floor(i / this.scaleFactor);
      const terrainJ = Math.floor(j / this.scaleFactor);
      this.renderTerrainCell(terrainI, terrainJ, cellSize, offsetX, offsetY);
    });

    this.combineLayers();
  }

  renderEGFLayer(cellSize, offsetX, offsetY) {
    D_(DB.RND_EGF, 'Rendering EGF Layer');
    this.egfLayer.clear();

    for (let i = 0; i < this.egf.width; i++) {
      for (let j = 0; j < this.egf.height; j++) {
        this.renderEGFCell(i, j, cellSize, offsetX, offsetY);
      }
    }
  }

  renderEGFCell(i, j, cellSize, offsetX, offsetY) {
    const arv = this.egf.getARV(i, j);
    const brightness = 1 - (arv / 32);
    const colorValue = Math.floor(255 * brightness);

    D_(DB.RND_EGF, `EGF Cell [${i},${j}]`, { arv, brightness, colorValue });

    this.egfLayer.ctx.fillStyle = `rgb(${colorValue},${colorValue},${colorValue})`;
    const x = offsetX + i * cellSize;
    const y = offsetY + j * cellSize;

    this.egfLayer.ctx.fillRect(x, y, cellSize, cellSize);
    // Explicit red grid lines
    this.egfLayer.ctx.strokeStyle = "rgba(255,0,0,0.6)";
    this.egfLayer.ctx.strokeRect(x, y, cellSize, cellSize);
}

  renderTerrainLayer(cellSize, offsetX, offsetY) {
    D_(DB.RND_TERR, 'Rendering Terrain Layer');
    this.terrainLayer.clear();

    for (let i = 0; i < this.terrainGrid.width; i++) {
      for (let j = 0; j < this.terrainGrid.height; j++) {
        this.renderTerrainCell(i, j, cellSize, offsetX, offsetY);
      }
    }
  }

  renderTerrainCell(i, j, cellSize, offsetX, offsetY) {
    const type = this.terrainGrid.getTerrain(i, j);
    const img = this.terrainImages[type];
    const size = cellSize * this.scaleFactor;
    const x = offsetX + i * size;
    const y = offsetY + j * size;

    D_(DB.RND_TERR, `Terrain Cell [${i},${j}]`, { type, size, x, y });

    if (img.complete) {
        this.terrainLayer.ctx.globalAlpha = this.gridConfig.terrainOpacity;
        this.terrainLayer.ctx.drawImage(img, x, y, size, size);
        this.terrainLayer.ctx.globalAlpha = 1.0;
        // Explicit blue grid lines
        this.terrainLayer.ctx.strokeStyle = "rgba(0,0,255,0.6)";
        this.terrainLayer.ctx.strokeRect(x, y, size, size);
    } else {
        img.onload = () => {
            this.terrainLayer.ctx.globalAlpha = this.gridConfig.terrainOpacity;
            this.terrainLayer.ctx.drawImage(img, x, y, size, size);
            this.terrainLayer.ctx.globalAlpha = 1.0;
            this.terrainLayer.ctx.strokeStyle = "rgba(0,0,255,0.6)";
            this.terrainLayer.ctx.strokeRect(x, y, size, size);
        };
    }
}

  combineLayers() {
    D_(DB.RND, 'Combining layers');

    this.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    this.ctx.drawImage(this.egfLayer.getCanvas(), 0, 0);
    this.ctx.drawImage(this.terrainLayer.getCanvas(), 0, 0);
  }
}