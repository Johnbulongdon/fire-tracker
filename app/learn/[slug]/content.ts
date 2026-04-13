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
