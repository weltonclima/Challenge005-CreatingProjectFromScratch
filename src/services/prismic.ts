import Prismic from '@prismicio/client';
import { DefaultClient } from '@prismicio/client/types/client';

export function getPrismicClient(req?: unknown): DefaultClient {
  const prismic = Prismic.client(process.env.PRISMIC_API_ENDPOINT, {
    req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  return prismic;
}

export function linkResolver(doc) {
  if (doc.type === 'post') {
    return `/blog/${doc.uid}`
  }
  return '/'
}

export function hrefResolver(doc) {
  if (doc.type === 'post') {
    return '/blog/[uid]'
  }
  return '/'
}

