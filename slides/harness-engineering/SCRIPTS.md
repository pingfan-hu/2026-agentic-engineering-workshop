# Harness Engineering — Speaker Script

Speaking script for **Part 3: Harness Engineering** of the 2026 Agentic Engineering Workshop.

Organized into the three sections defined in `resources/part-3-overview.qmd`:

1. **Components of a Harness**
2. **Successful Harness Practices**
3. **Design Your Own Harness**

Sources:
- Anthropic Engineering, [*Harness Design for Long-Running Application Development*](https://www.anthropic.com/engineering/harness-design-long-running-apps), Prithvi Rajasekaran (March 2026) — the primary source for this part.
- Anthropic, [*Building Effective Agents*](https://www.anthropic.com/engineering/building-effective-agents) — for the workflows-vs-agents framing.
- Anthropic, [Best Practices for Claude Code](https://code.claude.com/docs/en/best-practices) — for verification and context-management practices.
- Pingfan's "Agentic Engineering" blog series for connective tissue.

---

## Why a third part exists

_[~2 minutes — frame the gap]_

In Parts 1 and 2 we covered:
- The agent itself (Part 1) — Claude Code, the four-component model, the working directory as scope.
- The behaviors layer (Part 2) — skills, how to design them, how to share them.

That's enough for short-lived tasks: write a function, refactor a file, make a PR. But the moment you try to build something that takes **hours** or **days** of agent work — a full feature, a long migration, a research project that spans sessions — single-agent prompting starts breaking down in predictable ways:

- The agent praises its own mediocre output.
- Context fills up, performance degrades, important early instructions get lost.
- The agent declares victory while features are stubbed or half-built.
- You spend more time correcting than building.

A **harness** is the structured environment you build around the model to keep long-running work reliable. Part 3 is about that.

> Anthropic's framing: "Every component in a harness encodes an assumption about what the model can't do on its own, and those assumptions are worth stress testing."

That sentence is the whole part in one line. Hold onto it.

---

## 1. Components of a Harness

### Definition

_[Slide: harness defined]_

From Anthropic's harness-design article:

> A **harness** is an orchestrated system of specialized agents and tools that work together to guide Claude through complex, multi-step tasks. Rather than asking a single model to handle everything, a harness decomposes work into distinct phases with different agent personas, each handling specific challenges the base model struggles with alone.

Three layers to a harness:
1. **Specialized agent personas** — different jobs, different prompts, different contexts.
2. **Infrastructure** — how the agents communicate, hand off state, and use tools.
3. **Verification systems** — how you check that the work is actually done.

We'll walk through each.

### Layer 1: Agent specialization

_[Slide: planner / generator / evaluator]_

The pattern Anthropic settled on for long-running coding work uses three agents:

| Agent | Job | Why it exists |
|---|---|---|
| **Planner** | Expand a one-line prompt into a detailed spec. Define scope and architecture. | The base model under-specifies when implementing. Front-loading the spec catches scope problems early. |
| **Generator** | Do the actual work — write the code, build the design. | Focused execution context, no judgment burden. |
| **Evaluator** | Independently grade the generator's output against criteria. | Generators **inflate scores** when grading themselves. Independence is non-negotiable. |

Other personas appear in other harnesses (researcher, summarizer, critic, mediator) but planner / generator / evaluator is the durable triad.

> Key insight from the article: *"agents reliably skew positive when grading their own work."*
>
> If you remember nothing else from Part 3, remember that one. Self-evaluation does not work. The evaluator must be a separate agent with a separate context.

### Layer 2: Infrastructure

_[Slide: file-based comm + handoffs + tools]_

The pieces of plumbing that let multi-agent work survive long sessions:

- **File-based communication** — one agent writes a file (spec, plan, review), another agent reads it. Files are the lingua franca; they don't get summarized away when context resets.
- **Structured artifact handoffs** — when an agent's job is done, it produces named artifacts (`SPEC.md`, `IMPLEMENTATION.md`, `REVIEW.md`) that the next agent ingests. This preserves state across sessions and resets.
- **Version control (git)** — every checkpoint is a commit. You can rewind, branch, or fork the agent's work like any other code.
- **Sprint contracts** — generator and evaluator **negotiate "done" before work begins.** A small written agreement: what counts as success, what's out of scope. Prevents the most common failure mode where the generator thinks it's done and the evaluator thinks otherwise.
- **Interactive testing tools** — e.g., Playwright MCP. The evaluator doesn't just *read* the output, it *uses* it. Click buttons, fill forms, navigate the live app.

### Layer 3: Verification systems

_[Slide: gradable criteria]_

Verification is the layer most people get wrong. Subjective questions get subjective answers; gradable criteria get gradable ones.

- **Concrete, gradable criteria.** Don't ask *"is this design good?"* Ask *"does this satisfy our four design principles: design quality, originality, craft, functionality?"* — each with a defined rubric.
- **Few-shot calibration.** Show the evaluator example outputs with detailed score breakdowns. This anchors the evaluator's judgment to *your* judgment.
- **Hard thresholds.** A sprint fails if the evaluator score on any criterion is below threshold. No "directionally good enough." Either pass or iterate.
- **Interactive (not static) verification.** Whenever possible, let the evaluator *do something* with the output. Run the test suite. Click through the UI. Hit the API. Static review misses what real use catches.

### A complete picture

_[Slide: harness architecture diagram]_

Putting the three layers together for a typical long-running coding task:

```text
       prompt
         │
         ▼
   ┌──────────┐
   │  PLANNER │── writes SPEC.md ──┐
   └──────────┘                    │
                                   ▼
                            sprint contract
                                   │
                                   ▼
   ┌────────────┐  reads spec  ┌──────────┐
   │ GENERATOR  │◀────────────▶│ EVALUATOR│
   │ writes code│  writes      │ tests    │
   │            │  REVIEW.md   │ outputs  │
   └────────────┘              └──────────┘
         │                          │
         └──── git commits ─────────┘
                    │
                    ▼
              (next sprint or done)
```

Three agents. File-based communication. Git as state. Sprint contracts as alignment. Interactive testing as verification. That's the harness.

---

## 2. Successful Harness Practices

This section translates Anthropic's hard-won lessons into patterns you can apply.

### Practice 1: Separate generation from evaluation

_[Slide: the cardinal rule]_

> "Agents reliably skew positive when grading their own work."

Do not ask Claude to evaluate output Claude just produced.

Concretely:
- The evaluator is a **separate agent**, with its own system prompt, its own context, ideally its own session.
- Tune the evaluator to be **skeptical**, not lenient. Default LLM mode is "be helpful," which means inflate scores. Counter-prompt it.
- File-based handoff: generator writes the artifact and exits; evaluator reads the artifact fresh.

This single change does more for output quality than almost anything else.

### Practice 2: Turn subjective judgments into gradable criteria

_[Slide: rubric mindset]_

Rephrase every "is this good?" as "does this satisfy criteria X, Y, Z, with score N?"

Example, frontend design:

| Criterion | Weight | What it means |
|---|---|---|
| Design quality | 25% | Layout, hierarchy, contrast — measured against principles |
| Originality | 20% | Not a generic template — measured against reference set |
| Craft | 25% | Spacing, typography, micro-interactions — checklist |
| Functionality | 30% | Features actually work end-to-end — interactive test |

Calibrate the evaluator with **few-shot examples**: 2–3 outputs with annotated scores per criterion. The evaluator's scores then track yours.

### Practice 3: Manage context with resets, not compaction

_[Slide: reset > compact for long work]_

Counter-intuitive but well-supported:

> With long-running work, **clearing the context window entirely** and passing state through structured file handoffs works better than summarizing the conversation in place.

Why: in-place compaction creates "context anxiety" — the model can sense its window is filling and starts wrapping up prematurely. Resets eliminate that. The new session reads `SPEC.md` and `STATE.md`, has a clean context, and can plan the next chunk freely.

This is why the harness is built around files: files survive resets, conversation summaries don't reliably.

When to reset:
- Between sprints.
- When the model starts cutting corners.
- When you've corrected the same mistake twice (Anthropic's threshold from the best-practices doc).

### Practice 4: Decompose complex tasks

_[Slide: chunk into tractable pieces]_

A multi-hour task done in one shot fails. The same task split into eight one-hour sprints succeeds.

Heuristics:
- Each sprint should have a **single clear deliverable** (a file, a feature, a passing test).
- Each sprint should have **its own success criteria** known in advance (the sprint contract).
- Each sprint should fit comfortably in one context window's worth of work.
- Hand off via files between sprints. Reset between sprints.

### Practice 5: Iterate on the harness as the model improves

_[Slide: harness components are assumptions]_

Re-read the framing line:

> "Every component in a harness encodes an assumption about what the model can't do on its own, and those assumptions are worth stress testing."

Implication: when a new model ships (Claude 4.5 → 4.6 → 4.7), revisit each piece of your harness:

- Is the planner still load-bearing, or is the generator now smart enough to plan inline?
- Does the evaluator still catch the things it caught last quarter, or is the generator producing cleaner first drafts?
- Are sprint contracts still needed, or is the generator's instinct for scope now reliable?

The article's example: as Claude improved, Anthropic **removed** load-bearing components from their harness, then added new ones to push capability boundaries.

> "As models continue to improve, the space of interesting harness combinations doesn't shrink. Instead, it moves."

Don't treat your harness as a finished artifact. It's a living encoding of the model's current limits.

### Common failure modes (and the practice that fixes each)

_[Slide: failure → fix table]_

| Failure | How it shows up | Fix |
|---|---|---|
| **Self-evaluation bias** | Generator praises mediocre work | Separate evaluator agent (Practice 1) |
| **Context degradation** | Model loses coherence late in long tasks | Reset + file handoffs (Practice 3) |
| **Specification brittleness** | Over-detailed spec → cascading errors when initial planning is wrong | Keep spec high-level, use sprint contracts |
| **Incomplete QA testing** | Surface-level checks miss edge cases | Prompt evaluator to probe deeply, refine iteratively |
| **Feature stubbing** | Generator ships display-only stubs | Evaluator specifically tests for completeness, files bugs against divergence |

---

## 3. Design Your Own Harness

The temptation is to start from the full Planner / Generator / Evaluator architecture. **Don't.** Anthropic's own advice:

> "Find the simplest solution possible, and only increase complexity when needed."

A practical staged path.

### Stage 0: Single-agent baseline

_[Slide: where everyone starts]_

Just Claude Code, in your project directory, with a `CLAUDE.md` and maybe a few skills (Parts 1 and 2 of this workshop).

You do not need a harness yet. Use this until you observe **consistent failure modes** on the kind of work you actually do. Most workflows never need to leave Stage 0.

Signals you've outgrown it:
- Tasks regularly take more than one session.
- The model declares victory on incomplete work.
- You spend more time correcting than building.
- Quality varies wildly between attempts.

### Stage 1: Add a verifier

_[Slide: the cheapest harness upgrade]_

The first piece of harness to add is **almost always** a separate evaluator.

The cheapest version: a second Claude Code session in a separate worktree, with a system prompt that says *"you are a skeptical reviewer; do not implement, only critique."*

Pattern (from Anthropic's writer/reviewer example):

| Session A (Writer) | Session B (Reviewer) |
|---|---|
| Implement feature X | (waits) |
| (writes code, commits) | Review the implementation in `@src/...`. Look for edge cases, race conditions, pattern consistency. |
| Address the review feedback. | (waits) |

You can do the same with tests: one session writes the tests, the other writes code to pass them.

You haven't built a "harness" in the elaborate sense — you've decoupled generation from evaluation. That's most of the win.

### Stage 2: Add a planner

_[Slide: when scope keeps drifting]_

Add a planner when:
- Tasks repeatedly start without enough scope definition.
- Implementation doesn't match what you actually wanted.
- The first draft solves a different problem.

Implementation: a planning session that produces a `SPEC.md`, then a fresh implementation session that reads it.

This is the same shape as Claude Code's built-in **plan mode**, scaled across sessions. If plan mode within one session is enough, stay there. If you need a written spec that survives multiple sessions, escalate to a separate planner.

### Stage 3: Sprint contracts and structured handoffs

_[Slide: when work spans days]_

Add sprint contracts when:
- Work spans multiple sessions or days.
- Generator and evaluator disagree on whether work is done.
- "Done" is fuzzy.

A sprint contract is a small file the generator and evaluator both sign off on **before work begins**:

```markdown
# Sprint 3 Contract

## Goal
Add OAuth login flow to the existing auth module.

## Done means
- [ ] User can click "Sign in with Google" and complete the flow.
- [ ] Session persists across page reloads.
- [ ] Existing email/password login still works (regression test).
- [ ] All new code has unit tests, all tests pass.
- [ ] No TODOs or stubs in shipped code.

## Out of scope
- GitHub OAuth (separate sprint)
- UI redesign of the login page
```

Generator works to the contract. Evaluator grades against the contract. Disagreements happen *during* contract drafting, not at the end.

### Stage 4: Interactive verification

_[Slide: from reading to using]_

When static review stops catching real issues, give the evaluator tools to *use* the output:

- **Frontend**: Playwright MCP — click, type, navigate, screenshot.
- **Backend**: HTTP MCP — hit the API, assert on responses.
- **Data**: a query MCP that runs the analysis end-to-end.

Static review catches: typos, structure issues, surface bugs.
Interactive review catches: race conditions, integration failures, real edge cases.

The article makes this concrete — Anthropic's evaluator agent uses Playwright to interactively test the live app instead of reading code.

### Stage 5: Define your gradable criteria

_[Slide: build the rubric]_

Write down 3–6 criteria for "good" output in your domain. Weight them by where the model is naturally weak (give weak areas more weight).

For each criterion:
- A **rubric** (what counts as 1, 3, 5).
- 2–3 **few-shot examples** with detailed score breakdowns.
- A **hard threshold** below which the sprint fails.

Feed all of this into the evaluator's system prompt.

### Stage 6: Stress-test on every model release

_[Slide: living document]_

When a new Claude releases:
1. Run an existing task through the harness once.
2. For each component, ask: *"Is this still load-bearing?"*
3. Disable load-bearing components one at a time. Re-run.
4. Anything you can disable without quality dropping → **delete it**.
5. With the freed budget, add new components that push the boundary further.

This is how harnesses stay sharp. Otherwise they accumulate cruft and slow you down.

### A starter checklist

_[Slide: design checklist]_

For your next non-trivial project, before you start building the agent's environment:

- [ ] What's my baseline failure mode? (What goes wrong with single-agent work today?)
- [ ] Do I need a planner, an evaluator, or both?
- [ ] What are my 3–6 gradable success criteria?
- [ ] What does my sprint contract template look like?
- [ ] What tool does my evaluator use to interactively verify?
- [ ] Where do my structured handoffs live (`SPEC.md`, `REVIEW.md`, `STATE.md`)?
- [ ] What's my reset trigger? (After two corrections? Between sprints? On context warning?)

If you can answer these, you have a harness.

---

## Closing & workshop wrap

_[Slide: three-part recap]_

**Part 1** gave you the vocabulary: assistants vs agents, the four-component architecture, the handy tools that make the workflow practical.

**Part 2** zoomed into the behaviors layer: how to use, design, and share skills. The Gotchas section is the load-bearing piece. Less is more. Define the negatives.

**Part 3** is the operating model for long-running work: a harness of specialized agents (planner / generator / evaluator), with file-based handoffs, sprint contracts, and interactive verification.

The single line that ties all three together:

> Every component in your setup — every CLAUDE.md instruction, every skill, every harness piece — encodes an assumption about what the model can't do on its own. Treat those assumptions as living. Stress-test them as the model improves.

Stop handcrafting. Start conducting. Thank you.
