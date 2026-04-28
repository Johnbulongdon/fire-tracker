# UntilFire Agent Rules

This repository uses `origin/main` as the canonical baseline for all work by default.

## Baseline Rule

Before making any change:

1. Fetch `origin/main`.
2. Compare the local workspace against `origin/main`.
3. Treat the latest pushed `origin/main` version as the baseline.

Do not use older local commit history or unpushed local workspace changes as the baseline unless the user explicitly says to.

## Local Workspace Drift

If local files differ from `origin/main`:

- preserve those local changes
- do not assume they are the intended base
- continue reasoning from `origin/main` unless the user explicitly overrides that rule

## UI Work

For design-sensitive work:

- use `origin/main` as the code baseline
- use the live deployment or user-provided screenshots as verification
- if the live deployment and `origin/main` visibly differ, call that out before implementing or pushing

## Deployment References

If the user references a build or deployment identifier such as `6Tb7dySgE`, do not assume it is a git revision. Treat it as a deployment reference unless verified otherwise.

## Push Discipline

Before pushing visual changes, restate the baseline in plain language:

- `Using latest pushed GitHub main as base`

If the requested design direction conflicts with `origin/main`, say so before pushing.
