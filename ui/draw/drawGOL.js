import { Database } from '../../logic/simulator/database/database.js';
import { D_, DB } from '../../debug/DB.js';

export function drawGOL(ctx, width, height) {
    const { gridWidth, gridHeight, golScaleFactor, golOpacity, gridLineColors } = Database.gridConfig;
    const golGridWidth = gridWidth / golScaleFactor;
    const golGridHeight = gridHeight / golScaleFactor;
    const cellWidth = width / golGridWidth;
    const cellHeight = height / golGridHeight;

    D_(DB.DRAW, '[drawGOL] Starting GOL layer drawing...');
    D_(DB.DRAW, '[drawGOL] GOL grid dimensions:', { golGridWidth, golGridHeight, cellWidth, cellHeight });

    ctx.globalAlpha = golOpacity;

    // Draw GOL cells
    for (let y = 0; y < golGridHeight; y++) {
        for (let x = 0; x < golGridWidth; x++) {
            const cell = Database.GOLArray[y][x];
            ctx.fillStyle = cell === 1 ? '#fff' : '#000';
            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
    }

    ctx.globalAlpha = 1.0;

    // // Draw gridlines on top
    // ctx.strokeStyle = gridLineColors.GOL || '#CCCCCC';
    // ctx.lineWidth = 1;

    // for (let x = 0; x <= golGridWidth; x++) {
    //     ctx.beginPath();
    //     ctx.moveTo(x * cellWidth, 0);
    //     ctx.lineTo(x * cellWidth, golGridHeight * cellHeight);
    //     ctx.stroke();
    // }

    // for (let y = 0; y <= golGridHeight; y++) {
    //     ctx.beginPath();
    //     ctx.moveTo(0, y * cellHeight);
    //     ctx.lineTo(golGridWidth * cellWidth, y * cellHeight);
    //     ctx.stroke();
    // }

    D_(DB.DRAW, '[drawGOL] Finished GOL layer drawing.');
}