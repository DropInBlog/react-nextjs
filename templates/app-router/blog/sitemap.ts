import { MetadataRoute } from 'next';
import { createNextServerClient } from '@dropinblog/react-nextjs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = createNextServerClient();

  try {
    const data = await client.fetchSitemap();

    // The sitemap XML is in the 'sitemap' property, not 'body_html'
    const sitemapXml = (data as any).sitemap || data.body_html;

    if (!sitemapXml) {
      console.error('No sitemap data found');
      return [];
    }

    // Parse the XML sitemap and convert to Next.js format
    const urls = parseSitemapXml(sitemapXml);

    return urls;
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    return [];
  }
}

function parseSitemapXml(xml: string): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  // Extract URLs from XML using regex
  const urlMatches = xml.matchAll(/<url>([\s\S]*?)<\/url>/g);

  for (const match of urlMatches) {
    const urlBlock = match[1];
    const loc = urlBlock.match(/<loc>(.*?)<\/loc>/)?.[1];
    const lastmod = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
    const changefreq = urlBlock.match(/<changefreq>(.*?)<\/changefreq>/)?.[1];
    const priority = urlBlock.match(/<priority>(.*?)<\/priority>/)?.[1];

    if (loc) {
      urls.push({
        url: loc,
        lastModified: lastmod ? new Date(lastmod) : undefined,
        changeFrequency: changefreq as any,
        priority: priority ? parseFloat(priority) : undefined,
      });
    }
  }

  return urls;
}
