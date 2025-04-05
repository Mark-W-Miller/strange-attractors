// debug/DB.js

// Terse and clear debug constants
export const DB = {
    MSE: 1,          // Mouse events
    RND: 2,          // General rendering
    RND_TERR: 3,     // Terrain rendering
    RND_EGF: 4       // EGF rendering
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
        console.log(`[${Debug.classToString(dbClass)}]`, ...args);
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