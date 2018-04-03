/**
 * @file 解析模块依赖
 * @author chunk.cj
 */

const esprima = require('esprima');

/**
 * 解析模块包含的依赖
 * @param {string} source 模块内容字符串
 * @returns {object} module 解析模块得出的依赖关系
 */
module.exports = source => {
  const ast = esprima.parse(source, {
    range: true
  });
  const module = {};
  walkStatements(module, ast.body);
  module.source = source;
  return module;
};

/**
 * 遍历块中的语句
 * @param {object} module 模块对象
 * @param {object} statements AST语法树
 */
function walkStatements(module, statements) {
  statements.forEach(statement => walkStatement(module, statement));
}

/**
 * 分析每一条语句
 * @param {object} module 模块对象
 * @param {object} statement AST语法树
 */
function walkStatement(module, statement) {
  switch (statement.type) {
  case 'VariableDeclaration':
    if (statement.declarations) {
      walkVariableDeclarators(module, statement.declarations);
    }
    break;
  }
}

/**
 * 处理定义变量的语句
 * @param {object} module 模块对象
 * @param {object} declarators
 */
function walkVariableDeclarators(module, declarators) {
  declarators.forEach(declarator => {
    switch (declarator.type) {
    case 'VariableDeclarator':
      if (declarator.init) {
        walkExpression(module, declarator.init);
      }
      break;
    }
  });
}

/**
 * 处理表达式
 * @param {object} module  模块对象
 * @param {object} expression 表达式
 */
function walkExpression(module, expression) {
  switch (expression.type) {
  case 'CallExpression':
    // 处理普通的require
    if (expression.callee && expression.callee.name === 'require' && expression.callee.type === 'Identifier' && expression.arguments && expression.arguments.length === 1) {
      // TODO 此处还需处理require的计算参数
      module.requires = module.requires || [];
      const param = Array.from(expression.arguments)[0];
      module.requires.push({
        name: param.value,
        nameRange: param.range
      })
    }
    break;
  }
}