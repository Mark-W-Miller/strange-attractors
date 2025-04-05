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

// Explicitly enabled debug classes
DB.enabledDB = new Set([
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