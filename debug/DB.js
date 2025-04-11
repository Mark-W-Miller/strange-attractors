// debug/DB.js

export function DB(dbClass, ...args) {
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

// Debug class constants
DB.UI = 'UI';
DB.INIT = 'INIT';
DB.MSE = 'MSE';
DB.RND = 'RND';
DB.RND_TERR = 'RND_TERR';
DB.RND_EGF = 'RND_EGF';
DB.DB_INIT = 'DB_INIT';
DB.CANVAS = 'CANVAS';
DB.EDIT = 'EDIT';
DB.FEEDBACK = 'FEEDBACK';
DB.EVENTS = 'EVENTS';
DB.DRAW = 'DRAW'; // New debug level for drawing routines

// All available debug levels (static, non-editable)
DB.enabledDB = new Set([
    DB.UI,
    DB.INIT,
    DB.MSE,
    DB.RND,
    DB.RND_TERR,
    DB.RND_EGF,
    DB.DB_INIT,
    DB.CANVAS,
    DB.EDIT,
    DB.FEEDBACK,
    DB.EVENTS,
    DB.DRAW // Add DRAW to the enabled debug levels
]);

// Debug levels enabled by default at startup
DB.onAtStartup = new Set([
    DB.DB_INIT,
    DB.INIT
]);

// Currently active debug levels (editable via checkboxes)
DB.dbLevelsOn = new Set();

// Utility to enable a debug level
DB.enable = function (debugClass) {
    if (DB.enabledDB.has(debugClass)) {
        DB.dbLevelsOn.add(debugClass);
        DB.saveDebugState(); // Save to localStorage
        DB.log(DB.INIT, `[DB] Enabled debug class: ${debugClass}`);
    } else {
        DB.log(DB.INIT, `[DB] Attempted to enable unknown debug class: ${debugClass}`);
    }
};

// Utility to disable a debug level
DB.disable = function (debugClass) {
    if (DB.dbLevelsOn.has(debugClass)) {
        DB.dbLevelsOn.delete(debugClass);
        DB.saveDebugState(); // Save to localStorage
        DB.log(DB.INIT, `[DB] Disabled debug class: ${debugClass}`);
    }
};

// Utility to check if a debug level is active
DB.isEnabled = function (debugClass) {
    return DB.dbLevelsOn.has(debugClass);
};

// Initialize dbLevelsOn with onAtStartup and load from localStorage
DB.initialize = function () {
    DB.dbLevelsOn = new Set(DB.onAtStartup);
    DB.loadDebugState(); // Load saved debug levels from localStorage
    DB.log(DB.INIT, '[DB] Initialized active debug levels:', Array.from(DB.dbLevelsOn));
};

// Utility to convert debug class to string
DB.classToString = function (debugClass) {
    return debugClass;
};

// Log function for internal use
DB.log = function (debugClass, ...args) {
    if (DB.dbLevelsOn.has(debugClass)) {
        console.log(`[${debugClass}]`, ...args);
    }
};

// Save the current debug state to localStorage
DB.saveDebugState = function () {
    const enabledLevels = Array.from(DB.dbLevelsOn);
    localStorage.setItem('enabledDebugLevels', JSON.stringify(enabledLevels));
    DB.log(DB.INIT, '[DB] Saved debug levels to localStorage:', enabledLevels);
};

// Load the debug state from localStorage
DB.loadDebugState = function () {
    const savedLevels = localStorage.getItem('enabledDebugLevels');
    if (savedLevels) {
        const levels = JSON.parse(savedLevels);
        levels.forEach(level => DB.dbLevelsOn.add(level));
        DB.log(DB.INIT, '[DB] Loaded debug levels from localStorage:', levels);
    }
};

// Initialize active debug levels at startup
DB.initialize();
