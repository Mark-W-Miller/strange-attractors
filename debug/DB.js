// debug/DB.js

export function DB(dbClass, ...args) {
  if (DB.enabledDB.has(dbClass)) {
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

// Explicitly defining constants directly on DB
DB.MSE = 1;       // Mouse events
DB.RND = 2;       // General rendering
DB.RND_TERR = 3;  // Terrain rendering
DB.RND_EGF = 4;   // EGF rendering
DB.INIT = 5;      // Initialization debugging
DB.UI = 6;        // UI-related debugging
DB.MSE_MOVED = 7; // Mouse movement debugging

// New constants for additional debugging control
DB.DB_INIT = 8;   // Database initialization
DB.CANVAS = 9;    // Canvas-related debugging
DB.EDIT = 10;     // Editing-related debugging
DB.FEEDBACK = 11; // Mouse feedback debugging
DB.EVENTS = 12;   // Event handling debugging

// Explicitly enabled debug classes
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
  DB.EVENTS
]);


// Explicitly convert debug class to string
DB.classToString = function(dbClass) {
  switch (dbClass) {
    case DB.UI: return 'UI';
    case DB.MSE_MOVED: return 'MSE_M';
    case DB.MSE: return 'MSE';
    case DB.RND: return 'RND';
    case DB.RND_TERR: return 'RND_TERR';
    case DB.RND_EGF: return 'RND_EGF';
    case DB.INIT: return 'INIT';
    case DB.DB_INIT: return 'DB_INIT';
    case DB.CANVAS: return 'CANVAS';
    case DB.EDIT: return 'EDIT';
    case DB.FEEDBACK: return 'FEEDBACK';
    case DB.EVENTS: return 'EVENTS';
    default: return 'UNKNOWN';
  }
};

// Ensure DB.INIT and DB.DB_INIT are enabled for initialization
DB.enabledDB.add(DB.INIT);
DB.enabledDB.add(DB.DB_INIT);

// debug/DB.js (explicitly async initialization)
DB.initializeForDebug = async function(gridConfig, EGFMap, TerrainMap) {
    const { gridWidth, gridHeight, terrainScaleFactor, defaultTerrainType } = gridConfig;

    // Clear existing arrays explicitly (in-place modification)
    EGFMap.length = 0;
    TerrainMap.length = 0;

    for (let y = 0; y < gridHeight; y++) {
        EGFMap.push([]);
        for (let x = 0; x < gridWidth; x++) {
            EGFMap[y].push(Math.floor(Math.random() * 256)); // Initialize with values 0 to 255
        }
    }

    const terrainGridWidth = gridWidth / terrainScaleFactor;
    const terrainGridHeight = gridHeight / terrainScaleFactor;
    for (let y = 0; y < terrainGridHeight; y++) {
        TerrainMap.push([]);
        for (let x = 0; x < terrainGridWidth; x++) {
            TerrainMap[y].push(defaultTerrainType || 'flat');
        }
    }

    DB(DB.INIT, "EGF and Terrain maps explicitly initialized in-place.");
};