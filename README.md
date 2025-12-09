# @dropinblog/react-nextjs

Next.js adapter for [@dropinblog/react-core](https://www.npmjs.com/package/dropinblog-react-core) with server-side rendering support.

## Features

- Full server-side rendering (SSR) support
- Pre-built templates for both App Router and Pages Router
- SEO-optimized with Next.js metadata API
- Support for Next.js 15 and 16
- Easy CLI installation

## Installation

```bash
npm install @dropinblog/react-nextjs @dropinblog/react-core
```

## Quick Start

### 1. Configure Environment Variables

Create a `.env.local` file in your Next.js project:

```env
DROPINBLOG_BLOG_ID=your_dropinblog_blog_id
DROPINBLOG_API_TOKEN=your_dropinblog_api_token
```

### 2. Install Templates

Use the CLI to install the blog templates:

#### For App Router (Next.js 13+)

```bash
npx dropinblog-nextjs install --router app
```

#### For Pages Router

```bash
npx dropinblog-nextjs install --router pages
```

This will create all necessary blog pages in your Next.js project:

- `/blog` - Main blog list
- `/blog/page/[page]` - Paginated blog list
- `/blog/category/[slug]` - Category pages
- `/blog/category/[slug]/page/[page]` - Paginated category pages
- `/blog/author/[slug]` - Author pages
- `/blog/author/[slug]/page/[page]` - Paginated author pages
- `/blog/[slug]` - Single post pages
- `/blog/sitemap.xml` - Sitemap
- `/blog/feed` - RSS feed
- `/blog/feed/category/[slug]` - Category RSS feeds
- `/blog/feed/author/[slug]` - Author RSS feeds

## License

MIT
