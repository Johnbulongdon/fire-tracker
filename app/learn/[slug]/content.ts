export type LearnContent = {
  title: string
  metaTitle: string
  metaDescription: string
  heroSub: string
  stats: { label: string; value: string }[]
  sections: { heading: string; body: string }[]
  faqs: { q: string; a: string }[]
  ctaLabel: string
  ctaHref: string
  related: { href: string; label: string; sub: string }[]
}

const CONTENT: Record<string, LearnContent> = {
  'fire-number': {
    title: 'What Is a FIRE Number?',
    metaTitle: 'What Is a FIRE Number? — Definition & Calculator | UntilFire',
    metaDescription:
      'Your FIRE number is the portfolio size that lets you retire early. Learn how it\'s calculated, what assumptions matter, and how to find yours in 60 seconds.',
    heroSub: 'The one number that separates working because you have to from working because you want to.',
    stats: [
      { label: 'Safe Withdrawal Rate', value: '4%' },
      { label: 'Avg. FIRE Number (US)', value: '$1.5M' },
      { label: 'Savings rate to hit it in 15 yrs', value: '45%' },
      { label: 'Years of data behind the 4% rule', value: '50+' },
    ],
    sections: [
      {
        heading: 'How the FIRE number is calculated',
        body: 'Your FIRE number = annual expenses ÷ safe withdrawal rate. At the standard 4% rule, that\'s annual expenses × 25. If you spend $60,000/year, your target is $1.5M. The logic: a well-diversified portfolio historically survives a 4% annual draw for 30+ years across every market cycle since 1926.',
      },
      {
        heading: 'Why the withdrawal rate matters more than the number',
        body: 'Dropping your withdrawal rate from 4% to 3.5% adds $214,000 to a $60k/year target — but also makes failure in backtests nearly zero. Raising it to 4.5% cuts $167k off the target but increases sequence-of-returns risk. Most early retirees aim for 3.5–4% given a potentially 40–50 year retirement horizon.',
      },
      {
        heading: 'Location changes your FIRE number dramatically',
        body: 'A $60k lifestyle in San Francisco might cost $35k in Lisbon and $25k in Chiang Mai. That\'s a FIRE number of $1.5M vs $875k vs $625k — a 58% difference. Geographic arbitrage is one of the most powerful levers in early retirement planning.',
      },
    ],
    faqs: [
      { q: 'Is the 4% rule still valid?', a: 'Yes for most scenarios. Research from Bengen and the Trinity Study both support it. For retirements longer than 30 years, many planners use 3.5% for extra margin.' },
      { q: 'Does my FIRE number include Social Security?', a: 'No — but if you plan to claim Social Security, you can subtract the present value of expected benefits, which meaningfully reduces your required portfolio.' },
      { q: 'How do I reduce my FIRE number?', a: 'Lower your annual spending, plan for geographic flexibility, or accept part-time income (Barista FIRE). Each $1,000 reduction in annual spend cuts $25,000 from your target.' },
    ],
    ctaLabel: 'Calculate My FIRE Number',
    ctaHref: '/',
    related: [
      { href: '/learn/how-to-calculate-your-fire-number', label: 'How to Calculate Your FIRE Number', sub: 'Step-by-step walkthrough' },
      { href: '/learn/what-is-coast-fire', label: 'What Is Coast FIRE?', sub: 'Let compounding do the heavy lifting' },
      { href: '/coast-fire-calculator', label: 'Coast FIRE Calculator', sub: 'Free interactive tool' },
    ],
  },

  'what-is-coast-fire': {
    title: 'What Is Coast FIRE?',
    metaTitle: 'What Is Coast FIRE? Definition, Formula & Calculator | UntilFire',
    metaDescription:
      'Coast FIRE means saving enough early so your portfolio grows to your FIRE number without another dollar of contributions. Learn the formula and find your Coast number.',
    heroSub: 'Save hard early, then let compound interest carry you to the finish line — no more contributions required.',
    stats: [
      { label: 'Coast number at age 30 (retire at 65)', value: '~$173k' },
      { label: 'Assumed annual growth rate', value: '7%' },
      { label: 'Years of compounding (30→65)', value: '35' },
      { label: 'Reduction vs full FIRE target', value: 'up to 75%' },
    ],
    sections: [
      {
        heading: 'The Coast FIRE formula',
        body: 'Coast FIRE Number = FIRE Target ÷ (1 + growth rate)^years_until_retirement. If your FIRE target is $1.25M, you plan to retire at 65, and you\'re currently 30, you need $1,250,000 ÷ (1.07)^35 ≈ $116,000 invested today. After that, your portfolio coasts to the finish without another contribution.',
      },
      {
        heading: 'What "coasting" actually means day-to-day',
        body: 'Once you hit your Coast number you can switch to covering only living expenses — no mandatory retirement saving. Many people use this milestone to take lower-paying but more fulfilling work, reduce hours, or move to a lower cost-of-living city. Your portfolio keeps compounding in the background.',
      },
    ],
    faqs: [
      { q: 'Does Coast FIRE require me to stop working?', a: 'No. You still need income to cover current expenses. The point is you no longer need to save for retirement — just pay your bills and let the market do the rest.' },
      { q: 'What growth rate should I use?', a: 'Most Coast FIRE calculations use 7% real (inflation-adjusted) returns, based on long-run US equity averages. Using 6% gives a more conservative target.' },
      { q: 'How is Coast FIRE different from Barista FIRE?', a: 'They\'re related but distinct. Coast FIRE is a savings milestone. Barista FIRE is a lifestyle where part-time income covers expenses while the portfolio grows — you can be Barista FIRE without having hit your Coast number yet.' },
    ],
    ctaLabel: 'Calculate My Coast FIRE Number',
    ctaHref: '/coast-fire-calculator',
    related: [
      { href: '/learn/fire-number', label: 'What Is a FIRE Number?', sub: 'The foundation of all FIRE math' },
      { href: '/learn/how-to-calculate-your-fire-number', label: 'How to Calculate Your FIRE Number', sub: 'Full walkthrough' },
      { href: '/barista-fire-calculator', label: 'Barista FIRE Calculator', sub: 'Part-time income + portfolio' },
    ],
  },

  'barista-fire': {
    title: 'What Is Barista FIRE?',
    metaTitle: 'What Is Barista FIRE? Definition, Formula & Calculator | UntilFire',
    metaDescription:
      'Barista FIRE means saving enough so part-time income covers your expenses gap — and your portfolio covers the rest. Learn the formula and find your Barista FIRE number.',
    heroSub: 'Semi-retire early: cover living costs with part-time work, let your portfolio handle the rest.',
    stats: [
      { label: 'Portfolio covers', value: 'Gap only' },
      { label: 'Part-time income replaces', value: '30–60%' },
      { label: 'Smaller target vs full FIRE', value: '40–60%' },
      { label: 'Typical part-time hours/wk', value: '15–25' },
    ],
    sections: [
      {
        heading: 'The Barista FIRE formula',
        body: 'Barista FIRE Number = (Annual Expenses − Part-Time Income) ÷ Safe Withdrawal Rate. If you spend $60k/year, earn $24k part-time, and use a 4% SWR, your portfolio target is ($60k − $24k) ÷ 0.04 = $900,000 — 40% less than the $1.5M full FIRE target. The name comes from coffee shop workers who use employer health benefits as part of the strategy.',
      },
      {
        heading: 'Why Barista FIRE works as a bridge strategy',
        body: 'Most people can\'t stomach staying fully employed until a $1.5M+ portfolio is reached. Barista FIRE lets you leave the high-stress job years earlier, take on flexible work you actually enjoy, and still reach full FIRE as your portfolio compounds. Many people discover they prefer the semi-retired lifestyle permanently — the part-time income and social structure make full retirement unnecessary.',
      },
      {
        heading: 'Choosing the right part-time income source',
        body: 'The best Barista FIRE income is flexible, location-independent, and low-stress. Popular choices: barista/hospitality (free benefits), freelance consulting in your prior field, seasonal work, online tutoring, or part-time remote work. The key criteria: does it cover the gap reliably, and do you not hate doing it?',
      },
    ],
    faqs: [
      { q: 'Does part-time income need to be stable?', a: 'Ideally yes — but it doesn\'t need to be guaranteed. Most Barista FIRE planners use a conservative estimate of part-time income (e.g. 75% of expected) to build in a buffer.' },
      { q: 'What happens if I can\'t find part-time work?', a: 'Your portfolio needs to cover full expenses at 4% SWR, same as traditional FIRE. Barista FIRE is a reduction in required portfolio, not an elimination of the safety net.' },
      { q: 'Is Barista FIRE the same as Coast FIRE?', a: 'No. Coast FIRE is a savings milestone — your portfolio will grow to your FIRE target without more contributions. Barista FIRE is a lifestyle — you actively earn part-time income to cover an expenses gap.' },
    ],
    ctaLabel: 'Calculate My Barista FIRE Number',
    ctaHref: '/barista-fire-calculator',
    related: [
      { href: '/learn/what-is-coast-fire', label: 'What Is Coast FIRE?', sub: 'The savings milestone before full FIRE' },
      { href: '/learn/fire-number', label: 'What Is a FIRE Number?', sub: 'Full FIRE target basics' },
      { href: '/barista-fire-calculator', label: 'Barista FIRE Calculator', sub: 'Free interactive tool' },
    ],
  },

  'lean-fire': {
    title: 'What Is Lean FIRE?',
    metaTitle: 'What Is Lean FIRE? Frugal Early Retirement Explained | UntilFire',
    metaDescription:
      'Lean FIRE is retiring early on a frugal budget — typically under $40k/year. Learn what it takes, who it suits, and how to calculate your Lean FIRE number.',
    heroSub: 'Retire early by living lean: a smaller number, a faster timeline, a deliberately simple life.',
    stats: [
      { label: 'Typical annual spend', value: '<$40k' },
      { label: 'FIRE number at $30k/yr', value: '$750k' },
      { label: 'FIRE number at $40k/yr', value: '$1M' },
      { label: 'vs. average US spend', value: '40% less' },
    ],
    sections: [
      {
        heading: 'What defines Lean FIRE',
        body: 'There\'s no official threshold, but the FIRE community generally treats Lean FIRE as retiring on under $40,000/year (individual) or $60,000/year (couple). At $30k/year with a 4% SWR, the target is $750,000 — reachable in under a decade for high-income earners with strong savings discipline. The tradeoff is a budget that leaves little room for lifestyle inflation, travel upgrades, or unexpected expenses.',
      },
      {
        heading: 'Who Lean FIRE suits best',
        body: 'Lean FIRE works best for people who genuinely prefer simplicity over spending: minimalists, outdoor enthusiasts, those in low-cost-of-living cities or abroad, and people with low fixed costs (paid-off home, no dependents). It doesn\'t suit people who expect lifestyle costs to rise significantly — healthcare in later years being the most common budget-buster.',
      },
    ],
    faqs: [
      { q: 'Is Lean FIRE risky long-term?', a: 'The main risks are healthcare cost inflation and lifestyle creep. Many Lean FIRE retirees keep a small income stream (gig work, consulting) as a buffer — which also pushes them toward Barista FIRE in practice.' },
      { q: 'Can I Lean FIRE in a high cost-of-living city?', a: 'Rarely. Lean FIRE almost always requires either a low-LCOL location or geographic arbitrage — living abroad in countries like Portugal, Thailand, or Mexico where $30-40k/year provides a comfortable life.' },
      { q: 'How is Lean FIRE different from regular FIRE?', a: 'Regular (or "Traditional") FIRE typically assumes $50–80k/year in spending. Lean FIRE is the frugal end; Fat FIRE is the high-spend end. The math is identical — only the annual expense input changes.' },
    ],
    ctaLabel: 'Calculate My FIRE Number',
    ctaHref: '/',
    related: [
      { href: '/learn/fat-fire', label: 'What Is Fat FIRE?', sub: 'High-spend early retirement' },
      { href: '/learn/fire-number', label: 'What Is a FIRE Number?', sub: 'The 25x rule explained' },
      { href: '/learn/how-to-calculate-your-fire-number', label: 'How to Calculate Your FIRE Number', sub: 'Step-by-step guide' },
    ],
  },

  'fat-fire': {
    title: 'What Is Fat FIRE?',
    metaTitle: 'What Is Fat FIRE? High-Spend Early Retirement Explained | UntilFire',
    metaDescription:
      'Fat FIRE means retiring early without sacrificing your lifestyle — typically on $100k+/year. Learn the target, the timeline, and whether it\'s right for you.',
    heroSub: 'Retire early and keep the lifestyle — no budgeting, no compromises, just a larger number to hit.',
    stats: [
      { label: 'Typical annual spend', value: '$100k+' },
      { label: 'FIRE number at $100k/yr', value: '$2.5M' },
      { label: 'FIRE number at $150k/yr', value: '$3.75M' },
      { label: 'Median high-income timeline', value: '15–20 yrs' },
    ],
    sections: [
      {
        heading: 'What defines Fat FIRE',
        body: 'Fat FIRE is informal for retiring early on $100,000/year or more in spending. At $100k/year with a 4% SWR, the portfolio target is $2.5M. At $150k, it\'s $3.75M. The appeal is a retirement without lifestyle trade-offs: business class flights, private health coverage, dining out regularly, and funding adult children\'s lives if desired. The tradeoff is a longer working timeline to accumulate the larger portfolio.',
      },
      {
        heading: 'How to realistically reach Fat FIRE',
        body: 'Fat FIRE typically requires either high income ($200k+/year household), equity events (startup exits, RSU vesting, business sales), or both. High savings rates alone rarely get someone to $2.5M+ inside 15 years on median income. The most common Fat FIRE path: high-earning professional career (finance, tech, medicine, law) combined with a savings rate above 40% and equity compensation.',
      },
      {
        heading: 'Fat FIRE vs. staying one more year',
        body: 'The biggest Fat FIRE risk isn\'t investment returns — it\'s "just one more year" syndrome. Because the number is large and always growing with lifestyle inflation, many Fat FIRE candidates delay indefinitely. Setting a firm target (e.g. $3M by age 50, not $3M adjusted for whatever I want by then) and committing to it is the most important behavioral step.',
      },
    ],
    faqs: [
      { q: 'Is Fat FIRE achievable on a single income?', a: 'Yes, but rare below $250k/year salary. It\'s more common with dual high-income households, equity compensation, or a liquidity event like a business sale.' },
      { q: 'Does Fat FIRE require a 4% SWR?', a: 'Many Fat FIRE planners use 3.5% for a 40–50 year horizon, which pushes a $100k/year target to $2.86M. The extra margin matters less in dollar terms when the portfolio is large, but emotionally provides more security.' },
      { q: 'What\'s the difference between Fat FIRE and just being wealthy?', a: 'Fat FIRE specifically means having enough invested to fund retirement indefinitely — it\'s about financial independence, not net worth. A $5M paid-off home and no investments isn\'t Fat FIRE.' },
    ],
    ctaLabel: 'Calculate My Fat FIRE Number',
    ctaHref: '/',
    related: [
      { href: '/learn/lean-fire', label: 'What Is Lean FIRE?', sub: 'Frugal early retirement' },
      { href: '/learn/barista-fire', label: 'What Is Barista FIRE?', sub: 'Semi-retirement planning' },
      { href: '/learn/fire-number', label: 'What Is a FIRE Number?', sub: 'The 25x rule explained' },
    ],
  },

  'how-to-calculate-your-fire-number': {
    title: 'How to Calculate Your FIRE Number',
    metaTitle: 'How to Calculate Your FIRE Number — Step-by-Step Guide | UntilFire',
    metaDescription:
      'A plain-English walkthrough: track your annual expenses, pick a withdrawal rate, and multiply. Includes adjustments for taxes, Social Security, and geographic arbitrage.',
    heroSub: 'Five inputs. One number. A clear date to work toward.',
    stats: [
      { label: 'Step 1 input', value: 'Annual spend' },
      { label: 'Withdrawal rate (standard)', value: '4%' },
      { label: 'Multiplier', value: '25×' },
      { label: 'Time to calculate', value: '60 sec' },
    ],
    sections: [
      {
        heading: 'Step 1 — Track your real annual expenses',
        body: 'The single most important number is what you actually spend per year, not what you earn. Include housing, food, transport, healthcare, travel, and fun. Most people underestimate by 15–20%. Pull 12 months of bank and credit card statements for accuracy. This is your annual spend (AS).',
      },
      {
        heading: 'Step 2 — Pick a withdrawal rate and multiply',
        body: 'FIRE Number = AS ÷ SWR. At 4%: multiply AS by 25. At 3.5%: multiply by 28.6. At 3%: multiply by 33. Choose based on your expected retirement length — the younger you retire, the lower the rate you should use. A 35-year-old retiring at 40 has 50+ years of draw; 3.5% is safer than 4%.',
      },
      {
        heading: 'Step 3 — Adjust for your situation',
        body: 'Subtract the present value of any pension or Social Security you\'ll receive. Add back a healthcare cost buffer if you\'re retiring before Medicare eligibility (age 65 in the US). If you plan to move countries, recalculate AS using the destination cost of living — this alone can reduce your target by 30–50%.',
      },
    ],
    faqs: [
      { q: 'Should I include my home equity in my FIRE number?', a: 'Only if you plan to sell and rent, or downsize. A paid-off home reduces required portfolio income but doesn\'t generate cash — factor it in as an expense reducer, not an asset.' },
      { q: 'How do I account for inflation?', a: 'The 4% rule already adjusts withdrawals for inflation each year. Your FIRE number is in today\'s dollars. If you\'re 20 years from retiring, the nominal portfolio target will be higher due to inflation, but your calculator should handle that math.' },
      { q: 'What if my expenses change in retirement?', a: 'Many retirees find a U-shaped spending curve: higher early (travel, activity), lower in middle years, higher again late (healthcare). Model an average, then add a 10% buffer for unexpected costs.' },
    ],
    ctaLabel: 'Calculate My FIRE Number Now',
    ctaHref: '/',
    related: [
      { href: '/learn/fire-number', label: 'What Is a FIRE Number?', sub: 'Concepts behind the math' },
      { href: '/learn/what-is-coast-fire', label: 'What Is Coast FIRE?', sub: 'Milestone before full FIRE' },
      { href: '/barista-fire-calculator', label: 'Barista FIRE Calculator', sub: 'Semi-retirement planning' },
    ],
  },
}

export function getLearnContent(slug: string): LearnContent | null {
  return CONTENT[slug] ?? null
}

export function getAllSlugs(): string[] {
  return Object.keys(CONTENT)
}
