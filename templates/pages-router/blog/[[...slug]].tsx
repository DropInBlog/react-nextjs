import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { DropInBlogProvider, DropInBlogContent, RenderedResponse } from '@dropinblog/react-core';
import { createNextServerClient, getMetadata, HeadElements } from '@dropinblog/react-nextjs';

const client = createNextServerClient();

interface Props {
  data: RenderedResponse;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const slug = context.params?.slug as string[] | undefined;

  try {
    let data: RenderedResponse;

    if (!slug || slug.length === 0) {
      // /blog - main list
      data = await client.fetchMainList(1);
    } else if (slug.length === 2 && slug[0] === 'page') {
      // /blog/page/{page} - main list pagination
      const page = parseInt(slug[1], 10);
      if (isNaN(page)) return { notFound: true };
      data = await client.fetchMainList(page);
    } else if (slug.length === 2 && slug[0] === 'category') {
      // /blog/category/{slug} - category list
      data = await client.fetchCategory(slug[1], 1);
    } else if (slug.length === 4 && slug[0] === 'category' && slug[2] === 'page') {
      // /blog/category/{slug}/page/{page} - category pagination
      const page = parseInt(slug[3], 10);
      if (isNaN(page)) return { notFound: true };
      data = await client.fetchCategory(slug[1], page);
    } else if (slug.length === 2 && slug[0] === 'author') {
      // /blog/author/{slug} - author list
      data = await client.fetchAuthor(slug[1], 1);
    } else if (slug.length === 4 && slug[0] === 'author' && slug[2] === 'page') {
      // /blog/author/{slug}/page/{page} - author pagination
      const page = parseInt(slug[3], 10);
      if (isNaN(page)) return { notFound: true };
      data = await client.fetchAuthor(slug[1], page);
    } else if (slug.length === 1) {
      // /blog/{postSlug} - single post
      data = await client.fetchPost(slug[0]);
    } else {
      return { notFound: true };
    }

    return { props: { data } };
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return { notFound: true };
  }
};

export default function BlogPage({ data }: Props) {
  const metadata = getMetadata({ data, blogBaseUrl: '/blog' });

  return (
    <>
      <Head>
        <title>{metadata.title as string}</title>
        {metadata.description && <meta name="description" content={metadata.description} />}
        <HeadElements data={data} blogBaseUrl="/blog" />
      </Head>
      <DropInBlogProvider
        blogId={process.env.NEXT_PUBLIC_DROPINBLOG_BLOG_ID}
        apiToken={process.env.NEXT_PUBLIC_DROPINBLOG_API_TOKEN}
      >
        <DropInBlogContent bodyHtml={data.body_html} />
      </DropInBlogProvider>
    </>
  );
}
