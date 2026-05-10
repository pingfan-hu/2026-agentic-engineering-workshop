# Skill Usage and Design — Speaker Script

Speaking script for **Part 2: Skill Usage and Design** of the 2026 Agentic Engineering Workshop.

Organized into the three sections defined in `resources/part-2-overview.qmd`:

1. **Common Skills**
2. **Skill Design**
3. **Skill Symlinks**

Sources:
- Pingfan's "Agentic Engineering" blog series (parts 2 and 3)
- Anthropic's [Best Practices for Claude Code](https://code.claude.com/docs/en/best-practices) (skills section)
- Anthropic's [Extend Claude with skills](https://code.claude.com/docs/en/skills) docs
- tw93's [Waza](https://github.com/tw93/waza) skill collection and accompanying blog post

---

## Section recap from Part 1

_[~1 minute — quick re-anchor]_

In Part 1 we placed **skills** in the "Behaviors" component of the four-component model:

> Skills are reusable slash commands (e.g. `/commit`, `/review`) stored as `.md` files. They load a prompt template into the session to guide a structured workflow.

Part 2 zooms in on that one box. Three things to cover:

1. **What skills people actually use** — survey the community.
2. **How to design your own** — the structural anatomy of a skill, plus two design principles.
3. **How to share skills across projects** — symlinks as the lightweight pattern.

---

## 1. Common Skills

### What "skills" really are

_[Slide: skill = SKILL.md in a directory]_

A skill is a **directory** under `.claude/skills/` containing a `SKILL.md` file. Optionally it can hold scripts, assets, data, additional reference files. The agent discovers, explores, and uses all of it.

Minimal example, straight from Anthropic's docs:

```markdown
.claude/skills/api-conventions/SKILL.md
---
name: api-conventions
description: REST API design conventions for our services
---
# API Conventions
- Use kebab-case for URL paths
- Use camelCase for JSON properties
- Always include pagination for list endpoints
- Version APIs in the URL path (/v1/, /v2/)
```

Two ways skills run:
- **Auto-trigger** — Claude detects matching context and applies the skill itself. No slash command needed.
- **Manual invoke** — `/skill-name [args]` triggers it explicitly. Use `disable-model-invocation: true` in the frontmatter for skills with side effects you want to gate behind a manual call.

### Where skills come from

_[Slide: ecosystem map]_

Skills land in your project from three sources:

1. **Plugins** — install via `/plugin`. Plugins bundle skills + MCPs + hooks + config.
   - **`everything-claude-code`** — community kitchen sink. Comprehensive, opinionated, covers most workflows.
   - **`claude-plugins-official`** — Anthropic-maintained. The four I personally use:
     - `claude-md-management` — manage CLAUDE.md across projects.
     - `code-review` — adds `/review`.
     - `code-simplifier` — refactor for readability.
     - `context7` — up-to-date library docs on demand.

2. **Curated collections** — focused skill sets shared as repos.
   - **[Waza](https://github.com/tw93/waza)** by tw93 — eight skills, deliberately small surface area:
     `/think`, `/design`, `/hunt`, `/check`, `/write`, `/learn`, `/read`, `/health`.
   - The author's two design principles (we'll come back to these in Section 2):
     - **Less is more** — fewer skills, shorter names, easier recall.
     - **Negative examples** — define what the skill should *not* do; constraint sharpens targeting.

3. **Your own** — the most important source. Skills you've written from your own workflows. After a few months of use, this is usually 60–80% of what you actually invoke.

### What people use them for

_[Slide: skill use-case categories]_

Patterns I see across active Claude Code users:

| Category | Example skills |
|---|---|
| **Code review** | `/review`, `/security-review`, language-specific reviewers |
| **Refactoring & cleanup** | `/simplify`, `/refactor-clean`, `/dead-code` |
| **Test discipline** | `/tdd`, `/test-coverage`, `/e2e` |
| **Build / verify** | `/build-fix`, `/verify`, `/quality-gate` |
| **Documentation** | `/update-docs`, `/codemap`, `/init` |
| **PR & git workflow** | `/commit`, `/prp-pr`, `/checkpoint` |
| **Knowledge / research** | `/think`, `/learn`, `/read`, `/docs-lookup` |
| **Domain-specific** | DSL helpers, domain validators, custom build steps |

> The 80/20 rule kicks in fast. A handful of skills do most of your daily work. Optimize that handful.

### Plugins vs. standalone skills

_[Slide: when to use which]_

- **Standalone skill** (`SKILL.md` in `.claude/skills/`) — quick, self-contained, easy to write and share.
- **Plugin** — when you need to bundle several related skills + MCPs + hooks together, especially for distribution to a team.

Most people start with standalone skills and graduate to plugins once they've built three or four related skills that belong together.

