// debug/DB.js

export const DB = {
    // Debug class constants
    UI: 'UI',
    UI_DEEP: 'UI_DEEP',
    INIT: 'INIT',
    MSE: 'MSE',
    RND: 'RND',
    RND_TERR: 'RND_TERR',
    RND_EGF: 'RND_EGF',
    DB_INIT: 'DB_INIT',
    CANVAS: 'CANVAS',
    EDIT: 'EDIT',
    FEEDBACK: 'FEEDBACK',
    EVENTS: 'EVENTS',
    DRAW: 'DRAW',

    // All available debug levels (static, non-editable)
    enabledDB: new Set([
        'UI',
        'UI_DEEP',
        'INIT',
        'MSE',
        'RND',
        'RND_TERR',
        'RND_EGF',
        'DB_INIT',
        'CANVAS',
        'EDIT',
        'FEEDBACK',
        'EVENTS',
        'DRAW'
    ]),

    // Debug levels enabled by default at startup
    onAtStartup: new Set(['DB_INIT', 'INIT']),

    // Currently active debug levels (editable via checkboxes)
    dbLevelsOn: new Set(),

    // Utility to enable a debug level
    enable(debugClass) {
        if (this.enabledDB.has(debugClass)) {
            this.dbLevelsOn.add(debugClass);
            this.saveDebugState(); // Save to localStorage
            this.log(this.INIT, `[DB] Enabled debug class: ${debugClass}`);
        } else {
            this.log(this.INIT, `[DB] Attempted to enable unknown debug class: ${debugClass}`);
        }
    },

    // Utility to disable a debug level
    disable(debugClass) {
        if (this.dbLevelsOn.has(debugClass)) {
            this.dbLevelsOn.delete(debugClass);
            this.saveDebugState(); // Save to localStorage
            this.log(this.INIT, `[DB] Disabled debug class: ${debugClass}`);
        }
    },

    // Utility to check if a debug level is active
    isEnabled(debugClass) {
        return this.dbLevelsOn.has(debugClass);
    },

    // Initialize dbLevelsOn with onAtStartup and load from localStorage
    initialize() {
        this.dbLevelsOn = new Set(this.onAtStartup);
        this.loadDebugState(); // Load saved debug levels from localStorage
        this.log(this.INIT, '[DB] Initialized active debug levels:', Array.from(this.dbLevelsOn));
    },

    // Utility to convert debug class to string
    classToString(debugClass) {
        return debugClass;
    },

    // Log function for internal use
    log(debugClass, ...args) {
        if (this.dbLevelsOn.has(debugClass)) {
            console.log(`[${debugClass}]`, ...args);
        }
    },

    // Save the current debug state to localStorage
    saveDebugState() {
        const enabledLevels = Array.from(this.dbLevelsOn);
        localStorage.setItem('enabledDebugLevels', JSON.stringify(enabledLevels));
        this.log(this.INIT, '[DB] Saved debug levels to localStorage:', enabledLevels);
    },

    // Load the debug state from localStorage
    loadDebugState() {
        const savedLevels = localStorage.getItem('enabledDebugLevels');
        if (savedLevels) {
            const levels = JSON.parse(savedLevels);
            levels.forEach(level => this.dbLevelsOn.add(level));
            this.log(this.INIT, '[DB] Loaded debug levels from localStorage:', levels);
        }
    }
};

// Main debug logging function
export function D_(dbClass, ...args) {
    // Check if the debug class is currently active
    if (DB.dbLevelsOn.has(dbClass)) {
        const stack = new Error().stack.split('\n');
        const callerInfo = stack[2] || stack[1];
        const matched = callerInfo.match(/\((.*?):(\d+):(\d+)\)/) || callerInfo.match(/at (.*?):(\d+):(\d+)/);

        if (matched) {
            const [_, filePath, lineNumber, colNumber] = matched;
            const fileName = filePath.split('/').pop();

            const link = `${filePath}:${lineNumber}:${colNumber}`;
            console.log(
                `%c[${DB.classToString(dbClass)}] %c${fileName}:${lineNumber}`,
                'color: #FFA500; font-weight: bold;',
                'color: #039be5; text-decoration: underline; cursor: pointer;',
                ...args,
                `\n${link}`
            );
        } else {
            console.log(`[${DB.classToString(dbClass)} unknown]`, ...args);
        }
    }
}

// Initialize active debug levels at startup
DB.initialize();
