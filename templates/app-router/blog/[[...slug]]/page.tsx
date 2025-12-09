import { createNextServerClient, getMetadata, extractStylesAndScripts } from '@dropinblog/react-nextjs';
import { notFound } from 'next/navigation';
import Script from 'next/script';

interface PageParams {
  params: {
    slug?: string[];
  };
}

async function fetchData(slug?: string[]) {
  const client = createNextServerClient();

  if (!slug || slug.length === 0) {
    // /blog - main list
    return await client.fetchMainList(1);
  }

  if (slug.length === 2 && slug[0] === 'page') {
    // /blog/page/{page} - main list pagination
    const page = parseInt(slug[1], 10);
    if (isNaN(page)) return notFound();
    return await client.fetchMainList(page);
  }

  if (slug.length === 2 && slug[0] === 'category') {
    // /blog/category/{slug} - category list
    return await client.fetchCategory(slug[1], 1);
  }

  if (slug.length === 4 && slug[0] === 'category' && slug[2] === 'page') {
    // /blog/category/{slug}/page/{page} - category pagination
    const page = parseInt(slug[3], 10);
    if (isNaN(page)) return notFound();
    return await client.fetchCategory(slug[1], page);
  }

  if (slug.length === 2 && slug[0] === 'author') {
    // /blog/author/{slug} - author list
    return await client.fetchAuthor(slug[1], 1);
  }

  if (slug.length === 4 && slug[0] === 'author' && slug[2] === 'page') {
    // /blog/author/{slug}/page/{page} - author pagination
    const page = parseInt(slug[3], 10);
    if (isNaN(page)) return notFound();
    return await client.fetchAuthor(slug[1], page);
  }

  if (slug.length === 1) {
    // /blog/{postSlug} - single post
    return await client.fetchPost(slug[0]);
  }

  return notFound();
}

export async function generateMetadata({ params }: PageParams) {
  const resolvedParams = await params;
  const data = await fetchData(resolvedParams.slug);
  return getMetadata({ data, blogBaseUrl: '/blog' });
}

export default async function BlogPage({ params }: PageParams) {
  const resolvedParams = await params;
  const data = await fetchData(resolvedParams.slug);
  const { styles, scripts } = extractStylesAndScripts({ data, blogBaseUrl: '/blog' });

  // Extract proxyjs script
  const proxyjsScript = scripts.find(s => s.src?.includes('proxyjs'));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} suppressHydrationWarning />
      <div dangerouslySetInnerHTML={{ __html: data.body_html }} suppressHydrationWarning />
      {proxyjsScript && (
        <Script
          src={proxyjsScript.src}
          strategy="afterInteractive"
        />
      )}
      {scripts.filter(s => s.content).map((script, index) => (
        <Script
          key={`inline-${index}`}
          id={`inline-script-${index}`}
          strategy="afterInteractive"
          type={script.type}
          dangerouslySetInnerHTML={{ __html: script.content || '' }}
        />
      ))}
    </>
  );
}