---

## 2. Skill Design

### The structural anatomy of a `SKILL.md`

_[Slide: frontmatter + body]_

Every `SKILL.md` is two parts: **frontmatter** (YAML, who you are) and **body** (markdown, what you do).

```markdown
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---
Analyze and fix the GitHub issue: $ARGUMENTS.

1. Use `gh issue view` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files
4. Implement the necessary changes to fix the issue
5. Write and run tests to verify the fix
6. Ensure code passes linting and type checking
7. Create a descriptive commit message
8. Push and create a PR
```

Three frontmatter keys to know:
- **`name`** — what you call it. Becomes `/name`. Keep short.
- **`description`** — what it does, one sentence. Used by the model to decide auto-trigger.
- **`disable-model-invocation: true`** — opt out of auto-trigger. Use for skills with real side effects (deploy, push, send mail).

Body uses `$ARGUMENTS` to receive whatever the user typed after the slash command.

### The single most valuable section: Gotchas

_[Slide: gotchas as the load-bearing section]_

The Anthropic guide makes a strong claim, and I agree with it:

> "The most valuable content in any skill is the **Gotchas** section containing common mistakes based on real problems Claude encounters when using your skill."

A `SKILL.md` for a non-trivial workflow should look like:

```markdown
---
name: deploy-staging
description: Deploy current branch to staging environment
disable-model-invocation: true
---

## Steps
1. ...
2. ...
3. ...

## Gotchas
- The migration must complete before the API redeploys, or requests
  hit the new schema with the old code.
- `npm run build` succeeds even if env vars are missing — verify
  with `npm run build:check` before deploying.
- The CDN cache takes 90 seconds to purge; do not declare success
  until the smoke test passes.
```

Gotchas are where your tribal knowledge lives. They're the difference between a skill that "kind of works" and one that's actually reliable.

### Two design principles (from Waza)

_[Slide: less is more / negative examples]_

These come from tw93's design notes, and they generalize well.

#### Principle 1: Less is more

> "Fewer skills with shorter names means less to memorize and easier recall when you need them."

The `everything-claude-code` plugin tries to cover everything. Waza deliberately leaves room for you. In practice, the smaller set wins for daily use because you can actually remember what's installed.

Heuristics:
- If a skill needs a long name to disambiguate it from another skill, you probably have one too many skills.
- Names are slash commands you type. Aim for 4–8 characters.
- 6–10 active skills is a sweet spot. More than that and you stop reaching for them.

#### Principle 2: Negative examples

> "LLMs tend to be broad, which makes many skills 'generally useful' but imprecise. Building skills around what they should *not* do cuts false positives and sharpens targeting."

A skill described as *"code review for security issues"* will trigger on every code change. A skill described as *"code review for security issues — do NOT run on documentation changes, refactors, or formatting-only diffs"* triggers when you actually want it.

This is underused. Steal it.

### How to actually write a skill

_[Slide: extract-from-success workflow]_

The hard part of skill design is starting from a blank page. The trick: **don't.**

The workflow that works:

1. **Do the task by hand once**, with Claude Code, in a normal session. Get it right.
2. **Ask Claude to extract a `SKILL.md`** from the session: *"Based on what we just did, write a `SKILL.md` that captures this workflow. Include a Gotchas section based on what went wrong before we got it right."*
3. **Drop it in `.claude/skills/<name>/SKILL.md`**. Test on the next similar task.
4. **Refine over time.** Every time the skill misfires, update the Gotchas. Every time it does extra work, tighten the description with negative examples.

This is the same loop Pingfan describes in the blog: *complete a full output first, then ask Claude in the same session to extract a rule from it.*

### Skills vs. CLAUDE.md vs. rules

_[Slide: where things go]_

Common confusion. Decision rule:

| Use | When | Loaded |
|---|---|---|
| **`CLAUDE.md`** | Applies to *every* session in this project | Always |
| **`rules/*.md`** | Topical knowledge (style guides, API conventions) | On demand by Claude |
| **Skills** | Reusable workflows (steps to do something) | On invocation (manual or auto) |

Rule of thumb:
- *"Always behave this way"* → CLAUDE.md (short).
- *"When you need to know about X"* → `rules/X.md`.
- *"When you need to *do* X"* → `skills/X/SKILL.md`.

### Skill anti-patterns

_[Slide: what to avoid]_

- **The kitchen-sink skill.** A `/do-everything` that branches into ten different workflows. Split it.
- **The duplicate-of-CLAUDE.md skill.** If a skill restates rules that already live in CLAUDE.md, delete one.
- **The auto-trigger landmine.** A side-effect skill (deploy, push, delete) without `disable-model-invocation: true`. The model will call it.
- **The unverified skill.** A skill with steps but no verification. Without a "how to confirm it worked" section, you'll catch failures by hand.

