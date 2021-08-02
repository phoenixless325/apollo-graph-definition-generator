let fs = require('fs');

let DEFAULT_EXCLUDE_DIR = /^\./;
let DEFAULT_FILTER = /^([^.].*)\.js(on)?$/;
let DEFAULT_RECURSIVE = true;

module.exports = options => {
  let resultModules = [];
  
  function requireAll(options) {
    let dirname = typeof options === 'string' ? options : options.dirname;
    let excludeDirs = options.excludeDirs === void 0 ? DEFAULT_EXCLUDE_DIR : options.excludeDirs;
    let filter = options.filter === void 0 ? DEFAULT_FILTER : options.filter;
    let modules = {};
    let recursive = options.recursive === void 0 ? DEFAULT_RECURSIVE : options.recursive;
    let resolve = options.resolve || identity;
    let map = options.map || identity;
    
    function excludeDirectory(dirname) {
      return !recursive ||
        (excludeDirs && dirname.match(excludeDirs));
    }
    
    function filterFile(filename) {
      if (typeof filter === 'function') {
        return filter(filename);
      }
      
      let match = filename.match(filter);
      if (!match) return;
      
      return match[1] || match[0];
    }
    
    let files = fs.readdirSync(dirname);
    
    files.forEach((file) => {
      let filepath = dirname + '/' + file;
      if (fs.statSync(filepath).isDirectory()) {
        
        if (excludeDirectory(file)) return;
        
        let subModules = requireAll({
          dirname: filepath,
          filter: filter,
          excludeDirs: excludeDirs,
          map: map,
          resolve: resolve
        });
        
        if (Object.keys(subModules).length === 0) return;
        
        modules[map(file, filepath)] = subModules;
        
      } else {
        let name = filterFile(file);
        if (!name) return;
        
        let mod = resolve({ filePath: filepath, content: require(filepath) });
        modules[map(name, filepath)] = mod;
        resultModules.push(mod);
      }
    });
    
    return modules;
  }
  
  requireAll(options);
  return resultModules;
};

function identity(val) {
  return val;
}
