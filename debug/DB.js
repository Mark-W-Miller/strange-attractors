// debug/DB.js

export const DB = {
  MSE: 1,       // Mouse events
  RND: 2,       // General rendering
  RND_TERR: 3,  // Terrain rendering
  RND_EGF: 4    // EGF rendering
};

export class Debug {
  static enabledClasses = new Set([
      DB.MSE,
      DB.RND,
      DB.RND_TERR,
      DB.RND_EGF
  ]);

  static log(dbClass, ...args) {
      if (Debug.enabledClasses.has(dbClass)) {
          const stack = new Error().stack.split('\n');
          const callerInfo = stack[2] || stack[1];
          const matched = callerInfo.match(/(?:at\s+)(.*?):(\d+):\d+/);

          let location = 'unknown';
          if (matched) {
              const filePath = matched[1].split('/').pop();
              const lineNumber = matched[2];
              location = `${filePath}:${lineNumber}`;
          }

          console.log(`[${Debug.classToString(dbClass)} ${location}]`, ...args);
      }
  }

  static classToString(dbClass) {
      switch (dbClass) {
          case DB.MSE: return 'MSE';
          case DB.RND: return 'RND';
          case DB.RND_TERR: return 'RND_TERR';
          case DB.RND_EGF: return 'RND_EGF';
          default: return 'UNKNOWN';
      }
  }
}