export type LearnArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LearnArticle = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
  sections: LearnArticleSection[];
};

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    slug: "fire-number",
    title: "What Is a FIRE Number and How Do You Calculate It?",
    description:
      "Understand what a FIRE number means, why it matters, and how spending drives the amount you need for financial independence.",
    excerpt:
      "Your FIRE number is the portfolio size that can support your lifestyle without full-time work. The math starts with spending, not income.",
    publishedAt: "2026-04-27",
    readTime: "6 min read",
    sections: [
      {
        heading: "Start with annual spending",
        paragraphs: [
          "A FIRE number is usually built from the amount you expect to spend each year once work becomes optional.",
          "If your lifestyle costs $50,000 per year, the question becomes how large your portfolio needs to be to cover that spending reliably.",
        ],
      },
      {
        heading: "Use the rule of 25 as a baseline",
        paragraphs: [
          "A common shortcut is the 25x rule. Multiply annual spending by 25 to estimate the invested assets needed to support that lifestyle.",
          "Someone spending $50,000 per year would start with a rough FIRE target of $1.25 million.",
        ],
        bullets: [
          "Annual spending of $40,000 points to about $1,000,000",
          "Annual spending of $60,000 points to about $1,500,000",
          "Annual spending of $80,000 points to about $2,000,000",
        ],
      },
      {
        heading: "Why spending matters more than income",
        paragraphs: [
          "High income helps, but spending controls both sides of the equation. It affects how much you can save now and how much you will need later.",
          "That is why small recurring cost changes can move your timeline by years.",
        ],
      },
      {
        heading: "Treat it as a planning number",
        paragraphs: [
          "A FIRE number is a useful planning anchor, not a guarantee. Taxes, market returns, healthcare, and location all shape the real-world outcome.",
          "The best calculators let you refine the baseline over time instead of pretending one number answers everything forever.",
        ],
      },
    ],
  },
  {
    slug: "fire-in-hong-kong",
    title: "FIRE in Hong Kong: What to Know Before You Plan",
    description:
      "Hong Kong can offer strong earning power and dense convenience, but housing pressure changes how people approach FIRE there.",
    excerpt:
      "In Hong Kong, the biggest FIRE variable is often housing. A compact lifestyle can work, but rent and family expectations reshape the plan.",
    publishedAt: "2026-04-27",
    readTime: "5 min read",
    sections: [
      {
        heading: "Housing dominates the equation",
        paragraphs: [
          "Hong Kong rewards efficiency, but it also punishes expensive housing choices. Rent or ownership costs can swallow a large share of take-home pay.",
          "That makes housing the first lever to examine when building a realistic FIRE plan.",
        ],
      },
      {
        heading: "Savings rate matters more than prestige spending",
        paragraphs: [
          "In a high-cost city, lifestyle inflation is easy to normalize. Expensive dining, convenience, and status spending can quietly stretch the timeline.",
          "The most resilient Hong Kong FIRE plans protect a strong savings rate first and let everything else fit around it.",
        ],
      },
      {
        heading: "Plan for optionality",
        paragraphs: [
          "Many people considering FIRE in Hong Kong also think about relocation, partial retirement, or a lower-cost base later on.",
          "Running both a stay-put plan and a future-relocation plan can make the decision much clearer.",
        ],
      },
    ],
  },
  {
    slug: "fire-in-bali",
    title: "FIRE in Bali: Lower Costs, Different Tradeoffs",
    description:
      "Bali is often treated as a dream FIRE destination, but low costs only help if your assumptions around visas, healthcare, and lifestyle are honest.",
    excerpt:
      "Bali can reduce your spend dramatically, but a FIRE plan there needs more than optimistic rent estimates and internet-daydream math.",
    publishedAt: "2026-04-27",
    readTime: "5 min read",
    sections: [
      {
        heading: "Cost advantages are real",
        paragraphs: [
          "For many remote workers and early retirees, Bali offers a meaningful drop in housing, food, and service costs compared with major Western cities.",
          "That can lower the portfolio target required for financial independence.",
        ],
      },
      {
        heading: "Low cost does not mean no friction",
        paragraphs: [
          "Visa rules, travel needs, imported goods, private healthcare, and changing neighborhood dynamics can all raise the practical cost of staying long term.",
          "A FIRE plan built only on the cheapest possible monthly number is usually too fragile.",
        ],
      },
      {
        heading: "Model the real lifestyle",
        paragraphs: [
          "If you want comfort, community, and flexibility, use those assumptions in your numbers from day one.",
          "The goal is not the lowest theoretical FIRE number. It is a number that matches the life you would actually want to live.",
        ],
      },
    ],
  },
  {
    slug: "fire-in-lisbon",
    title: "FIRE in Lisbon: Lifestyle Appeal Meets Rising Costs",
    description:
      "Lisbon remains attractive for financial independence planning, but recent price pressure means old cost assumptions age quickly.",
    excerpt:
      "Lisbon still offers a strong lifestyle case for FIRE, but the easy-mode version of the story has faded as housing and daily costs rise.",
    publishedAt: "2026-04-27",
    readTime: "5 min read",
    sections: [
      {
        heading: "Do not use outdated expense assumptions",
        paragraphs: [
          "Lisbon built a reputation as a lower-cost European base, but rents and everyday costs have moved enough that old blog posts can badly understate the budget.",
          "A current FIRE plan needs current housing numbers, not inherited internet folklore.",
        ],
      },
      {
        heading: "FIRE here can still work well",
        paragraphs: [
          "If your spending expectations fit the city, Lisbon can still support an attractive balance of weather, walkability, food, and access to the rest of Europe.",
          "That quality-of-life mix is a real input into the value of the plan.",
        ],
      },
      {
        heading: "Stress-test with a housing buffer",
        paragraphs: [
          "Housing volatility is the cleanest place to build margin into the model.",
          "When the numbers only work with unusually cheap rent, the timeline is probably too optimistic.",
        ],
      },
    ],
  },
  {
    slug: "fire-in-tokyo",
    title: "FIRE in Tokyo: Efficient, Urban, and Surprisingly Nuanced",
    description:
      "Tokyo can look intimidating from the outside, but FIRE math there depends less on hype and more on how you choose to live.",
    excerpt:
      "Tokyo is not simply cheap or expensive. It rewards intentional tradeoffs, especially around housing, commuting, and convenience spending.",
    publishedAt: "2026-04-27",
    readTime: "5 min read",
    sections: [
      {
        heading: "Tokyo is highly lifestyle-dependent",
        paragraphs: [
          "Two people can have very different FIRE numbers in Tokyo depending on neighborhood, housing size, transit habits, and food patterns.",
          "That makes local assumptions more useful than broad national averages.",
        ],
      },
      {
        heading: "Convenience can support frugality",
        paragraphs: [
          "Dense transit, predictable services, and compact living can make daily life more efficient than people expect.",
          "For some households, that efficiency offsets part of the cost pressure of living in a major global city.",
        ],
      },
      {
        heading: "Translate quality of life into spending",
        paragraphs: [
          "The best Tokyo FIRE plan is not about proving the city is cheap. It is about deciding what level of comfort, space, and flexibility matters to you.",
          "Once those choices are explicit, the portfolio target becomes much more believable.",
        ],
      },
    ],
  },
  {
    slug: "fire-in-singapore",
    title: "FIRE in Singapore: High Income Potential, High Cost Discipline",
    description:
      "Singapore can accelerate wealth building, but your FIRE timeline depends on whether your savings rate survives the city’s convenience and housing costs.",
    excerpt:
      "Singapore can be excellent for accumulating assets, but only if a strong income translates into a protected savings rate.",
    publishedAt: "2026-04-27",
    readTime: "5 min read",
    sections: [
      {
        heading: "Strong incomes can compress the timeline",
        paragraphs: [
          "Singapore often works well for professionals with high earnings and stable career growth.",
          "That income strength can make a large FIRE target more manageable than it first appears.",
        ],
      },
      {
        heading: "Cost creep is the main threat",
        paragraphs: [
          "Housing, transport choices, and frequent convenience spending can quietly absorb the advantage of a strong salary.",
          "The city rewards people who treat savings rate as a system, not a monthly accident.",
        ],
      },
      {
        heading: "Separate accumulation from retirement location",
        paragraphs: [
          "Some people build wealth in Singapore and plan to spend less elsewhere later. Others want to stay long term and need a larger permanent target.",
          "Running both versions of the plan can reveal whether the city is your accumulation engine, your retirement destination, or both.",
        ],
      },
    ],
  },
  {
    slug: "fire-in-san-francisco",
    title: "FIRE in San Francisco: Big Salaries, Big Levers",
    description:
      "San Francisco can feel impossible for FIRE at first glance, yet the city also creates some of the largest savings opportunities when income is strong.",
    excerpt:
      "San Francisco is expensive, but it also magnifies the payoff from intentional housing, compensation, and career choices.",
    publishedAt: "2026-04-27",
    readTime: "6 min read",
    sections: [
      {
        heading: "Income changes the story",
        paragraphs: [
          "A high-cost city with average income is brutal. A high-cost city with strong compensation can still support a fast path to FIRE.",
          "That is why San Francisco plans need real take-home and real spending, not emotional reactions to headline prices.",
        ],
      },
      {
        heading: "Housing is the biggest lever",
        paragraphs: [
          "The gap between shared housing, modest housing, and premium housing is massive.",
          "One housing decision can move your annual spend more than a dozen smaller frugal hacks combined.",
        ],
      },
      {
        heading: "Career upside belongs in the model",
        paragraphs: [
          "In some cities, FIRE planning is mostly about cost control. In San Francisco, compensation growth can matter just as much.",
          "The cleanest plan usually tracks both spending discipline and plausible income growth over time.",
        ],
      },
    ],
  },
  {
    slug: "fire-in-new-york",
    title: "FIRE in New York: Ambition, Density, and Expensive Defaults",
    description:
      "New York offers huge earning potential and endless convenience, but the default version of life there can slow FIRE fast.",
    excerpt:
      "New York is full of high-opportunity paths to FIRE, but only if you deliberately resist the city’s expensive default settings.",
    publishedAt: "2026-04-27",
    readTime: "6 min read",
    sections: [
      {
        heading: "Defaults are expensive",
        paragraphs: [
          "It is easy to normalize premium rent, frequent dining out, and paid convenience in New York.",
          "That default drift matters because FIRE responds more to recurring spending than to occasional splurges.",
        ],
      },
      {
        heading: "The income side can still be powerful",
        paragraphs: [
          "New York also gives many professionals access to high-paying work, dense networks, and career upside.",
          "When those opportunities are real, FIRE becomes a balance problem rather than a simple cost problem.",
        ],
      },
      {
        heading: "Design your version of the city",
        paragraphs: [
          "A New York FIRE plan works best when you decide what version of New York you actually want to fund long term.",
          "Once that picture is clear, your spending target becomes far more grounded and useful.",
        ],
      },
    ],
  },
  {
    slug: "fire-in-london",
    title: "FIRE in London: Make Room for Housing and Long-Term Friction",
    description:
      "London remains a compelling city for ambitious savers, but a FIRE plan there needs margin for housing, taxes, and quality-of-life expectations.",
    excerpt:
      "London can absolutely fit a FIRE plan, but only when the budget reflects real housing and lifestyle choices rather than idealized city living.",
    publishedAt: "2026-04-27",
    readTime: "5 min read",
    sections: [
      {
        heading: "Housing sets the tone",
        paragraphs: [
          "For many London households, housing is the decision that shapes everything else.",
          "If rent or mortgage costs dominate take-home pay, the rest of the budget has less room to breathe.",
        ],
      },
      {
        heading: "Transport and convenience add up",
        paragraphs: [
          "London’s daily convenience can be brilliant, but transport, eating out, and social spending can become background noise that stretches the timeline.",
          "Those are worth tracking precisely because they feel normal.",
        ],
      },
      {
        heading: "Build with realism, not martyrdom",
        paragraphs: [
          "A durable FIRE plan for London should still feel like London, not like a punishment fantasy that falls apart in six months.",
          "The best target is the one you can actually maintain while still liking your life.",
        ],
      },
    ],
  },
  {
    slug: "fire-in-chiang-mai",
    title: "FIRE in Chiang Mai: Low Spend Can Be a Superpower",
    description:
      "Chiang Mai is a classic lower-cost FIRE destination, but the strongest plans still account for change, comfort, and sustainability.",
    excerpt:
      "Chiang Mai can dramatically lower the cost side of FIRE, but the plan should fit your actual standards for stability and health.",
    publishedAt: "2026-04-27",
    readTime: "5 min read",
    sections: [
      {
        heading: "Lower spending changes the math fast",
        paragraphs: [
          "When living costs drop meaningfully, the required portfolio target can fall with them.",
          "That is why Chiang Mai remains a popular reference point in location-flexible FIRE planning.",
        ],
      },
      {
        heading: "Keep the plan durable",
        paragraphs: [
          "The lowest possible monthly budget is not always the most sustainable one.",
          "Healthcare, travel, changing neighborhoods, and the desire for more comfort often raise the long-term spending floor.",
        ],
      },
      {
        heading: "Use honest assumptions",
        paragraphs: [
          "If the version of Chiang Mai you want includes strong internet, air quality workarounds, flexible travel, and private healthcare, put those into the model.",
          "That honesty is what turns a fantasy budget into a real FIRE plan.",
        ],
      },
    ],
  },
  {
    slug: "fire-in-austin",
    title: "FIRE in Austin: A Growth City That Rewards Intentional Spending",
    description:
      "Austin can offer strong income opportunities and a good quality of life, but growth has made cost assumptions less forgiving than they used to be.",
    excerpt:
      "Austin still works well for many FIRE-minded households, but the old low-cost narrative no longer tells the whole story.",
    publishedAt: "2026-04-27",
    readTime: "5 min read",
    sections: [
      {
        heading: "Old Austin numbers can mislead",
        paragraphs: [
          "Rapid growth changed rent, home prices, and the general cost baseline enough that older FIRE assumptions may no longer hold.",
          "Current planning needs current local data.",
        ],
      },
      {
        heading: "There is still real upside",
        paragraphs: [
          "Austin can still support strong income growth and a lifestyle many people enjoy.",
          "That combination keeps it relevant for people trying to balance earning power with quality of life.",
        ],
      },
      {
        heading: "Watch the lifestyle drift",
        paragraphs: [
          "A city with plenty to do can quietly turn entertainment and eating out into recurring budget pressure.",
          "The point is not to eliminate those categories. It is to make sure they are deliberate.",
        ],
      },
    ],
  },
  {
    slug: "fire-in-barcelona",
    title: "FIRE in Barcelona: Lifestyle Value Is Part of the Calculation",
    description:
      "Barcelona appeals to many FIRE planners because it combines urban life, climate, and culture, but the numbers still need to survive the real housing market.",
    excerpt:
      "Barcelona can be a compelling FIRE destination when the budget includes real rent, seasonality, and the lifestyle you actually want.",
    publishedAt: "2026-04-27",
    readTime: "5 min read",
    sections: [
      {
        heading: "Quality of life has value",
        paragraphs: [
          "FIRE is not only about the fastest possible date. It is also about what kind of life your money is buying you.",
          "Barcelona often enters the conversation because the lifestyle value feels high relative to many alternatives.",
        ],
      },
      {
        heading: "Housing still needs respect",
        paragraphs: [
          "Rent pressure and neighborhood variation can change the cost picture more than broad country averages suggest.",
          "That makes city-specific planning more useful than generic Spain-based estimates.",
        ],
      },
      {
        heading: "Build a plan you would want to keep",
        paragraphs: [
          "If you imagine Barcelona as your long-term base, your budget should leave room for the things that make it appealing.",
          "A FIRE target that excludes the life you actually want is just a distorted number.",
        ],
      },
    ],
  },
  {
    slug: "what-is-coast-fire",
    title: "What Is Coast FIRE?",
    description:
      "Coast FIRE means reaching a point where your existing investments can grow to support retirement later without needing aggressive new contributions.",
    excerpt:
      "Coast FIRE shifts the question from ‘When can I quit now?’ to ‘When can I stop pushing so hard and still be okay later?’",
    publishedAt: "2026-04-27",
    readTime: "6 min read",
    sections: [
      {
        heading: "The core idea",
        paragraphs: [
          "With Coast FIRE, you build enough invested assets early that they can compound on their own until a traditional or semi-traditional retirement age.",
          "After that point, work can become more flexible because you no longer need to save aggressively every year.",
        ],
      },
      {
        heading: "Why people like it",
        paragraphs: [
          "Coast FIRE appeals to people who want more freedom before full retirement. It can support part-time work, career changes, or lower-stress jobs.",
          "For many people, that middle path feels more realistic than an all-or-nothing retirement target.",
        ],
      },
      {
        heading: "What still matters",
        paragraphs: [
          "You still need a solid estimate for future spending, investment growth, and the age when you want the portfolio to be ready.",
          "Coast FIRE is less demanding than full early retirement, but it still depends on disciplined assumptions.",
        ],
      },
    ],
  },
  {
    slug: "how-to-calculate-your-fire-number",
    title: "How to Calculate Your FIRE Number",
    description:
      "Learn the simple framework behind a FIRE number and how to turn your actual spending into a target worth planning around.",
    excerpt:
      "The cleanest FIRE calculation starts with annual spending, applies a target multiple, then pressure-tests the result against your real life.",
    publishedAt: "2026-04-27",
    readTime: "6 min read",
    sections: [
      {
        heading: "Step 1: Estimate annual spending",
        paragraphs: [
          "Start with the amount you expect to spend in a typical year once work is optional.",
          "That means looking at housing, food, healthcare, transport, travel, subscriptions, and the categories that actually matter in your life.",
        ],
      },
      {
        heading: "Step 2: Multiply by 25",
        paragraphs: [
          "A simple baseline is annual spending times 25. That gives you a starting target for invested assets.",
          "If you expect to spend $48,000 per year, the rough FIRE number is $1.2 million.",
        ],
      },
      {
        heading: "Step 3: Check the assumptions",
        paragraphs: [
          "Your location, taxes, market expectations, and desired lifestyle can all push the number up or down.",
          "That is why the first number should be treated as a planning draft, not the final truth.",
        ],
      },
      {
        heading: "Step 4: Focus on the levers",
        paragraphs: [
          "Once you have the target, the useful question becomes how to move faster: raise savings, cut recurring costs, or increase income.",
          "The best FIRE tools help you see which lever matters most for your timeline right now.",
        ],
      },
    ],
  },
];

export function getLearnArticle(slug: string) {
  return LEARN_ARTICLES.find((article) => article.slug === slug);
}
