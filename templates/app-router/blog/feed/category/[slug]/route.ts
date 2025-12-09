import { createNextServerClient } from '@dropinblog/react-nextjs';

const client = createNextServerClient();

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await client.fetchCategoryFeed(slug);
  const feedXml = (data as any).feed || data.body_html;

  return new Response(feedXml, {
    status: 200,
    headers: {
      'Content-Type': data.content_type ?? 'application/rss+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
