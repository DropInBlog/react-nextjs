import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

export async function installTemplates(routerType: string, targetDir: string) {
  if (routerType !== 'app' && routerType !== 'pages') {
    throw new Error('Router type must be either "app" or "pages"');
  }

  console.log(chalk.blue(`Installing DropInBlog templates for ${routerType} router...`));

  const packageRoot = path.join(__dirname, '..');
  // Prefer templates at package root; fall back to dist/templates for packages that only publish dist
  const candidates = [
    path.join(packageRoot, 'templates', `${routerType}-router`),
    path.join(packageRoot, 'dist', 'templates', `${routerType}-router`),
  ];
  const templatesDir = (await Promise.all(candidates.map((p) => fs.pathExists(p)))).reduce<string | null>((acc, exists, idx) => {
    return acc ?? (exists ? candidates[idx] : null);
  }, null) ?? candidates[0];
  const targetBlogDir = path.join(targetDir, routerType === 'app' ? 'app/blog' : 'pages/blog');

  if (!await fs.pathExists(templatesDir)) {
    throw new Error(`Templates directory not found: ${templatesDir}`);
  }

  if (await fs.pathExists(targetBlogDir)) {
    console.log(chalk.yellow(`Warning: ${targetBlogDir} already exists. It will be overwritten.`));
  }

  await fs.ensureDir(targetBlogDir);
  await fs.copy(templatesDir + '/blog', targetBlogDir, { overwrite: true });

  console.log(chalk.green('✓ Templates installed successfully!'));
  console.log(chalk.cyan('\nNext steps:'));
  console.log('1. Configure your DropInBlog API credentials in environment variables:');
  console.log('   DROPINBLOG_BLOG_ID=your-blog-id');
  console.log('   DROPINBLOG_API_TOKEN=your-api-token');
  console.log('2. Install dependencies: npm install @dropinblog/react-nextjs @dropinblog/react-core');
  console.log('3. Start your Next.js development server');
  console.log('4. Visit http://localhost:3000/blog to see your blog');
}
