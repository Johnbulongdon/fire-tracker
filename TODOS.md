# TODOS

## Resolved 2026-05-02 (UNTAAAA-3)

### Hardcoded retirement age in reveal flow — FIXED
`calcFIRE()` no longer assumes age 26 or year 2026. It accepts an optional
`currentAge` and uses `new Date().getFullYear()`. The `SavingsScreen` adds an
optional age input; when omitted, the reveal shows "You could retire in YYYY
(N years from now)" instead of inventing an age.

### Hardcoded social-proof counters — REMOVED
The "14,847 FIRE numbers calculated today" live counter, the "Joined by 38,000+
investors" avatar block, and the fabricated "$5.8B / 38K / 94% / 7.2yr" stat
strip are gone. The hero strip now shows real, verifiable product facts (Free,
60s, `${CITIES.length}` cities, no login). When real PostHog instrumentation
is live, swap any of these for query-driven values.

### Custom city silently used Texas tax — FIXED
Custom-city entries now set `stateKey: "custom"`. `STATE_TAX["custom"]` is a
sentinel that `calcTakeHome` short-circuits with the gross unchanged. The
`IncomeScreen` detects the custom jurisdiction, force-defaults to take-home
mode, disables the gross modes, and shows an explicit notice that we don't
know the user's tax jurisdiction.
