import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLearnArticle, learnArticles } from '@/lib/learn'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return learnArticles.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const article = getLearnArticle(slug)

  if (!article) {
    return {}
  }

  return {
    title: `${article.title} | UntilFire`,
    description: article.description,
    alternates: {
      canonical: `https://untilfire.com/learn/${article.slug}`,
    },
  }
}

export default async function LearnArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getLearnArticle(slug)

  if (!article) {
    notFound()
  }

  return (
    <main className="uf-article-page">
      <article className="uf-article-shell">
        <Link href="/learn" className="uf-article-back">Back to learning hub</Link>
        <div className="uf-article-meta">
          <span>{article.category}</span>
          <span>{article.readTime}</span>
          <span>{article.publishedAt}</span>
        </div>
        <h1>{article.title}</h1>
        <p className="uf-article-dek">{article.description}</p>
        <div className="uf-article-body">
          {article.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  )
}
