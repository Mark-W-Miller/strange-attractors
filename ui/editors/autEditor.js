import { D_, DB } from '../../debug/DB.js';


export function drawAUTs(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);

    // Explicit test-dot drawing:
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 10, 0, Math.PI * 2); // centered blue dot
    ctx.fill();

    D_(DB.UI, 'AUT Canvas explicitly drawn with test blue dot.');
}
