import program from 'commander';
import pkg from '../package.json';
import rewrite from './rewrite';

const version = pkg.version;

program
  .version(version);

program
  .command('convert-bind-attr <path>')
  .description('Replace {{bind-attr attr=bound}} with attr={{bound}}.')
  .action(function(path, options) {
    path = path || 'app/templates';
    rewrite(path, { outputPath: path });
  });

export default function init(args) {
  program.parse(args);
};
