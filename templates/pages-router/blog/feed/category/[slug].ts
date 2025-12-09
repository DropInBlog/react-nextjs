import { GetServerSideProps } from 'next';
import { createNextServerClient } from '@dropinblog/react-nextjs';

const client = createNextServerClient();

export const getServerSideProps: GetServerSideProps = async ({ res, params }) => {
  const slug = params?.slug as string;
  const data = await client.fetchCategoryFeed(slug);

  res.setHeader('Content-Type', data.content_type);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.write(data.feed);
  res.end();

  return { props: {} };
};

export default function CategoryFeed() {
  return null;
}
