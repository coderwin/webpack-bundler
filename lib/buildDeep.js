/**
 * @file 深度优先构建依赖树
 * @author chunk.cj
 */

const fs = require('fs');
const path = require('path');
const parse = require('./parse');
const resolve = require('./resolve');

module.exports = async(mainModule, options) => {

  let depTree = {
    // 递增模块 id
    nextModuleId: 0,
    // 用于存储各个模块对象
    modules: {},
    // 用于映射模块名到模块 id 之间的关系
    mapModuleNameToId: {},
  };

  depTree = await parseModule(depTree, mainModule, options.context, options);
  return depTree;
};

const parseModule = async(depTree, moduleName, context, options) => {
  // 查找模块
  const absoluteFileName = resolve(moduleName, context, options.resolve);
  // 用模块的绝对路径作为模块的键值,保证唯一性
  module = depTree.modules[absoluteFileName] = {
    id: depTree.nextModuleId++,
    filename: absoluteFileName,
    name: moduleName
  };

  if (!absoluteFileName) {
    throw `找不到文件${absoluteFileName}`;
  }
  const source = fs.readFileSync(absoluteFileName).toString();
  const parsedModule = parse(source);

  module.requires = parsedModule.requires || [];
  module.source = parsedModule.source;

  // 写入映射关系
  depTree.mapModuleNameToId[moduleName] = depTree.nextModuleId - 1;

  // 如果此模块有依赖的模块,采取深度遍历的原则,遍历解析其依赖的模块
  const requireModules = parsedModule.requires;
  if (requireModules && requireModules.length > 0) {
    for (let require of requireModules) {
      depTree = await parseModule(depTree, require.name, path.dirname(absoluteFileName), options);
    }
  }
  return depTree;
}