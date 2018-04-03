/**
 * 将依赖模块名替换成依赖模块id
 * @param {object} module 模块对象
 * @returns {string} 替换模块名之后的模块内容字符串
 */

module.exports = function(module, deepTree) {
  const source = module.source;
  if (!module.requires || !module.requires.length) {
    return source.split('\n').map(line => `  ${line}\n`).join('');
  }

  const replaces = [];
  module.requires.forEach(requireItem => {
    if(requireItem.nameRange && requireItem.name) {
      const prefix = `/* ${requireItem.name} */`;
      replaces.push({
        from: requireItem.nameRange[0],
        to: requireItem.nameRange[1],
        value: prefix + deepTree.mapModuleNameToId[requireItem.name]
      });
    }
  });

  const result = [source];
  // 逐个替换模块名为模块id, 此处算法太精妙，表示太难理解了
  replaces.sort((a, b) => b.from - a.from).forEach(replace => {
    const remSource = result.shift();
    result.unshift(
      remSource.substr(0, replace.from),
      replace.value,
      remSource.substr(replace.to)
    );
  });

  // 给每行加上两个空格
  return result.join('').split('\n').map(line => `  ${line}\n`).join('');
};
