import { Database } from '../database/database.js';
import { D_, DB } from '../../../debug/DB.js';
import { redrawCanvas } from '../../../ui/canvas.js'; // Import redrawCanvas from canvas.js
import { Simulation } from '../../../data/initializers/default.js';
import { DefaultRules } from './rulesEngine.js'; // Adjust path as needed

export const Simulator = {
    isRunning: false,
    isPaused: false,
    intervalId: null,
    listeners: [], // Listeners for simulation updates

    async initialize(Database) {
        try {
            D_(DB.SIM_INIT, '[Simulator] Starting initialization...');

            // Example: Set up simulation state from the Database
            this.gridConfig = Database.gridConfig;
            this.AUTInstances = Database.AUTInstances;
            this.Rules = Database.Rules;

            // Additional setup logic here...
            D_(DB.SIM_INIT, '[Simulator] Simulation state initialized:', {
                gridConfig: this.gridConfig,
                AUTInstances: this.AUTInstances,
                Rules: this.Rules,
            });

            D_(DB.SIM_INIT, '[Simulator] Initialization complete.');
        } catch (error) {
            console.error('[Simulator] Error during initialization:', error);
            throw error;
        }
    },

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
        const { FPS } = Database.gridConfig; // Get FPS from the gridConfig
        const interval = 1000 / FPS; // Calculate interval in milliseconds

        this.intervalId = setInterval(() => {
            this.updateSimulation();
            redrawCanvas(); // Call redrawCanvas directly
        }, interval); // Use the calculated interval
    },

    updateSimulation() {
        const { AUTInstances, gridConfig } = Database;
        const { positionScaleFactor, gridWidth, gridHeight } = gridConfig;

        const arenaWidth = gridWidth * positionScaleFactor;
        const arenaHeight = gridHeight * positionScaleFactor;

        AUTInstances.forEach(aut => {
            let positionUpdated = false;
            aut.rules.forEach(ruleName => {
                const ruleFn = DefaultRules[ruleName];
                if (typeof ruleFn === 'function') {
                    // If the rule returns true, it handled the position update
                    if (ruleFn(aut, Database) === true) {
                        positionUpdated = true;
                    }
                }
            });

            // Only update position if no rule handled it
            if (!positionUpdated) {
                aut.position.x += aut.velocity.x;
                aut.position.y += aut.velocity.y;
            }

            // Keep AUTs within bounds
            aut.position.x = Math.max(0, Math.min(arenaWidth - 1, aut.position.x));
            aut.position.y = Math.max(0, Math.min(arenaHeight - 1, aut.position.y));
        });

        this.notifyListeners();
    },

    updateInterval(newFPS) {
        if (!this.isRunning) {
            D_(DB.EVENTS, '[Simulator] Simulator is not running. Interval update skipped.');
            return;
        }

        // Update the FPS in the Database
        Database.gridConfig.FPS = newFPS;

        // Calculate the new interval
        const interval = 1000 / newFPS;

        // Clear the existing interval and set a new one
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            this.updateSimulation();
            redrawCanvas(); // Call redrawCanvas directly
        }, interval);

        D_(DB.EVENTS, `[Simulator] Interval updated to ${interval} ms (FPS: ${newFPS}).`);
    },

    addListener(listener) {
        if (typeof listener !== 'function') {
            console.error('[Simulator] Listener must be a function.');
            return;
        }
        this.listeners.push(listener);
        D_(DB.EVENTS, '[Simulator] Listener added.');
    },

    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
        D_(DB.EVENTS, '[Simulator] Listener removed.');
    },

    notifyListeners() {
        this.listeners.forEach(listener => listener(Database));
    },
};