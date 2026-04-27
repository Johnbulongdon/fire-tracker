import type { Metadata } from "next";
import Link from "next/link";
import { LEARN_ARTICLES } from "@/lib/learn";

export const metadata: Metadata = {
  title: "Learning Hub | UntilFire",
  description:
    "Browse UntilFire guides on FIRE math, location-based financial independence, and practical early-retirement planning.",
  alternates: {
    canonical: "/learn",
  },
  openGraph: {
    title: "Learning Hub | UntilFire",
    description:
      "Browse UntilFire guides on FIRE math, location-based financial independence, and practical early-retirement planning.",
    url: "https://untilfire.com/learn",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learning Hub | UntilFire",
    description:
      "Browse UntilFire guides on FIRE math, location-based financial independence, and practical early-retirement planning.",
  },
};

const shellStyles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(22,163,74,0.08), transparent 30%), #f8fafc",
    color: "#111827",
  } as const,
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 24px 80px",
  } as const,
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "48px",
  } as const,
  brand: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#111827",
    textDecoration: "none",
    letterSpacing: "-0.04em",
  } as const,
  brandAccent: {
    color: "#16a34a",
  } as const,
  backLink: {
    color: "#64748b",
    textDecoration: "none",
    fontSize: "14px",
    border: "1px solid #dbe4dd",
    borderRadius: "999px",
    padding: "10px 16px",
    background: "#ffffff",
  } as const,
  eyebrow: {
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#16a34a",
    marginBottom: "14px",
    fontWeight: 700,
  } as const,
  title: {
    fontSize: "clamp(2.3rem, 7vw, 4.6rem)",
    lineHeight: 1,
    letterSpacing: "-0.05em",
    margin: 0,
    maxWidth: "760px",
  } as const,
  intro: {
    maxWidth: "700px",
    marginTop: "18px",
    color: "#475569",
    fontSize: "18px",
    lineHeight: 1.7,
  } as const,
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
    marginTop: "42px",
  } as const,
  card: {
    display: "block",
    background: "#ffffff",
    border: "1px solid #dbe4dd",
    borderRadius: "18px",
    padding: "22px",
    textDecoration: "none",
    color: "inherit",
    minHeight: "240px",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
  } as const,
  meta: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap" as const,
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
  cardTitle: {
    fontSize: "26px",
    lineHeight: 1.1,
    letterSpacing: "-0.04em",
    margin: "0 0 12px",
  } as const,
  cardText: {
    color: "#475569",
    lineHeight: 1.65,
    fontSize: "15px",
    margin: 0,
  } as const,
  cardFooter: {
    marginTop: "18px",
    color: "#16a34a",
    fontSize: "14px",
    fontWeight: 700,
  } as const,
};

const articles = [...LEARN_ARTICLES].sort((a, b) => a.title.localeCompare(b.title));

export default function LearnHubPage() {
  return (
    <main style={shellStyles.page}>
      <div style={shellStyles.container}>
        <nav style={shellStyles.nav}>
          <Link href="/" style={shellStyles.brand}>
            Until<span style={shellStyles.brandAccent}>Fire</span>
          </Link>
          <Link href="/dashboard" style={shellStyles.backLink}>
            Dashboard
          </Link>
        </nav>

        <div style={shellStyles.eyebrow}>Learning Hub</div>
        <h1 style={shellStyles.title}>FIRE guides you can actually build from.</h1>
        <p style={shellStyles.intro}>
          This is the SEO layer and the actual learning surface. Every article here lives in the repo,
          feeds the sitemap, and can be expanded without inventing a separate CMS.
        </p>

        <div style={shellStyles.grid}>
          {articles.map((article) => (
            <Link key={article.slug} href={`/learn/${article.slug}`} style={shellStyles.card}>
              <div style={shellStyles.meta}>
                <span>{article.readTime}</span>
                <span>{article.publishedAt}</span>
              </div>
              <h2 style={shellStyles.cardTitle}>{article.title}</h2>
              <p style={shellStyles.cardText}>{article.excerpt}</p>
              <div style={shellStyles.cardFooter}>Read article</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
