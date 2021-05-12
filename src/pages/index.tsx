import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';
import { formatDate } from '../utils/formatDate';
import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)
  const [nextPageUrl, setNextPageUrl] = useState(postsPagination.next_page);

  async function handleLoadMorePosts() {
    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        const newPosts = data.results.map(post => ({
          uid: post.uid,
          first_publication_date: formatDate(post.first_publication_date),
          data: post.data,
        }));

        setPosts([...posts, ...newPosts]);
        setNextPageUrl(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Home | spacetreveling</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
        <div className={styles.posts}>
          {posts.map((post, index) => (
            <Link key={post.uid ?? index} href={`/post/${post.uid ?? '404'}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <time><FiCalendar size={16} /> {post.first_publication_date}</time>
                <span><FiUser size={16} /> {post.data.author}</span>
              </a>
            </Link>
          ))}

          {
            !!nextPageUrl &&
            <button
              type="button"
              onClick={handleLoadMorePosts}
            >
              Carregar mais posts
            </button>
          }
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 20, fetch: ['posts.title', 'posts.subtitle', 'posts.author',],
      ref: previewData?.ref ?? null,

    }
  );

  const posts = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: formatDate(post.first_publication_date),
    data: post.data,
  }));

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      },
      preview,
    },
    revalidate: 3600,
  }
};
