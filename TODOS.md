# TODOS

## Deferred from eng review (2026-04-25)

### Age display is wrong for everyone not 26
**What:** `calcFIRE()` returns `age: 26 + years` hardcoded. RevealScreen displays "you could retire at age 67" as if the user is 26 today.
**Why:** Confidently wrong data is worse than no data. Users over 26 (most of them) see a number that's off by however many years they are over 26.
**Options:** Add a birth year input step to the wizard (one new screen), or remove the age field from the RevealScreen display entirely. Removing is faster.
**Where:** `lib/fire-data.ts:520` (age calculation) + `app/page.tsx` (RevealScreen age display)
**Depends on:** Nothing blocking.

---

### Replace hardcoded social proof counters with real PostHog data
**What:** Hero section shows a randomly-incrementing counter starting at 14,847 and "2,400+ cities." Neither is real.
**Why:** Once PostHog is live and capturing `calculator_completed` events, real completion counts are available. Fake numbers drift further from reality with every passing day.
**Options:** Query PostHog API for total `calculator_completed` event count. Show real number (or round down to nearest 50 for comfort). Replace the setInterval fake with a static real number.
**Where:** `app/page.tsx` lines 81 and 138-139 (HeroScreen).
**Depends on:** PostHog must be live and capturing events for a few weeks first.

---

### Custom city entry silently applies Texas (0%) state tax to everyone
**What:** When a user types a city not in the 263-city database, the app creates a custom city with `stateKey: "tx"` (line 195). Texas has 0% state income tax.
**Why:** A user in France, California, or New York entering a custom monthly expense gets take-home calculations based on Texas tax rates. The income number used in the FIRE projection is silently inflated for high-tax users.
**Options:** Add a country/state selector in the custom city flow (the cleanest fix), or show a visible disclaimer: "Tax estimate assumes US average — adjust income to post-tax if needed."
**Where:** `app/page.tsx:195` (CityScreen custom city creation).
**Depends on:** Nothing blocking. Disclaimer version is a one-liner.
