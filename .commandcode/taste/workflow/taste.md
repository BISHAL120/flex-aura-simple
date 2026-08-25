# Workflow

- Prefers planning before executing: explicitly asks to use plan mode for proper planning, then create a todo list of all tasks, and only then start executing. Confidence: 0.9
- Wants work reviewed by dedicated code-review agents (subagents) and expects all flagged problems to be fixed and re-verified (typecheck/lint/build) before the work is considered done — "review with code review agents and fix all the problems." Confidence: 0.8
- Wants meaningful, descriptive commit messages that summarize the change (structured, e.g., conventional "feat:" prefix with sectioned details) rather than generic ones — "write a meaningful commit message." Confidence: 0.9
- Expects finished work to be committed and pushed to the remote as part of wrapping up — "and push the code." Confidence: 0.8
- Deploys to Vercel (auto-deploys on push to main) and expects the build to pass there: because Vercel runs `pnpm lint` during the build, the codebase must have zero lint errors — pre-existing errors in shipped/vendor UI-kit files must be fixed rather than left as "don't touch" exceptions. Confidence: 0.8
- When something fails (e.g., a deployment error), wants the root cause diagnosed and explained clearly ("why?"), not just a silent patch — the final response should state what failed, why, and what changed. Confidence: 0.6
- Wants new pages/features verified not just via typecheck/lint/build but also by running the dev server and curl-checking that routes render and the expected UI elements are present before calling the work done. Confidence: 0.7
- Before customizing/rewriting site content, expects the agent to study the source material the user points to (local product images, emails, business info) to understand the products and use it to ground the content — not fabricate product details. Confidence: 0.6
- Communicates in terse, high-level directives (e.g., "now implement") after scope has been clarified/planned, and expects the agent to autonomously execute the full agreed plan end-to-end without pausing to re-confirm or ask again. Confidence: 0.7
- Wants code reviews of changed files delivered as a structured report covering code quality, security issues, bugs, and other vulnerabilities — comprehensive coverage across those categories, not just a pass/fail or a list of diffs. Confidence: 0.6
