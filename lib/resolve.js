/**
 * 查找模块所在绝对路径
 * @author chunk.cj
 */

const fs = require('fs');
const path = require('path');

// 判断是不是文件
const isFile = path => {
  try {
    const stats = fs.statSync(path);
    return stats && stats.isFile()
  } catch(e) {
    return false;
  }
};
// 判断是不是文件夹
const isDir = path => {
  try {
    const stats = fs.statSync(path);
    return stats && stats.isDirectory()
  } catch(e) {
    return false;
  }
};

/**
 * 根据模块的标志查找到模块的绝对路径
 * @param {string} moduleIdentifier 模块的标志,可能是模块名/相对路径/绝对路径
 * @param {string} context 上下文,入口 js 所在目录
 * @returns {string} 返回模块绝对路径
 */
module.exports = (moduleIdentifier, context, options) => {
  // 模块是绝对路径,只查找一次
  if (path.isAbsolute(moduleIdentifier)) {
    if (!path.extname(moduleIdentifier)) {
      moduleIdentifier += '.js';
    }
    if (isFile(moduleIdentifier)) {
      return moduleIdentifier;
    };
  } else if (moduleIdentifier.startsWith('./') || moduleIdentifier.startsWith('../')) {
    if (!path.extname(moduleIdentifier)) {
      moduleIdentifier += '.js';
    }
    moduleIdentifier = path.resolve(context, moduleIdentifier);
    if (isFile(moduleIdentifier)) {
      return moduleIdentifier;
    };
  } else {
    // 如果上述的方式都找不到,那么尝试在当前目录的 node_modules 里面找
    
    // 1、直接是node_modules文件夹下的文件
    if (isFile(path.resolve(context, './node_modules', moduleIdentifier))) {
      return moduleIdentifier;
    };
    if (isFile(path.resolve(context, './node_modules', `${moduleIdentifier}.js`))) {
      return `${moduleIdentifier}.js`;
    }

    // 2、node_modules 文件夹下的文件夹
    if (isDir(path.resolve(context, './node_modules', moduleIdentifier))) {
      var pkg = fs.readFileSync(path.resolve(context, './node_modules', moduleIdentifier, 'package.json'));
      var pkgJSON = JSON.parse(pkg);
      var main = path.resolve(context, './node_modules', moduleIdentifier, pkgJSON.main);
      if (isFile(main)) {
        return main;
      }
    } else {
      // 逐层往根目录查找
      const dirList = context.split('/');
      dirList.shift();
      while (dirList.length > 0) {
        dirList.pop();
        const dir = `/${dirList.join('/')}`;
        const moduleDir = path.resolve(dir, './node_modules', moduleIdentifier);

        if (isFile(moduleDir)) {
          return moduleDir;
        };
        if (isFile(`${moduleDir}.js`)) {
          return `${moduleDir}.js`;
        }
        if (isDir(moduleDir)) {
          // 解析 package.json 的 main 字段获取入口
          const pkg = fs.readFileSync(path.resolve(moduleDir, 'package.json'), 'utf-8');
          const pkgJSON = JSON.parse(pkg);
          const main = path.resolve(moduleDir, pkgJSON.main);
          if (isFile(main)) {
            return main;
          }
        }
      }
    }

    return moduleIdentifier;
  }
};