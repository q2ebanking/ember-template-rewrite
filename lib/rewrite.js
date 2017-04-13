/* eslint no-console: ["error", { allow: ["log", "error"] }] */
import path from 'path';
import broccoli from 'broccoli';
import Funnel from 'broccoli-funnel';
import Filter from 'broccoli-persistent-filter';
import fse from 'fs-extra';
import process from './process';

function Rewrite(inputNode, options = {}) {
  Filter.call(this, inputNode, {
    persist: true,
  });
  this.options = options;
}
Rewrite.prototype = Object.create(Filter.prototype);
Rewrite.prototype.constructor = Rewrite;

Rewrite.prototype.baseDir = function baseDir() {
  return path.join(__dirname, '../');
};

Rewrite.prototype.processString = function processString(template, srcFile) {
  console.log(srcFile);
  try {
    return process(template, this.options);
  } catch (e) {
    console.log(template);
    console.log({ location: e.location });
    console.log(e.trace);
    // throw e;
    return template;
  }
};

function build(tree, outputPath) {
  const builder = new broccoli.Builder(tree);
  return builder.build()
    .then(() => {
      fse.copySync(builder.outputPath, outputPath);
    })
    .finally(() => builder.cleanup())
    .catch((err) => {
      console.error(err.stack);
      process.exit(1);
    });
}

export default function rewrite(filePath, options) {
  let templates = new Funnel(filePath, {
    include: ['**/*.hbs'],
    exclude: [
      '**/node_modules/**/*',
      '**/bower_components/**/*',
    ],
  });

  templates = new Rewrite(templates, options);

  build(templates, options.outputPath);
}
