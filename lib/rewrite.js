import path from 'path';
import broccoli from 'broccoli';
import Funnel from 'broccoli-funnel';
import Filter from 'broccoli-persistent-filter';
import process from './process';
import fse from 'fs-extra';

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
  try {
    return process(template, this.options);
  } catch(e) {
    console.log(template);
    console.log({ location: e.location });
    console.log(e.trace);
    // throw e;
    return template;
  }
};

function build(tree, outputPath) {
  let builder = new broccoli.Builder(tree);
  return builder.build()
    .then(function() {
      fse.copySync(builder.outputPath, outputPath);
    })
    .finally(function () {
      return builder.cleanup();
    })
    .catch(function (err) {
      console.error(err.stack);
      process.exit(1);
    });
}

export default function rewrite(path, options) {
  let templates = new Funnel(path, {
    include: ['**/*.hbs'],
    exclude: [
      '**/node_modules/**/*',
      '**/bower_components/**/*'
    ]
  });

  templates = new Rewrite(templates, options);

  build(templates, options.outputPath);
}
