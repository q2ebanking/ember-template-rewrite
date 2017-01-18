import path from 'path';
import fs from 'fs';
import broccoli from 'broccoli';
import Funnel from 'broccoli-funnel';
import Filter from 'broccoli-persistent-filter';
import copy from 'copy-dereference';
import process from './process';

function read(path) {
  return fs.readFileSync(path, { encoding: 'utf8' });
}

function write(path, source) {
  fs.writeFileSync(path, source, { encoding: 'utf8' });
}

function Rewrite(inputNode, options) {
  options = options || {};
  Filter.call(this, inputNode, {
    persist: true,
  });
  this.options = options;
}
Rewrite.prototype = Object.create(Filter.prototype);
Rewrite.prototype.constructor = Rewrite;

Rewrite.prototype.baseDir = function() {
  return path.join(__dirname, '../');
};

Rewrite.prototype.processString = function(template, srcFile) {
  console.log(srcFile);
  return process(template);
};

function build(tree) {
  let builder = new broccoli.Builder(tree);
  return builder.build()
    .then(function() {
      copy.sync(builder.outputPath, 'tmp');
    })
    .finally(function () {
      return builder.cleanup();
    })
    .catch(function (err) {
      console.error(err.stack);
      process.exit(1);
    });
}

export default function rewrite(path) {
  let templates = new Funnel(path, {
    include: ['**/*.hbs']
  });

  templates = new Rewrite(templates);

  build(templates);
}
