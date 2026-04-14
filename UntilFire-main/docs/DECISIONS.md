# UntilFire — Architecture & Product Decision Log
Last updated: March 2026

> This file records **why** we chose X over Y. Critical context for any AI or new team member.

---

## Product Decisions

### [2026-03] No login wall on the calculator
**Decision**: Users can complete the full 5-screen wizard and see their FIRE number without creating an account or providing an email.

**Rationale**:
- The core insight (your FIRE number) is the hook — gating it destroys the viral loop
- ProjectionLab's free tier (no save) converts users because they see value first
- Reddit and social sharing only works if the experience is frictionless end-to-end
- First-time visitors from referral links have zero trust — don't ask for anything before delivering value

**Trade-off**: Harder to capture leads from single-visit users. Mitigated by waitlist form at bottom of page.

---

### [2026-03] Search-as-you-type city (not country → state → city cascade)
**Decision**: Single text input that filters 263 cities in real time. A "custom city" option always appears at the bottom of the dropdown.

**Rationale**:
- Country → State → City requires 3 interactions and doesn't work well for international cities (no "state" in most countries)
- Search-as-you-type is familiar (Google, Airbnb, every modern app)
- 263 cities covers ~95% of FIRE-relevant user locations — the long tail is handled by custom fallback
- Validated with user: confirmed preference over cascade approach

**Trade-off**: Users in truly obscure cities get the custom fallback — requires them to know their monthly expenses. Acceptable — these users are more financially aware than average.

---

### [2026-03] Custom city fallback uses monthly expenses in USD
**Decision**: When a city isn't in the list, users enter their estimated monthly expenses in USD. We multiply by 12 to get `state.col` (annual expenses), then apply the 25× FIRE rule.

**Rationale**:
- Monthly spend is the most intuitive unit for most people ("I spend about $2,500/month")
- Annual figures feel abstract; monthly is how people budget
- No good alternative: asking for annual is worse, asking for a COL multiplier is too technical
- For international users, USD is the lingua franca of FIRE community

**Trade-off**: Loses city-level tax accuracy (defaults to `tx` — no state income tax). Acceptable trade-off as custom city users are typically international anyway where US state tax is irrelevant.

---

### [2026-03] 25× rule with 7% real return
**Decision**: FIRE target = annual expenses × 25. Years to FIRE calculated with 7% annual compound return.

**Rationale**:
- 25× / 4% withdrawal rate is the FIRE community standard (Trinity Study)
- 7% real return (after inflation) is the historical S&P 500 average — widely cited and accepted in FIRE circles
- Using the community standard builds trust — FIRE-literate users will recognise it
- Deviating would require explanation and create doubt

**Trade-off**: Ignores existing savings balance (assumes starting from ~$27,400). Will add as a P1 input in Phase 2.

---

### [2026-03] All wizard state in app/page.tsx, not URL params
**Decision**: City, income, and savings values live in React `useState` inside `app/page.tsx`. Not stored in URL params, localStorage, or global state.

**Rationale**:
- Simplicity — no routing complexity for a 5-screen wizard
- No need for deep linking into specific wizard steps
- State doesn't need to persist between sessions (calculator is designed to be re-run)
- URL params would expose user financial data in browser history

**Trade-off**: Browser back button doesn't work within the wizard. Mitigated by "Back" button on each screen.

---

### [2026-03] DM Mono for the FIRE number, not Syne
**Decision**: The big FIRE number on the reveal screen uses `DM Mono` (monospace), not `Syne` (the display/headline font).

**Rationale**:
- Syne is wide and heavy — at large font sizes, a 7-digit number like "$1,375,000" overflows the container on most screens
- DM Mono is narrower per character by design — monospace fonts allocate equal width to each character, so long numbers stay contained
- Monospace also feels "calculated" and "precise" — appropriate for a financial number
- Already loaded via Google Fonts (no extra load)

**Trade-off**: Less "dramatic" visually than Syne at large sizes. Compensated by the slam animation and glow effect.

---

## Architecture Decisions

### [2026-03] All city data in lib/fire-data.ts, not a database
**Decision**: City COL data, tax rates, and FIRE calculation logic are hardcoded TypeScript in `lib/fire-data.ts`, not stored in Supabase.

**Rationale**:
- 263 cities is manageable as a static file — no database query latency
- No need for admin UI to update city data at this scale
- TypeScript typing catches errors at build time (wrong key names, missing fields)
- Zero infrastructure cost — no DB reads for every calculator use
- COL data doesn't change frequently — quarterly manual updates are fine

**Trade-off**: Updating city data requires a code deploy. Acceptable at current scale.

---

### [2026-03] CSS-in-JS via template literal in page.tsx, not Tailwind classes
**Decision**: The calculator wizard styles are written as a `<style>` tag with a template literal inside `page.tsx`, not as Tailwind utility classes.

**Rationale**:
- The wizard was converted from a standalone HTML prototype — keeping styles co-located with components reduces context switching
- Custom CSS variables (`--bg`, `--accent`, `--teal`) are deeply embedded in the design system — hard to replicate with Tailwind alone
- Complex animations (`revealSlam`, `fireGlow`, `pulseBorder`) are cleaner in raw CSS keyframes
- Tailwind v4 (in use) has different configuration from v3 — existing Tailwind in the project uses v4 conventions

**Trade-off**: Not consistent with Tailwind used in the rest of the app. Acceptable for now — will standardise in Phase 3 if needed.

---

### [2026-03] Supabase for auth + database
**Decision**: Supabase handles Google OAuth and user data storage.

**Rationale**:
- Row Level Security (RLS) out of the box — no custom auth middleware needed
- `@supabase/ssr` integrates cleanly with Next.js App Router
- Generous free tier for early stage
- Open source — can self-host if needed later
- Auth UI React components speed up login page development

**Trade-off**: Vendor dependency. Mitigated by open-source nature and SQL portability.

---

### [2026-03] Vercel for hosting
**Decision**: Deployed on Vercel with automatic GitHub deployments.

**Rationale**:
- Zero-config Next.js deployment
- Preview deployments for every PR
- Edge network for global performance
- Vercel Analytics already integrated

**Trade-off**: Vercel Hobby plan doesn't support collaboration from non-owner GitHub committers. Solution: all commits must use the `Johnbulongdon` GitHub identity (`126181192+Johnbulongdon@users.noreply.github.com`).
