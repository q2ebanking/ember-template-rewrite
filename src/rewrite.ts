// tslint:disable:no-console
import * as broccoli from 'broccoli';
import * as Funnel from 'broccoli-funnel';
import * as Filter from 'broccoli-filter';
import fse from 'fs-extra';
import processTemplate from './process';

function Rewrite(inputNode, options = {}) {
  Filter.call(this, inputNode, {
    persist: true,
  });
  this.options = options;
}
Rewrite.prototype = Object.create(Filter.prototype);
Rewrite.prototype.constructor = Rewrite;

Rewrite.prototype.processString = function processString(template, srcFile) {
  console.log(srcFile);
  try {
    return processTemplate(template, this.options);
  } catch (e) {
    console.log(template);
    console.log(e);
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
      console.log('err');
      console.error(err.stack);
      process.exit(1);
    });
}

export default function rewrite(filePath, options) {
  let templates = new Funnel(filePath, {
    exclude: [
      '**/node_modules/**/*',
      '**/bower_components/**/*',
    ],
    include: ['**/*.hbs'],
  });

  templates = new Rewrite(templates, options);

  build(templates, options.outputPath);
}
