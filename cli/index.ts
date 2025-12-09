import { Command } from 'commander';
import { installTemplates } from './installer';

const program = new Command();

program
  .name('dropinblog-nextjs')
  .description('CLI to install DropInBlog templates for Next.js')
  .version('1.0.0');

program
  .command('install')
  .description('Install DropInBlog templates into your Next.js project')
  .option('-r, --router <type>', 'Router type: app or pages', 'app')
  .option('-d, --dir <directory>', 'Target directory for installation', process.cwd())
  .action(async (options) => {
    try {
      await installTemplates(options.router, options.dir);
    } catch (error) {
      console.error('Installation failed:', error);
      process.exit(1);
    }
  });

program.parse();
