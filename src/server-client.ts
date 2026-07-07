import { DropInBlogClient } from '@dropinblog/react-core/server';
import type { ResolvedDropInBlogConfig } from '@dropinblog/react-core/server';
import { NextDropInBlogConfig, NextServerClient } from './types';

const DEFAULT_BASE_PATH = 'blog';
const DEFAULT_API_BASE_URL = 'https://api.dropinblog.com/v2';
const DEFAULT_FIELDS = ['head_data', 'body_html', 'head_items', 'head_html'];
const DEFAULT_CACHE_TTL = 1000 * 60 * 5; // 5 minutes

function readServerEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process?.env) {
    return process.env[key] || process.env[`NEXT_PUBLIC_${key}`];
  }
  return undefined;
}

function normalizeBasePath(input?: string) {
  const trimmed = (input ?? DEFAULT_BASE_PATH).trim();
  const withoutSlashes = trimmed.replace(/^\/+/, '').replace(/\/+$/, '');
  const normalized = withoutSlashes.length ? withoutSlashes : DEFAULT_BASE_PATH;
  const baseParts = normalized.split('/').filter(Boolean);
  const baseSegment = baseParts.join('/');
  const basePath = `/${baseSegment}`;
  return { baseSegment, basePath, baseParts };
}

function ensureFetch(fetchImpl?: typeof fetch): typeof fetch {
  if (fetchImpl) return fetchImpl;
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch.bind(globalThis);
  }
  throw new Error('Fetch implementation is required');
}

function withBlogUrl(fetchImpl: typeof fetch, blogUrl?: string): typeof fetch {
  if (!blogUrl) {
    return fetchImpl;
  }
  return ((input, init) => {
    try {
      const urlString =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const url = new URL(urlString);
      if (!url.searchParams.has('blogurl')) {
        url.searchParams.set('blogurl', blogUrl);
      }
      return fetchImpl(url.toString(), init);
    } catch {
      return fetchImpl(input as Parameters<typeof fetch>[0], init);
    }
  }) as typeof fetch;
}

function resolveServerConfig(config: NextDropInBlogConfig = {}): ResolvedDropInBlogConfig {
  const blogId = config.blogId ?? readServerEnv('DROPINBLOG_BLOG_ID');
  const apiToken = config.apiToken ?? readServerEnv('DROPINBLOG_API_TOKEN');

  if (!blogId) {
    throw new Error('DROPINBLOG_BLOG_ID environment variable is required');
  }
  if (!apiToken) {
    throw new Error('DROPINBLOG_API_TOKEN environment variable is required');
  }

  const { basePath, baseSegment, baseParts } = normalizeBasePath(config.basePath);
  const explicitBlogUrl = config.blogUrl ?? readServerEnv('DROPINBLOG_BLOG_URL');
  const derivedBlogUrl = config.requestOrigin
    ? `${config.requestOrigin.replace(/\/+$/, '')}${basePath}`
    : undefined;
  const blogUrl = explicitBlogUrl ?? derivedBlogUrl;

  return {
    blogId,
    apiToken,
    basePath,
    baseSegment,
    baseParts,
    apiBaseUrl: (config.apiBaseUrl ?? DEFAULT_API_BASE_URL).replace(/\/$/, ''),
    fetchImpl: withBlogUrl(ensureFetch(config.fetchImpl), blogUrl),
    cacheTtlMs: config.cacheTtlMs ?? DEFAULT_CACHE_TTL,
    defaultFields: config.defaultFields ?? DEFAULT_FIELDS,
  };
}

export function createNextServerClient(config: NextDropInBlogConfig = {}): NextServerClient {
  const resolvedConfig = resolveServerConfig(config);
  const client = new DropInBlogClient(resolvedConfig);

  return {
    fetchMainList: (page = 1) => client.fetchMainList(page),
    fetchCategory: (slug: string, page = 1) => client.fetchCategory(slug, page),
    fetchAuthor: (slug: string, page = 1) => client.fetchAuthor(slug, page),
    fetchPost: (slug: string) => client.fetchPost(slug),
    fetchSitemap: () => client.fetchSitemap(),
    fetchFeed: () => client.fetchFeed(),
    fetchCategoryFeed: (slug: string) => client.fetchCategoryFeed(slug),
    fetchAuthorFeed: (slug: string) => client.fetchAuthorFeed(slug),
  };
}
