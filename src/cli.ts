import * as program from 'commander';
import rewrite from './rewrite';

program
  .version('0.0.4');

program
  .command('convert-bind-attr <path>')
  .description('Replace {{bind-attr attr=bound}} with attr={{bound}}.')
  .option('--single-quote-mustache', 'single quotes in mustache expressions')
  .option('--double-quote-mustache', 'double quotes in mustache expressions (default)')
  .action((path, options) => {
    const outputPath = path || 'app/templates';
    const mustacheQuote = options.singleQuoteMustache ? "'" : '"';
    rewrite(outputPath, {
      formulas: ['convert-bind-attr'],
      outputPath,
      quotes: { mustache: mustacheQuote },
    });
  });

program
  .command('convert-each-in <path>')
  .description('Replace {{#each person in people}} with {{#each people as |person|}}.')
  .option('--single-quote-mustache', 'single quotes in mustache expressions')
  .option('--double-quote-mustache', 'double quotes in mustache expressions (default)')
  .action((path, options) => {
    const outputPath = path || 'app/templates';
    const mustacheQuote = options.singleQuoteMustache ? "'" : '"';
    rewrite(outputPath, {
      formulas: ['convert-each-in'],
      outputPath,
      quotes: { mustache: mustacheQuote },
    });
  });

program
  .command('convert-bindings <path>')
  .description('Replace {{foo barBinding="baz"}} with {{foo bar=baz}}.')
  .option('--single-quote-mustache', 'single quotes in mustache expressions')
  .option('--double-quote-mustache', 'double quotes in mustache expressions (default)')
  .action((path, options) => {
    const outputPath = path || 'app/templates';
    const mustacheQuote = options.singleQuoteMustache ? "'" : '"';
    rewrite(outputPath, {
      formulas: ['convert-bindings'],
      outputPath,
      quotes: { mustache: mustacheQuote },
    });
  });

program
  .command('rewrite <path>')
  .description('Parse and print. Ideally a noop but will restyle currenly.')
  .option('--single-quote-mustache', 'single quotes in mustache expressions')
  .option('--double-quote-mustache', 'double quotes in mustache expressions (default)')
  .action((path, options) => {
    const outputPath = path || 'app/templates';
    const mustacheQuote = options.singleQuoteMustache ? "'" : '"';
    rewrite(outputPath, {
      formulas: [],
      outputPath,
      quotes: { mustache: mustacheQuote },
    });
  });

export default function init(args) {
  program.parse(args);
}