---

## 3. Skill Symlinks

### The problem

_[Slide: same skill, three projects]_

You write a great `/commit` skill in Project A. Project B needs the same skill. Project C also.

You could:
- **Copy-paste** the SKILL.md three times → drift the moment you improve one.
- **Bundle as a plugin** → real solution for big skill sets, overkill for one or two skills.
- **Symlink from a single source of truth** → the lightweight middle path.

### How symlinks work in Claude Code

_[Slide: symlink pattern]_

> Claude Code follows symlinks transparently. It reads and edits the **target** file, not the link.

This means you can keep one canonical copy of a skill anywhere on disk and link to it from any project's `.claude/skills/`.

The two common arrangements:

**Pattern A — global skills folder as the source.**
- Canonical copy lives in `~/.claude/skills/<name>/`.
- Each project links it in: `ln -s ~/.claude/skills/<name> .claude/skills/<name>`.
- Add the symlink to the project's `.gitignore` so collaborators don't get a broken link to your home directory.

**Pattern B — dedicated skills repo as the source.**
- Canonical copies live in a personal repo, e.g. `~/code/my-skills/`.
- Each project links the skills it wants: `ln -s ~/code/my-skills/commit .claude/skills/commit`.
- Same `.gitignore` rule.
- Bonus: the skills repo is version-controlled and shareable.

### A complete example

_[Slide: terminal flow]_

```bash
# One-time: create a global skills folder if you don't have one
mkdir -p ~/.claude/skills/commit
cat > ~/.claude/skills/commit/SKILL.md <<'EOF'
---
name: commit
description: Stage relevant files and create a conventional commit
---
Stage the relevant changes and create a commit message
following conventional-commits format. Do NOT amend.
EOF

# Per project: link it in
cd ~/code/my-project
mkdir -p .claude/skills
ln -s ~/.claude/skills/commit .claude/skills/commit

# Tell git not to ship the link
echo ".claude/skills/commit" >> .gitignore
```

Now `/commit` works in this project. Update the canonical SKILL.md once, every linked project gets the change.

### Important guardrails

_[Slide: do this / don't do this]_

✅ **Do** symlink **individual skill folders**:
```bash
ln -s ~/.claude/skills/commit .claude/skills/commit
```

❌ **Don't** symlink the entire `.claude/` directory. It contains project-specific config (`settings.json`, hooks, permissions, project-only skills) that should stay local.

✅ **Do** add symlinked skills to `.gitignore`. The link points to your home directory; collaborators don't have your home directory.

✅ **Do** track the canonical skill in git (in `~/.claude/skills/`'s repo or your `my-skills/` repo).

❌ **Don't** symlink across machines without a sync strategy. Symlinks store an absolute path. If your home directory is `/Users/pingfan` on one machine and `/home/pingfan` on another, the link breaks. Either sync the canonical skills folder to the same path on each machine, or rely on a cross-machine tool.

### When to graduate to a plugin

_[Slide: symlink → plugin progression]_

Symlinks are great for 1–5 personal skills. Past that, the maintenance overhead of `ln -s` and `.gitignore` per project starts to add up. The signal that it's time to graduate:

- You have a coherent set of skills that belong together (e.g., a "git workflow" set: commit, branch, pr, review).
- You want to share with a teammate or publish.
- You want to bundle skills + an MCP + a hook into one install.

When that hits, package the set as a plugin and `/plugin install` it instead. Same source of truth, plus distribution.

### Cross-tool sharing (brief mention)

_[Slide: skillshare-style tools]_

If you also use Codex, OpenClaw, or other CLI agents, there are community tools (e.g., [skillshare](https://github.com/runkids/skillshare)) that maintain a single skills directory and create symlinks into each agent's expected location. Worth knowing about; not required to start.

---

## Closing & transition

_[Slide: recap]_

Three takeaways from Part 2:

1. **Common skills.** Most useful skills come from your own work. Plugins (`everything-claude-code`, official Anthropic ones) and curated sets (Waza) are the seed. Optimize the 6–10 you actually use daily.
2. **Skill design.** `SKILL.md` = frontmatter (`name`, `description`, optional `disable-model-invocation`) + body. The Gotchas section is the load-bearing piece. Two principles: **less is more**, **define the negatives**. Don't start from blank — extract from a successful session.
3. **Skill symlinks.** One canonical source, `ln -s` into each project, `.gitignore` the link. Symlink individual skills, never the whole `.claude/`. Graduate to plugins when the set grows.

Hand-off to Part 3: skills are the *behaviors* layer. Part 3 is about the **harness** — the structured environment around all of this (planner / generator / evaluator agents, sprint contracts, verification systems) that makes long-running work reliable.
