const writeSource = require("./writeSource");

module.exports = (deepTree) => {
  const buffer = [];
  const modules = deepTree.modules;
  for(let moduleName in modules) {
    const module = modules[moduleName];
    
    buffer.push("/******/");
    buffer.push(module.id);
    buffer.push(": function(module, exports, require) {\n\n");
    // buffer.push(`  /** module: ${moduleName} **/\n`);

    buffer.push(writeSource(module, deepTree));
    buffer.push("\n\n/******/},\n/******/\n");
  }
 
  return buffer.join("");
}
