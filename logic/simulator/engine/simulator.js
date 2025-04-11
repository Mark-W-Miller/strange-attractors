import { Database } from '../database/database.js';
import { D_, DB } from '../../../debug/DB.js';
import { redrawCanvas } from '../../../ui/canvas.js'; // Import redrawCanvas from canvas.js

export const Simulator = {
    isRunning: false,
    isPaused: false,
    intervalId: null,

    start() {
        if (this.isRunning) {
            D_(DB.EVENTS, '[Simulator] Simulator is already running.');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;

        D_(DB.EVENTS, '[Simulator] Simulator started.');
        this.run();
    },

    stop() {
        if (!this.isRunning) {
            D_(DB.EVENTS, '[Simulator] Simulator is not running.');
            return;
        }

        this.isRunning = false;
        this.isPaused = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        D_(DB.EVENTS, '[Simulator] Simulator stopped.');
    },

    pause() {
        if (!this.isRunning || this.isPaused) {
            D_(DB.EVENTS, '[Simulator] Simulator is not running or already paused.');
            return;
        }

        this.isPaused = true;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        D_(DB.EVENTS, '[Simulator] Simulator paused.');
    },

    run() {
        this.intervalId = setInterval(() => {
            if (this.isPaused) return;

            // Simulation logic goes here
            D_(DB.EVENTS, '[Simulator] Running simulation step...');
            redrawCanvas(); // Call redrawCanvas directly
        }, 1000 / 60); // 60 FPS
    }
};