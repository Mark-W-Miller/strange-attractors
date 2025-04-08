import { Database } from '../database/database.js';

export const Simulator = {
    isRunning: false,
    isPaused: false,
    intervalId: null,

    start() {
        if (this.isRunning) {
            console.log('Simulator is already running.');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;

        console.log('Simulator started.');
        this.run();
    },

    stop() {
        if (!this.isRunning) {
            console.log('Simulator is not running.');
            return;
        }

        this.isRunning = false;
        this.isPaused = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log('Simulator stopped.');
    },

    pause() {
        if (!this.isRunning || this.isPaused) {
            console.log('Simulator is not running or already paused.');
            return;
        }

        this.isPaused = true;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log('Simulator paused.');
    },

    run() {
        this.intervalId = setInterval(() => {
            if (this.isPaused) return;

            // Simulation logic goes here
            console.log('Running simulation step...');
            Database.redrawCanvas(); // Example: Redraw the canvas
        }, 1000 / 60); // 60 FPS
    }
};