import { DropInBlogConfig, RenderedResponse } from '@dropinblog/react-core';

export interface NextServerClient {
  fetchMainList(page?: number): Promise<RenderedResponse>;
  fetchCategory(slug: string, page?: number): Promise<RenderedResponse>;
  fetchAuthor(slug: string, page?: number): Promise<RenderedResponse>;
  fetchPost(slug: string): Promise<RenderedResponse>;
  fetchSitemap(): Promise<RenderedResponse>;
  fetchFeed(): Promise<RenderedResponse>;
  fetchCategoryFeed(slug: string): Promise<RenderedResponse>;
  fetchAuthorFeed(slug: string): Promise<RenderedResponse>;
}

export interface NextMetadataProps {
  data: RenderedResponse;
  blogBaseUrl: string;
}

export interface NextDropInBlogConfig extends DropInBlogConfig {
  blogBaseUrl?: string;
}
