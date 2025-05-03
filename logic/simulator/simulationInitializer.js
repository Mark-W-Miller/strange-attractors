import { D_, DB } from '../../debug/DB.js';
import { Database } from './database/database.js';
import { Simulator } from './engine/simulator.js';

export async function initializeSimulation(Simulation) {
    try {
        D_(DB.DB_INIT, '[Simulation] Starting initialization...');

        // Initialize the Database with the Simulation object
        D_(DB.DB_INIT, '[Simulation] Initializing Database...');
        await Database.initialize(Simulation);
        D_(DB.DB_INIT, '[Simulation] Database initialized.');

        // Initialize the Simulator with the Database
        D_(DB.DB_INIT, '[Simulation] Initializing Simulator...');
        await Simulator.initialize(Database);
        D_(DB.DB_INIT, '[Simulation] Simulator initialized.');

        D_(DB.DB_INIT, '[Simulation] Initialization complete.');
    } catch (error) {
        console.error('[Simulation] Error during initialization:', error);
    }
}