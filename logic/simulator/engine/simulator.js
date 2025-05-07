import { Database } from '../database/database.js';
import { D_, DB } from '../../../debug/DB.js';
import { redrawCanvas } from '../../../ui/canvas.js'; // Import redrawCanvas from canvas.js

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
        this.intervalId = setInterval(() => {
            if (this.isPaused) return;

            // Simulation logic goes here
            D_(DB.EVENTS, '[Simulator] Running simulation step...');
            this.updateSimulation();
            redrawCanvas(); // Call redrawCanvas directly
        }, 1000 / 60); // 60 FPS
    },

    updateSimulation() {
        const { AUTInstances, gridConfig } = Database;

        // Update each AUT based on its specific rules
        AUTInstances.forEach(aut => {
            aut.rules.forEach(ruleName => {
                const rule = Simulation.rules.find(r => r.name === ruleName);
                if (rule) {
                    rule.evaluate(aut, Database);
                }
            });

            // Update position
            aut.position.x += aut.velocity.x;
            aut.position.y += aut.velocity.y;

            // Keep AUTs within bounds
            aut.position.x = Math.max(0, Math.min(gridConfig.gridWidth - 1, aut.position.x));
            aut.position.y = Math.max(0, Math.min(gridConfig.gridHeight - 1, aut.position.y));
        });

        // Notify listeners
        this.notifyListeners();
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