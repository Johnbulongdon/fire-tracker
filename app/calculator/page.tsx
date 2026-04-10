import type { Metadata } from "next";
import CalculatorClient from "./CalculatorClient";

export const metadata: Metadata = {
  title: "Free FIRE Calculator — Retirement Calculator for Financial Independence | UntilFire",
  description:
    "The most detailed free FIRE calculator. Enter your income, expenses, investments, and debt to see exactly when you can retire. Includes wealth projection charts, savings rate, and account-by-account modeling.",
  keywords: [
    "fire calculator",
    "fire retirement calculator",
    "fire calculator retirement",
    "financial independence calculator",
    "early retirement calculator",
    "FIRE number calculator",
    "retire early calculator",
    "savings rate calculator",
    "wealth projection calculator",
  ],
  openGraph: {
    title: "Free FIRE Retirement Calculator | UntilFire",
    description:
      "Calculate exactly when you can retire with our detailed FIRE calculator. Account-by-account modeling, debt tracking, and interactive wealth charts.",
    url: "https://untilfire.com/calculator",
    siteName: "UntilFire",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free FIRE Retirement Calculator | UntilFire",
    description:
      "Calculate exactly when you can retire. Account-by-account modeling, debt tracking, and interactive wealth charts.",
  },
  alternates: { canonical: "https://untilfire.com/calculator" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "FIRE Retirement Calculator",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      url: "https://untilfire.com/calculator",
      description:
        "Free FIRE retirement calculator with account-by-account investment tracking, debt modeling, savings rate analysis, and interactive wealth projection charts.",
      featureList: [
        "401k, Roth IRA, and taxable brokerage modeling",
        "Debt paydown tracking",
        "Interactive wealth projection charts",
        "Savings rate analysis",
        "Safe withdrawal rate calculator",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a FIRE calculator?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A FIRE calculator helps you figure out when you can reach financial independence and retire early. It takes your income, expenses, savings rate, and investment returns to project how many years until your investment portfolio can sustain your lifestyle without working.",
          },
        },
        {
          "@type": "Question",
          name: "How does a FIRE retirement calculator work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A FIRE retirement calculator applies the 4% safe withdrawal rule (or your chosen rate) to your annual expenses to find your FIRE target — the portfolio size you need. It then models how long it takes your current savings rate to reach that target, assuming a historical real return of around 7% annually.",
          },
        },
        {
          "@type": "Question",
          name: "What is the FIRE number formula?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Your FIRE number = Annual Expenses ÷ Withdrawal Rate. With the 4% rule: FIRE Number = Annual Expenses × 25. For example, if you spend $60,000 per year, your FIRE number is $1,500,000.",
          },
        },
        {
          "@type": "Question",
          name: "How much do I need to retire early using the FIRE method?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Using the 4% rule, you need 25 times your annual expenses. If you spend $50,000/year you need $1.25M. If you spend $40,000/year you need $1M. The fastest way to cut years off your FIRE date is to increase your savings rate — going from 20% to 50% savings rate can cut 15+ years off your retirement date.",
          },
        },
        {
          "@type": "Question",
          name: "What is a good savings rate for FIRE?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A savings rate of 50%+ is considered FIRE-pace. At 50%, you can reach financial independence in roughly 17 years from a $0 start. At 70% savings rate, it drops to about 9 years. The higher your savings rate, the faster you reach FIRE — it's the single biggest lever you control.",
          },
        },
      ],
    },
  ],
};

export default function CalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CalculatorClient />
    </>
  );
}
