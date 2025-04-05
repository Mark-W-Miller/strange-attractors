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
// debug/DB.js (existing contents plus:)
DB.INIT = 5;  // explicitly new class for initialization debugging

// Explicitly enabled debug classes
DB.enabledDB = new Set([
  DB.INIT,
  DB.MSE,
  DB.RND,
  DB.RND_TERR,
  DB.RND_EGF
]);

// Explicitly convert debug class to string
DB.classToString = function(dbClass) {
  switch (dbClass) {
      case DB.MSE: return 'MSE';
      case DB.RND: return 'RND';
      case DB.RND_TERR: return 'RND_TERR';
      case DB.RND_EGF: return 'RND_EGF';
      default: return 'UNKNOWN';
  }
};


// Ensure DB.INIT is enabled for initialization
DB.enabledDB.add(DB.INIT);

// Explicit initialization for debugging
DB.initializeForDebug = function(gridConfig, EGFMap, TerrainMap) {
    if (!DB.enabledDB.has(DB.INIT)) return;

    DB(DB.INIT, "Initializing maps explicitly for debug.");

    // Initialize EGF map explicitly with ARV gradient (min → max)
    const { gridWidth, gridHeight, initialARV } = gridConfig;
    const minARV = -10; // explicit min ARV
    const maxARV = 10;  // explicit max ARV

    for (let y = 0; y < gridHeight; y++) {
        EGFMap[y] = [];
        for (let x = 0; x < gridWidth; x++) {
            // Explicit left-to-right linear gradient calculation
            const arv = minARV + (x / (gridWidth - 1)) * (maxARV - minARV);
            EGFMap[y][x] = arv;
        }
    }

    DB(DB.INIT, "EGF Map initialized explicitly:", EGFMap);

    // Initialize Terrain map explicitly with default type from gridConfig
    const terrainType = gridConfig.defaultTerrainType || "flat";
    const terrainGridWidth = gridWidth / gridConfig.terrainScaleFactor;
    const terrainGridHeight = gridHeight / gridConfig.terrainScaleFactor;

    for (let y = 0; y < terrainGridHeight; y++) {
        TerrainMap[y] = [];
        for (let x = 0; x < terrainGridWidth; x++) {
            TerrainMap[y][x] = terrainType;
        }
    }

    DB(DB.INIT, "Terrain Map initialized explicitly:", TerrainMap);
};