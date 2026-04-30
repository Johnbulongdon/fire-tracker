export type LearnArticle = {
  slug: string
  title: string
  description: string
  category: string
  publishedAt: string
  readTime: string
  body: string[]
}

export const learnArticles: LearnArticle[] = [
  {
    slug: 'what-is-the-4-percent-rule',
    title: 'What the 4% Rule Actually Means',
    description: 'A plain-English guide to the 4% rule, where it is useful, and where it can mislead new FIRE planners.',
    category: 'FIRE Basics',
    publishedAt: '2026-04-29',
    readTime: '5 min read',
    body: [
      'The 4% rule is a planning shortcut. It says that a portfolio can often support annual withdrawals of about 4% of its starting value, adjusted for inflation, over a long retirement.',
      'That is why many FIRE calculators multiply annual spending by 25. If you need $40,000 per year, a rough target is $1,000,000.',
      'It is useful because it turns a fuzzy goal into a concrete number. It is limited because it depends on future returns, spending flexibility, taxes, and how long you need the money to last.',
      'A good FIRE plan uses the 4% rule as a starting point, then pressure-tests it with savings rate, location, taxes, and a margin of safety.',
    ],
  },
  {
    slug: 'why-savings-rate-matters-more-than-income',
    title: 'Why Savings Rate Matters More Than Income',
    description: 'High income helps, but the percentage you keep is what moves your FIRE date the fastest.',
    category: 'FIRE Basics',
    publishedAt: '2026-04-29',
    readTime: '4 min read',
    body: [
      'Income raises your ceiling, but savings rate controls momentum. A household keeping 40% of take-home pay often reaches financial independence faster than one earning more but saving only 10%.',
      'That is because FIRE depends on the gap between what you earn and what you spend. The larger that gap, the more capital you can invest and the lower your future spending target may be.',
      'This is also why city-level cost of living matters so much. Cutting recurring expenses by moving, downsizing, or changing habits can improve both sides of the equation at once.',
      'The goal is not deprivation. It is building a durable monthly surplus that compounds for years.',
    ],
  },
  {
    slug: 'coast-fire-vs-full-fire',
    title: 'Coast FIRE vs Full FIRE',
    description: 'Two different paths to financial independence, and how to tell which one fits your current season of life.',
    category: 'Planning',
    publishedAt: '2026-04-29',
    readTime: '4 min read',
    body: [
      'Full FIRE means building a portfolio large enough to cover your spending now. Coast FIRE means building enough invested capital early that you can stop heavy saving and let compounding do the rest.',
      'Coast FIRE is often appealing when you want more flexibility before fully retiring. It can support part-time work, lower-stress jobs, or creative work without abandoning long-term independence.',
      'Full FIRE is a cleaner end state, but it usually requires a longer accumulation phase and a larger portfolio target.',
      'The right path depends on your timeline, expenses, job flexibility, and how much optionality you want along the way.',
    ],
  },
  {
    slug: 'how-fire-assumptions-change-your-retirement-date',
    title: 'How FIRE Assumptions Change Your Retirement Date',
    description: 'Small changes in savings, spending, and withdrawal assumptions can move your timeline by years. Here is how to read them clearly.',
    category: 'Planning',
    publishedAt: '2026-04-30',
    readTime: '5 min read',
    body: [
      'A FIRE date is not one fixed truth. It is the output of assumptions about income, savings, spending, growth, and withdrawal rate.',
      'Savings rate usually moves the date fastest because it improves two things at once: how much you invest and how much you may need later.',
      'Spending assumptions matter just as much. A lower recurring spending target reduces the portfolio required to retire, while a higher target pushes the goal further away.',
      'Withdrawal rate, market return, and location costs are best treated as planning levers rather than promises. The point of the calculator is to help you test tradeoffs and decide what to change next.',
    ],
  },
]

export function getLearnArticle(slug: string) {
  return learnArticles.find((article) => article.slug === slug)
}
