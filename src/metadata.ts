import { Metadata } from 'next';
import { buildHeadDescriptors, HeadDescriptor } from '@dropinblog/react-core/server';
import { NextMetadataProps } from './types';

export function getMetadata(props: NextMetadataProps): Metadata {
  const { data, blogBaseUrl } = props;
  const descriptors = buildHeadDescriptors(data.head_data, data.head_items);

  const metadata: Metadata = {};

  descriptors.forEach((descriptor: HeadDescriptor) => {
    const tag = descriptor.tag.toLowerCase();

    if (tag === 'title' && descriptor.content) {
      metadata.title = descriptor.content;
    }

    if (tag === 'meta') {
      const name = descriptor.attributes?.name;
      const property = descriptor.attributes?.property;
      const content = descriptor.attributes?.content;

      if (name === 'description' && content) {
        metadata.description = content;
      }

      if (property === 'og:title' && content) {
        metadata.openGraph = metadata.openGraph || {};
        metadata.openGraph.title = content;
      }

      if (property === 'og:description' && content) {
        metadata.openGraph = metadata.openGraph || {};
        metadata.openGraph.description = content;
      }

      if (property === 'og:image' && content) {
        metadata.openGraph = metadata.openGraph || {};
        metadata.openGraph.images = [{ url: content }];
      }

      if (name === 'twitter:title' && content) {
        metadata.twitter = metadata.twitter || {};
        metadata.twitter.title = content;
      }

      if (name === 'twitter:description' && content) {
        metadata.twitter = metadata.twitter || {};
        metadata.twitter.description = content;
      }

      if (name === 'twitter:image' && content) {
        metadata.twitter = metadata.twitter || {};
        metadata.twitter.images = [content];
      }

      if (name === 'robots' && content) {
        metadata.robots = content;
      }
    }

    if (tag === 'link') {
      const rel = descriptor.attributes?.rel;
      const href = descriptor.attributes?.href;

      if (rel === 'canonical' && href) {
        metadata.alternates = metadata.alternates || {};
        metadata.alternates.canonical = href;
      }
    }
  });

  return metadata;
}

export interface HeadElementDescriptor {
  tag: string;
  attributes?: Record<string, string | boolean>;
  content?: string;
}

export function getHeadElementDescriptors(props: NextMetadataProps): HeadElementDescriptor[] {
  const { data } = props;
  const descriptors = buildHeadDescriptors(data.head_data, data.head_items);

  const elements: HeadElementDescriptor[] = [];

  descriptors.forEach((descriptor: HeadDescriptor) => {
    const tag = descriptor.tag.toLowerCase();

    if (tag === 'style' && descriptor.content) {
      elements.push({
        tag: 'style',
        content: descriptor.content,
      });
      return;
    }

    if (tag === 'script') {
      if (descriptor.attributes?.type === 'application/ld+json' && descriptor.content) {
        elements.push({
          tag: 'script',
          attributes: { type: 'application/ld+json' },
          content: descriptor.content,
        });
        return;
      }

      if (descriptor.attributes?.src) {
        const { src, defer, async, type, ...rest } = descriptor.attributes;
        elements.push({
          tag: 'script',
          attributes: {
            src,
            defer: defer === 'true' || defer === 'defer',
            async: async === 'true' || async === 'async',
            type,
            ...rest,
          },
        });
        return;
      }
    }

    if (tag === 'link' && descriptor.attributes?.rel === 'stylesheet') {
      elements.push({
        tag: 'link',
        attributes: descriptor.attributes,
      });
    }
  });

  return elements;
}

export function extractStylesAndScripts(props: NextMetadataProps): {
  styles: string;
  scripts: Array<{ src?: string; content?: string; type?: string }>;
} {
  const descriptors = getHeadElementDescriptors(props);
  let styles = '';
  const scripts: Array<{ src?: string; content?: string; type?: string }> = [];

  descriptors.forEach((descriptor) => {
    if (descriptor.tag === 'style' && descriptor.content) {
      styles += descriptor.content;
    }
    if (descriptor.tag === 'script') {
      scripts.push({
        src: descriptor.attributes?.src as string | undefined,
        content: descriptor.content,
        type: descriptor.attributes?.type as string | undefined,
      });
    }
  });

  return { styles, scripts };
}
