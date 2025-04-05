// debug/DB.js

export const DB_CLASS = {
  MSE: 1,       // Mouse events
  RND: 2,       // General rendering
  RND_TERR: 3,  // Terrain rendering
  RND_EGF: 4    // EGF rendering
};

export const enabledDB = new Set([
  DB_CLASS.MSE,
  DB_CLASS.RND,
  DB_CLASS.RND_TERR,
  DB_CLASS.RND_EGF
]);

export function DB(dbClass, ...args) {
  if (enabledDB.has(dbClass)) {
      const stack = new Error().stack.split('\n');
      const callerInfo = stack[2] || stack[1];
      const matched = callerInfo.match(/\((.*?):(\d+):(\d+)\)/) || callerInfo.match(/at (.*?):(\d+):(\d+)/);

      if (matched) {
          const [_, filePath, lineNumber, colNumber] = matched;
          const fileName = filePath.split('/').pop();

          const link = `${filePath}:${lineNumber}:${colNumber}`;
          console.log(
              `%c[${classToString(dbClass)}] %c${fileName}:${lineNumber}`,
              'color: #FFA500; font-weight: bold;',
              'color: #039be5; text-decoration: underline; cursor: pointer;',
              ...args,
              `\n${link}`
          );
      } else {
          console.log(`[${classToString(dbClass)} unknown]`, ...args);
      }
  }
}

function classToString(dbClass) {
  switch (dbClass) {
      case DB_CLASS.MSE: return 'MSE';
      case DB_CLASS.RND: return 'RND';
      case DB_CLASS.RND_TERR: return 'RND_TERR';
      case DB_CLASS.RND_EGF: return 'RND_EGF';
      default: return 'UNKNOWN';
  }
}