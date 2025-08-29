import { Database } from '../database/database.js';
import { D_, DB } from '../../../debug/DB.js';
import { redrawCanvas } from '../../../ui/canvas.js'; // Import redrawCanvas from canvas.js
import { Simulation } from '../../../data/initializers/default.js';
import { DefaultRules, updateAUTPositions } from './rulesEngine.js'; // Adjust path as needed

export const Simulator = {
    isRunning: false,
    isPaused: false,
    intervalId: null,
    listeners: [],
    lastTick: 0,
    simTick: 0,

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

        this.lastTick = performance.now();
        // Remove all non-source AUTs before starting the simulation
        Database.removeAllNonSourceAUTs();

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

    resume() {
        if (!this.isPaused) {
            D_(DB.EVENTS, '[Simulator] Simulator is not paused. Resume skipped.');
            return;
        }
        this.isPaused = false;
        this.run();
        D_(DB.EVENTS, '[Simulator] Simulator resumed.');
    },

    run() {
        const FPS = Database.gridConfig.FPS || 60; // Simulation ticks per second
        const interval = 1000 / FPS; // ms per simulation tick

        if (this.intervalId) clearInterval(this.intervalId);

        this.intervalId = setInterval(() => {
            this.simTick++;
            this.updateSimulation();
            redrawCanvas();
        }, interval);
    },

    handleSpawns(AUTInstances, Database) {
        const simTick = this.simTick;
        const FPS = Database.gridConfig.FPS || 60;
        AUTInstances.forEach(aut => {
            if (aut.spawn && aut.spawn.frequencySeconds > 0 && aut.spawn.autType) {
                // Convert seconds to ticks
                const frequencyTicks = Math.round(aut.spawn.frequencySeconds * FPS);
                if (!aut.lastSpawnTick) aut.lastSpawnTick = 0;
                if (simTick - aut.lastSpawnTick >= frequencyTicks) {
                    const spawnTypeDef = Object.values(Database.AUTTypes).find(t => t.type === aut.spawn.autType);
                    if (spawnTypeDef) {
                        const newAUT = {
                            id: `${spawnTypeDef.type}-${simTick}-${Math.floor(Math.random() * 1e6)}`,
                            type: spawnTypeDef.type,
                            position: { ...aut.position },
                            velocity: { x: 0, y: 0 },
                            rules: spawnTypeDef.rules ? [...spawnTypeDef.rules] : [],
                            physics: { ...spawnTypeDef.physics },
                            graphics: { ...spawnTypeDef.graphics },
                            lastSpawnTick: 0,
                            birthTick: simTick
                        };
                        Database.AUTInstances.push(newAUT);
                        aut.lastSpawnTick = simTick;
                        D_(DB.EVENTS, `[Simulator] Spawned ${spawnTypeDef.type} at (${aut.position.x}, ${aut.position.y})`);
                    }
                }
            }
        });
    },

    handleDeath(AUTInstances, Database) {
        const simTick = this.simTick;
        const FPS = Database.gridConfig.FPS || 60;
        AUTInstances.slice().forEach(aut => {
            if (aut.physics && aut.physics.lifeTimeSeconds) {
                // Convert seconds to ticks
                const lifeTimeTicks = Math.round(aut.physics.lifeTimeSeconds * FPS);
                if (!aut.birthTick) aut.birthTick = simTick;
                if (simTick - aut.birthTick >= lifeTimeTicks) {
                    Database.removeAUTInstanceById(aut.id);
                    D_(DB.EVENTS, `[Simulator] AUT ${aut.id} (${aut.type}) died of old age.`);
                }
            }
        });
    },

    updateSimulation() {
        const { AUTInstances, gridConfig } = Database;
        const { positionScaleFactor, gridWidth, gridHeight } = gridConfig;
        const arenaWidth = gridWidth * positionScaleFactor;
        const arenaHeight = gridHeight * positionScaleFactor;

        this.handleDeath(AUTInstances, Database);
        this.handleSpawns(AUTInstances, Database);
        updateAUTPositions(AUTInstances, DefaultRules, Database, arenaWidth, arenaHeight);
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

