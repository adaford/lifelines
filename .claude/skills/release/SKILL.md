---
name: release
description: Ship a finished Lifelines change to the live game. Sets the cache token, adds the design record, runs the checks, commits, pushes to main and verifies the GitHub Pages deployment. Use when a requested game change is implemented and ready to publish, or when asked to release, publish or deploy.
---

# Releasing Lifelines

GitHub Pages serves the root of `main`, so a push to `main` is the release. A release is finished when the live site serves the pushed commit, not when the commit exists.

The owner's standing instruction is that a game change they asked for gets shipped without a further prompt, unless they asked for a draft or another branch. For anything else (tooling, documentation, experiments), commit or push only when asked.

## Before starting

- Work on `main`, level with `origin/main`: run `git fetch origin` and `git status -sb`. Never force-push. If the branches have diverged, stop and report it.
- `git status` should show only the change being released. Keep unrelated work out of the commit. `toDo.txt`, `.baselines/` and `test-artifacts/` are ignored and stay local.

## Steps

1. **Cache token.** If any served file changed (a root `.js` module, `styles.css` or `index.html`), choose a short kebab-case token that names the change and run `node scripts/set-cache-token.mjs <token>`. Browsers cache modules by this token, so a release without a new one can leave players running a mix of old and new files. Skip this step when only tests, scripts or documentation changed.

2. **Design record.** If the change alters how the game behaves or looks, add the next numbered record under `docs/design-log/` and list it in `docs/design-log/README.md`, which explains the format. Include the cache token and the validation actually run.

3. **Percentile reference.** If the change alters simulated outcomes or the use of random draws, run `node scripts/calibrate-percentiles.mjs --samples 2000 --seed 200001`, note `git hash-object percentile-reference.js`, run the command again, and confirm the hash is unchanged. If the simulation is untouched, confirm `git diff --stat percentile-reference.js` is empty.

4. **Tests.** Run `npm test`. It must finish with no failures and, in this checkout, no skipped tests.

5. **Assets.** Run `node scripts/verify-assets.mjs`. It serves the working tree on a temporary port, checks that every file the game loads matches the source, and fails if any reference still carries an old cache token.

6. **Commit.** Review `git status`, stage the intended files and commit on `main`. Write a one-line imperative summary, a short paragraph on what changes for players, and a `Validation:` paragraph with the real results: tests passed, assets checked, anything skipped or not verified.

7. **Clean-checkout check.** Prove the commit does not depend on local files by running the suite on it in a throwaway worktree:

   ```sh
   git worktree add --detach .release-check HEAD
   cd .release-check
   npm test
   cd ..
   git worktree remove .release-check
   ```

   The folder is ignored by git and needs no `npm ci`, because Node finds `node_modules` in the parent folder. The tests that import a frozen runtime from `.baselines/` skip there by design (seven of them in November 2026); a failure, or a skip of any other test, means the commit is incomplete. Remove the worktree even when the run fails.

8. **Push.** `git push origin main`.

9. **Verify the deployment.** Run `gh api repos/adaford/lifelines/pages/builds/latest` until `status` is `built` and `commit` is the pushed commit; this usually takes about a minute. A status of `errored`, or a build for a different commit, means the change is not published. Then run `node scripts/verify-assets.mjs --live`, which checks that every live asset matches the commit byte for byte.

10. **Report.** Give the live URL (https://adaford.github.io/lifelines/), the commit, the cache token, the test totals, the asset counts, and anything skipped or not verified. Browser and visual checks are skipped by the owner's preference unless they ask for them; say that they were not done.

## When the release is blocked

- **No push access.** Report exactly what is missing. Do not copy credentials from another machine, and do not describe the change as published.
- **Only a pull request is possible.** Open it and say plainly that merging it into `main` is still required before anything deploys.
- **The Pages build fails or live assets differ.** Report what the build or the asset check said and investigate before pushing again.
