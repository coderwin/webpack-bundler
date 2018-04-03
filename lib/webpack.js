const fs = require('fs');
const path = require('path');
const buildDeep = require('./buildDeep');
const writeChunk = require('./writeChunk');
const templateSingle = fs.readFileSync(path.join(__dirname, 'templateSingle.js'));

module.exports = async options => {
  const mainModule = path.resolve(options.entry);
  options.context = path.dirname(mainModule);

  console.log('构建依赖树...');
  const deepTree = await buildDeep(mainModule, options);
  const deepTreeJSON = path.resolve(path.dirname(path.resolve(options.output)), 'deepTree.json');
  fs.writeFileSync(deepTreeJSON, JSON.stringify(deepTree, null, 2), "utf-8");

  console.log('拼接bundle...');
  let buffer = [];
  buffer.push(templateSingle);
  buffer.push("\n/******/({\n");
  buffer.push(writeChunk(deepTree, options));
  buffer.push("/******/})");
  buffer = buffer.join("");

  const filename = path.resolve(options.output);
  fs.writeFileSync(filename, buffer, "utf-8");
  
  console.log('压缩bundle...');
  const bf = fs.readFileSync(filename, "utf-8");
  const min = filename.replace('.js', '.min.js');
  const compile = require('google-closure-compiler-js').compile;
  const out = compile({ jsCode: [{ src: bf }] });
  fs.writeFileSync(min, out.compiledCode, "utf-8");

  console.log('completed...');
};
