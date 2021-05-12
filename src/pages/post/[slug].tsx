import Prismic from '@prismicio/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';
import { formatDate, formatDateHour } from '../../utils/formatDate';
import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';
import Link from 'next/link';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
    next_post?: {
      uid: string | null;
      title: string | null;
    };
    prev_post?: {
      uid: string | null;
      title: string | null;
    };
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post({ post, preview }: PostProps) {
  const { isFallback } = useRouter();

  function getReadingTime() {
    const content = post.data.content.reduce((words, content) => {
      words += content.heading + ' ';

      const body = RichText.asText(content.body);

      words += body;

      return words;
    }, '');

    const wordCount = content.split(/\s/).length;

    return Math.ceil(wordCount / 200);
  }

  if (isFallback) {
    return (
      <h1>Carregando...</h1>
    )
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetreveling</title>
      </Head>

      <Header />

      <img className={styles.banner} src={post.data.banner.url} alt="" />

      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.postInfo}>
            <time>
              <FiCalendar size={16} />
              {post.first_publication_date}
            </time>
            <span><FiUser size={16} />{post.data.author}</span>
            <span><FiClock size={16} />{getReadingTime()} min</span>
          </div>
          {!!post.last_publication_date && (
            <div
              className={styles.last_publication_date}
            >
              <time>* editado em {post.last_publication_date}</time>
            </div>
          )}

          {post.data.content.map((content, index) => (
            <section key={index}>
              <h2>{content.heading}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}
              />
            </section>
          ))}
        </article>
        <Comments />
      </main>
      <footer className={styles.footer}>
            {post.data.prev_post?.uid ? (
              <Link href={`/post/${post.data.prev_post.uid}`}>
                <div className={styles.previous}>
                  <span>{post.data.prev_post.title}</span>
                  <a>Post anterior</a>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {post.data.next_post?.uid ? (
              <Link href={`/post/${post.data.next_post.uid}`}>
                <div className={styles.next}>
                  <span>{post.data.next_post.title}</span>
                  <a>Próximo post</a>
                </div>
              </Link>
            ) : (
              <div />
            )}
          </footer>
      {preview && (
        <aside className={commonStyles.previewPrismic}>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    { pageSize: 2, fetch: ['posts.uid'] }
  );

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {

  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const content = response.data.content.map(content => ({
    heading: content.heading,
    body: content.body,
  }));

  const nextPost = await prismic.query(
    [
      Prismic.Predicates.at('document.type', 'posts'),
      Prismic.Predicates.dateAfter(
        'document.first_publication_date',
        response.first_publication_date
      ),
    ],
    {
      fetch: ['post.results.uid', 'post.results.title'],
      pageSize: 60,
      ref: previewData?.ref ?? null,
    }
  );
  const index_next_post = nextPost.results.length - 1;
  const next_post = Boolean(nextPost.results[index_next_post]);

  const prevPost = await prismic.query(
    [
      Prismic.Predicates.at('document.type', 'posts'),
      Prismic.Predicates.dateBefore(
        'document.first_publication_date',
        response.first_publication_date
      ),
    ],
    {
      fetch: ['post.results.uid', 'post.results.title'],
      pageSize: 60,
      ref: previewData?.ref ?? null,
    }
  )
  const index_prev_post = prevPost.results.length - 1;
  const prev_post = Boolean(prevPost.results[index_prev_post]);

  const post = {
    first_publication_date: formatDate(response.first_publication_date),
    last_publication_date: formatDateHour(response.last_publication_date),
    uid: response.uid,
    data: {
      title: response.data.title,
      next_post: {
        uid: next_post ? nextPost.results[index_next_post].uid : null,
        title: next_post ? nextPost.results[index_next_post].data.title : null,
      },
      prev_post: {
        uid: prev_post ? prevPost.results[index_prev_post].uid : null,
        title: prev_post ? prevPost.results[index_prev_post].data.title : null,
      },
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content,
    },
  };

  return {
    props: {
      post,
      preview,
    },
    revalidate: 3600,
  };
};
