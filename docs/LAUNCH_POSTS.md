# UntilFire — Launch Posts
Last updated: March 2026

> Ready-to-post copy for Reddit, Hacker News, and Product Hunt.
> Do NOT use referral links in the Reddit post (subreddit rule).

---

## 1. Reddit — r/financialindependence Weekly Self-Promotion Thread

**Where to post**: https://www.reddit.com/r/financialindependence/  
**When**: Every Wednesday the AutoModerator posts a new "Weekly Self-Promotion Thread" — post your comment there.  
**Rules**: No referral links. No standalone link-only posts. Must contribute meaningfully (100–250 words). Be humble, community-oriented, and transparent about pricing.

**Next thread drops**: Wednesday March 25, 2026 — post your comment within the first few hours for best visibility.

---

### Post Copy (paste as a comment in the thread):

---

Hey everyone — I built a FIRE calculator called **UntilFire** and would love some feedback from this community specifically.

The frustration that prompted it: every calculator I found either ignored taxes entirely, used national cost-of-living averages (meaningless if you're in SF vs. Austin vs. Bangkok), or required sign-up before showing you anything. So I built one that doesn't do any of those things.

**What it does:**
- Asks three questions: where do you want to retire, what do you earn, and how much do you save per month
- Applies real 2025 US tax brackets (federal + FICA + state) — or flat effective rates for international cities
- Uses actual city-level cost-of-living data for 263 cities worldwide (US, China, India, SE Asia, Europe, Middle East, LatAm)
- If your city isn't in the list, you can just enter your monthly expenses directly
- Shows your FIRE number, estimated retirement year, and how small changes (save $500/mo more, cut dining 20%) compress your timeline
- Completely free, no login required, no email asked

The 263-city coverage came from thinking about this community specifically — a lot of FIRE-seekers are either expats, geo-arbitrageurs, or evaluating where to retire internationally. Most tools just have "Other" for non-US cities which is useless.

Would genuinely appreciate feedback — especially if the cost-of-living estimates for your city feel off, or if something in the calculator feels wrong.

https://untilfire.com

---

**Notes for posting:**
- Engage with other people's posts in the thread before or after posting yours — the community reciprocates
- If someone comments, reply quickly (within a few hours) — the thread moves fast on Wednesdays
- Don't repost in subsequent weeks — participate naturally in daily threads instead

---

## 2. Hacker News — Show HN

**Where to post**: https://news.ycombinator.com/submit  
**Title format**: Must begin with "Show HN:"  
**Best time to post**: Tuesday–Thursday, 7–9am US Eastern time (highest HN traffic)  
**Rules**: 
- Must be something you built personally and are around to discuss
- No landing pages — the product must be usable without barriers
- Don't ask friends to upvote (against HN rules)
- Reply to every comment, especially early ones — engagement drives algorithmic visibility
- Be technical and honest; HN users will probe your methodology

---

### Title:
```
Show HN: UntilFire – FIRE retirement calculator with real city COL data and tax math
```

### Post body (paste in the "text" field — optional but recommended):

---

I built UntilFire because I got frustrated with FIRE calculators that use national average cost-of-living data and ignore taxes. Both of those assumptions create wildly different numbers depending on who you are.

**What it does differently:**

1. **263 cities with real COL data** — not a national average multiplier. SF ($110k/yr), Austin ($55k/yr), Bangkok ($22k/yr), and 260 others each have their own estimated annual expense figure based on actual cost-of-living research.

2. **Actual tax math** — for US cities: 2025 federal brackets with standard deduction, FICA (SS + Medicare + Additional Medicare surtax), and all 50 state rates. For international: flat effective rates by country. The tax breakdown is shown line by line so you can verify it.

3. **Custom city fallback** — if your city isn't in the list, you enter your monthly expenses in USD and it uses that directly. Useful for digital nomads or anyone in a tier-2 city.

4. **No login, no email** — you get the full result (FIRE number, retirement year, delta cards) before any signup is asked.

**The calculation:**
- FIRE target = annual expenses × 25 (4% withdrawal rate / Trinity Study)
- Years to FIRE: compound growth at 7% real return from current ~$27k starting balance
- Retirement year and age derived from that

**Stack**: Next.js 15, Supabase, Tailwind, deployed on Vercel.

Happy to discuss the COL data methodology, tax calculation accuracy, or anything else. The biggest known limitation right now is that the starting savings balance is hardcoded at $27,400 — adding an "existing savings" input is on the roadmap.

https://untilfire.com

---

**Notes for posting:**
- Post between 7–9am ET on a Tuesday or Wednesday
- Check back every 30 minutes for the first 2 hours — reply to every comment
- If someone challenges the tax math or COL data, engage seriously — HN rewards intellectual honesty
- Don't defend — acknowledge limitations and explain your reasoning
- The "no login" detail is important to lead with — HN is hostile to paywalled Show HNs

---

## 3. Product Hunt

**Status**: Planned — do this after getting initial traction and social proof from Reddit/HN first.  
**Ideal timing**: After you have 100+ users and some testimonials/screenshots.  
**Preparation needed**:
- 5 good screenshots (hero, city search, tax breakdown, reveal screen, dashboard)
- 60-word tagline
- Hunter with an established PH profile (ask someone in your network)
- Notify your existing users the day before to support the launch
- Schedule for a Tuesday at 12:01am PT

**Tagline draft:**
> Find out exactly when you can retire — adjusted for your actual city, income, and taxes. 263 cities worldwide. Free, no login required.

---
