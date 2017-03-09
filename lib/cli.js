import program from 'commander';
import pkg from '../package.json';
import rewrite from './rewrite';

const version = pkg.version;

program
  .version(version);

program
  .command('convert-bind-attr <path>')
  .description('Replace {{bind-attr attr=bound}} with attr={{bound}}.')
  .option('--single-quote-mustache', 'single quotes in mustache expressions')
  .option('--double-quote-mustache', 'double quotes in mustache expressions (default)')
  .action(function(path, options) {
    path = path || 'app/templates';
    let mustacheQuote = options.singleQuoteMustache ? "'" : '"';
    rewrite(path, {
      outputPath: path,
      quotes: { mustache: mustacheQuote },
      formulas: ['convert-bind-attr'],
    });
  });

program
  .command('rewrite <path>')
  .description('Parse and print. Ideally a noop but will restyle currenly.')
  .action(function(path, options) {
    path = path || 'app/templates';
    let mustacheQuote = options.singleQuoteMustache ? "'" : '"';
    rewrite(path, {
      outputPath: path,
      quotes: { mustache: mustacheQuote },
      formulas: [],
    });
  });


export default function init(args) {
  program.parse(args);
};
