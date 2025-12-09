import { GetServerSideProps } from 'next';
import { createNextServerClient } from '@dropinblog/react-nextjs';

const client = createNextServerClient();

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const data = await client.fetchSitemap();

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.write(data.sitemap);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
