import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LEARN_ARTICLES, getLearnArticle } from "@/lib/learn";

type LearnArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return LEARN_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: LearnArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getLearnArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found | UntilFire",
    };
  }

  return {
    title: `${article.title} | UntilFire`,
    description: article.description,
    alternates: {
      canonical: `/learn/${article.slug}`,
    },
    openGraph: {
      title: `${article.title} | UntilFire`,
      description: article.description,
      url: `https://untilfire.com/learn/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | UntilFire`,
      description: article.description,
    },
  };
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(249,115,22,0.10), transparent 32%), #08080e",
    color: "#e8e8f2",
  } as const,
  container: {
    maxWidth: "840px",
    margin: "0 auto",
    padding: "40px 24px 88px",
  } as const,
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "54px",
  } as const,
  brand: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#e8e8f2",
    textDecoration: "none",
    letterSpacing: "-0.04em",
  } as const,
  brandAccent: {
    color: "#f97316",
  } as const,
  navLink: {
    color: "#9090a8",
    textDecoration: "none",
    fontSize: "14px",
    border: "1px solid #1c1c2e",
    borderRadius: "999px",
    padding: "10px 16px",
    background: "#0d0d16",
  } as const,
  metaRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap" as const,
    color: "#81819a",
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    marginBottom: "16px",
  },
  title: {
    fontSize: "clamp(2.4rem, 7vw, 4.5rem)",
    lineHeight: 1,
    letterSpacing: "-0.05em",
    margin: 0,
  } as const,
  intro: {
    fontSize: "19px",
    lineHeight: 1.7,
    color: "#b9b9ca",
    marginTop: "20px",
  } as const,
  article: {
    marginTop: "42px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "28px",
  },
  section: {
    background: "#12121d",
    border: "1px solid #1c1c2e",
    borderRadius: "18px",
    padding: "26px 24px",
  } as const,
  heading: {
    margin: "0 0 14px",
    fontSize: "28px",
    lineHeight: 1.1,
    letterSpacing: "-0.04em",
  } as const,
  paragraph: {
    color: "#b0b0c2",
    fontSize: "17px",
    lineHeight: 1.8,
    margin: "0 0 14px",
  } as const,
  list: {
    color: "#b0b0c2",
    paddingLeft: "20px",
    margin: "8px 0 0",
    lineHeight: 1.8,
    fontSize: "16px",
  } as const,
};

export default async function LearnArticlePage({ params }: LearnArticlePageProps) {
  const { slug } = await params;
  const article = getLearnArticle(slug);

  if (!article) notFound();

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <Link href="/" style={styles.brand}>
            Until<span style={styles.brandAccent}>Fire</span>
          </Link>
          <Link href="/learn" style={styles.navLink}>
            Back to Learning Hub
          </Link>
        </nav>

        <div style={styles.metaRow}>
          <span>Learning Hub</span>
          <span>{article.readTime}</span>
          <span>{article.publishedAt}</span>
        </div>
        <h1 style={styles.title}>{article.title}</h1>
        <p style={styles.intro}>{article.description}</p>

        <article style={styles.article}>
          {article.sections.map((section) => (
            <section key={section.heading} style={styles.section}>
              <h2 style={styles.heading}>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} style={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul style={styles.list}>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
