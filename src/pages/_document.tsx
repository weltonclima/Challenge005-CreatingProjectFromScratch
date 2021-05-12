import Document, { Html, Head, Main, NextScript } from 'next/document';
const repoName = process.env.PRISMIC_API_ENDPOINT.match(/https?:\/\/([^.]+)?\.(cdn\.)?.+/)

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
          <link rel="shortcut icon" href="/favicon.png" type="image/png" />
          <script async defer src={`"https://static.cdn.prismic.io/prismic.js?new=true&repo=${repoName}"`} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
