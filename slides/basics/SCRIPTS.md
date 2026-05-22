# Agentic Basics — Speaker Script

Speaking script for **Part 1: Agentic Basics** of the 2026 Agentic Engineering Workshop.

Part 1 is **hands-on first, theory second**. The plan:

1. **Install Your Tools** — Spokenly, Claude Code, Positron.
2. **Your First Website** — use Claude Code to build a single-page HTML site.
3. **Multiple Pages** — extend it to a multi-page site with navigation.
4. **Agentic Basics** — now that students have *seen* an agent work, unpack the theory: assistants vs agents, the agent loop, architecture, and the bigger workflow picture.

Source material: Pingfan's four "Agentic Engineering" blog posts (March 2026 – May 2026), plus Anthropic's *Building Effective Agents* for the formal definitions.

> Note: the existing `resources/part-1-overview.qmd` lists three section cards (Assistants vs Agents · Architecture · Handy Tools). Once this script lands, the overview cards should be updated to match the four-section structure here.

---

## 0. Opening framing (~2 minutes)

_[Slide: panic + opportunity]_

- Every morning there is news of a new model, a new tool, a new workflow. It is overwhelming. Everyone in this room knows the feeling.
- The reframe: you do not need to chase every release. You need **a workflow that works for you**.
- Anchor quote — Andrej Karpathy: *"everyone has their developing flow."*
- So my opening advice: **don't panic.** Build your own workflow whenever you need one. Adapt what catches your eye, or start from scratch.

_[Slide: roadmap]_

- Here is the plan for the next 25 minutes:
  1. **Install three pieces of software** so we are all on the same baseline.
  2. **Build a single-page website with Claude Code** — your first hands-on with an AI agent.
  3. **Turn it into a multi-page website** — add an About page and a Projects page that link from the homepage.
  4. **Step back and unpack the agentic basics** — what just happened, and why it matters.
- You will *use* an agent before you *learn about* one. That order is deliberate.

---

## 1. Install Your Tools

### Why these three (~1 minute)

_[Slide: three-tool stack]_

We are installing exactly three tools today. Each plays a distinct role in the loop:

- **Claude Code** — the agent. It reads files, writes files, runs shell commands, calls APIs.
- **Positron** — the IDE we'll keep open while Claude Code works, so we can watch files change live and edit alongside it.
- **Spokenly** — voice-to-text. Most of my blog posts and prompts are dictated, not typed. It is faster than typing and produces cleaner first drafts than you'd expect.

You can swap any of these later. Today we standardize so everyone is on the same baseline.

### Claude Code (~2 minutes)

_[Slide: terminal command]_

Homebrew is the cleanest install on macOS:

```bash
brew install --cask claude-code
```

On Windows, follow the official installer at `claude.com/claude-code`. On Linux, same install page.

Once installed, open a terminal and type:

```bash
claude
```

It will prompt you to log in. Use your Claude account. If you already have a Claude Pro or Team plan, Claude Code is included.

> **Heads up:** do not launch `claude` from your home directory yet. Where you launch it matters, and we'll get to that in a second.

### Positron (~1.5 minutes)

_[Slide: Positron download]_

Positron is an IDE from Posit, the company behind RStudio. It is built on the VS Code foundation, so every VS Code extension and shortcut transfers. Three reasons we use it:

- Editor, terminal, console, and data viewer open at once.
- Free, cross-platform, MIT-licensed.
- Side-by-side source-and-rendered-output view is exactly what we want for HTML work.

Download at `positron.posit.co` → install → open it once to confirm it launches.

### Spokenly (~1.5 minutes)

_[Slide: Spokenly]_

Spokenly is a voice-to-text app for Mac and iOS. It wires up an AI model (GPT-4o by default) to transcribe and lightly clean up your speech — filler words and false starts get smoothed out, but your actual phrasing survives.

- Download at `spokenly.app`, sign in, set a global hotkey.
- Test it: hold the hotkey, say a full sentence, release. The text lands wherever your cursor is.
- The blog posts and slides for this workshop were dictated through Spokenly.

You can keep typing if you prefer. But try it once during the next hour — most people don't go back.

### Checkpoint (~30 seconds)

_[Slide: checklist]_

Before we move on, everyone should have:

- [ ] `claude` runs in a terminal.
- [ ] Positron opens.
- [ ] Spokenly's hotkey produces text in any window.

If anyone is stuck, raise a hand now. The next sections assume all three work.

---

## 2. Your First Website

### Pick a project directory (~2 minutes)

_[Slide: working directory matters]_

This is the **single most important habit** in agentic engineering: pick the directory you launch from. Everything Claude Code sees and touches lives under that directory.

Two kinds of directories matter:

1. **Home directory** (`~`) — convenient, but an agent launched here can touch anything on your machine. I keep a global `CLAUDE.md` here for rules that apply to *every* session, but I rarely launch real work from `~`.
2. **Project directories** — where you `cd` before launching. Each project gets its own `CLAUDE.md`, its own configuration, its own history. Scoped. Safer. More focused.

> *"It matters where you launch Claude Code."*

Open Positron. Create a new folder somewhere sensible — call it `my-first-site`. Open it in Positron, then open Positron's integrated terminal. You're now inside the project. Launch Claude Code:

```bash
claude
```

No `cd` needed — Positron's terminal already opens at the project root.

### Prompt for a homepage (~5 minutes)

_[Slide: first prompt]_

Now we use Claude Code as an agent. Your first prompt — say it, dictate it, type it, whatever feels right:

> *"Create a single-page personal website. One HTML file called `index.html`, one CSS file called `styles.css`. The page should have my name as a big headline, a short paragraph about me, and a section with three of my interests as a list. Use a clean modern look — generous spacing, a serif headline, a sans-serif body, and a single accent color. Don't add JavaScript yet."*

Watch what happens:

- Claude reads the (empty) directory.
- It writes `index.html` and `styles.css`.
- It tells you what it created and how to view it.

Open `index.html` in your browser by double-clicking it, or run `open index.html` from the terminal.

This is the agent loop in action. The model picked tools — `Write` for each file — ran them, and reported back. You did not write a single line of HTML.

### Iterate in plain language (~3 minutes)

_[Slide: iteration is a conversation]_

The output probably looks generic. Make it yours. Pick *one* of these and dictate it through Spokenly:

- *"Replace the placeholder name with mine — Pingfan Hu — and rewrite the bio in one sentence about being a PhD student at GW studying agentic engineering."*
- *"Change the accent color to teal, and add a soft shadow under the headline."*
- *"Use a Google Font — `Inter` for body, `Playfair Display` for the headline."*

Refresh the browser after each change. Each round is a turn of the agent loop: model decides → tool runs → result feeds back → you decide what's next.

> Notice: you are not writing code. You are **describing what you want**. The agent translates intent into edits.

### Anchor the takeaway (~30 seconds)

_[Slide: assistant vs agent foreshadow]_

What you just used is **not** a chatbot. ChatGPT in a browser cannot create files on your laptop. Claude Code can — and just did. We'll formally name that difference in Section 4.

---

## 3. Multiple Pages

### Add a second page (~3 minutes)

_[Slide: about page]_

Next prompt:

> *"Add an `about.html` page with a longer bio — three paragraphs covering my background, current research, and hobbies. Match the style of `index.html`. Link to it from the homepage with a navigation bar at the top."*

Watch what Claude does this time:

- Reads `index.html` and `styles.css` first (it now has prior context).
- Writes `about.html` reusing the same styles.
- Edits `index.html` to add a `<nav>` at the top with two links.
- Optionally extracts shared header markup into something cleaner.

Refresh the homepage. Click the link. You now have two pages.

### Add a third page and tighten the nav (~3 minutes)

_[Slide: projects page]_

> *"Add a `projects.html` page that lists three projects, each with a title, a short description, and a placeholder link. Update the nav on all three pages so each page links to the other two. Highlight the current page in the nav with bold text."*

Two things to notice:

1. Claude updates **three files** in one turn — homepage, about, projects. It does the boring consistency work for you.
2. "Highlight the current page" is a tiny design decision that would take you a few minutes to implement by hand. The agent does it in seconds and explains how.

### Where Claude struggles (~2 minutes)

_[Slide: when it goes wrong]_

It will go wrong eventually. Three common shapes:

- **Vague prompt → generic output.** "Make it look better" yields nothing useful. "Tighten the line-height to 1.4, increase the headline size to 3rem, and add 4rem of vertical padding around each section" yields exactly that.
- **Wrong assumption.** Claude may invent a file path or import a library you don't have. When you spot this, stop and correct — don't let it keep building on a wrong assumption.
- **Stuck in a loop.** If a fix doesn't land after two attempts, **stop and re-plan.** Tell the agent what's wrong and what you want instead. Don't keep pushing through.

> *"If something goes sideways, STOP and re-plan immediately — don't keep pushing."* — That's a line from my own global `CLAUDE.md`.

### Wrap the hands-on (~1 minute)

You now have a three-page site, generated and styled entirely by describing what you wanted. Take 30 seconds to look at the files in Positron's file panel. Notice:

- HTML files Claude wrote.
- A CSS file Claude wrote and edited.
- A conversation history you can scroll up to read.

That's everything. No frameworks, no build step, no boilerplate. The whole project is **plain text the agent can read and edit**.

---

## 4. Agentic Basics

Now the theory. We just *used* an agent — let's unpack what an agent actually is, how Claude Code is architected, and where this workflow sits in the bigger picture.

### Assistants vs Agents (~3 minutes)

_[Slide: side-by-side comparison]_

These two terms get used interchangeably. They should not be.

- **AI Assistants** — conversational interfaces. You ask, they answer. ChatGPT, Claude.ai, Gemini. Modern assistants can browse, run code, and remember context — but they still wait for you to drive each turn.
- **AI Agents** — autonomous executors. They run shell commands, read and write files, call APIs, and loop through decisions without waiting for you at each step. Codex, Claude Code, Gemini CLI.

The differentiator is **not** multi-turn conversation. It is **the ability to act independently in an environment**.

> Assistants answer. Agents act.

In the last 20 minutes, you used an agent. Compare it mentally to ChatGPT in a browser — same model family, totally different surface.

### What an "agent" actually is (~3 minutes)

_[Slide: the agent loop]_

Anthropic's framing in *Building Effective Agents* is the clearest one I've seen: an agent is an **LLM + tools + a loop**.

1. The LLM decides what tool to call.
2. The tool runs in the environment.
3. The result is fed back into the model's context.
4. The model decides the next move.
5. Repeat.

That loop is the whole game. Everything else in this workshop — rules, skills, hooks, subagents, verifiers — is about shaping that loop.

Anthropic also draws a useful distinction:

- **Workflows** — predefined sequences of LLM calls glued by code. Control flow is fixed.
- **Agents** — the LLM itself decides the next step. Control flow is dynamic.

Claude Code is firmly in the agent camp. You saw it pick which files to read, which to write, and when to stop.

### Architecture: where the agent lives (~3 minutes)

_[Slide: four-component diagram]_

After enough sessions you start seeing the same pieces again and again. tw93 published a six-layer breakdown of Claude Code; I reorganized it into **four components**, because every Claude Code feature falls into one of them.

| Component | What it does | Examples |
|---|---|---|
| **Context** | What Claude reads at session start | `CLAUDE.md`, `rules/`, `memory/` |
| **Capabilities** | What Claude can act on | MCP servers, plugins |
| **Behaviors** | How Claude operates | skills, hooks |
| **Agents** | Delegated execution | subagents, verifiers |

Quick walkthrough — we'll go deep in Part 2:

- **Context — the foundation.** `CLAUDE.md` is the file Claude reads automatically every session. One in the project root; subdirectories can have their own. A **global** `CLAUDE.md` lives at `~/.claude/CLAUDE.md` and applies to every session. Detailed rules go in `.claude/rules/*.md` and load **on demand**, not upfront — saves tokens, keeps output consistent. The trigger for writing a rule: *"I want this reproduced reliably."*
- **Capabilities.** **MCP** (Model Context Protocol) connects Claude to external servers — GitHub, Gmail, Figma, browsers, calendars. **Plugins** bundle skills + MCPs + hooks + config into one installable unit. MCPs eat tokens fast; use sparingly.
- **Behaviors.** **Skills** are reusable slash commands like `/commit` or `/review` — prompt templates that load into the session. **Hooks** are shell commands that fire automatically on Claude Code events (linter after every edit, build verification at session end).
- **Agents.** **Subagents** are child Claude instances spawned to handle a focused subtask, keeping the main context clean. **Verifiers** are post-execution checks that confirm output is actually correct before the task is marked done.

_[Slide: a concrete project layout]_

```text
your-project/
├── CLAUDE.md                  # project-level rules (loaded every session)
├── .claude/
│   ├── rules/                 # topical rules, loaded on demand
│   │   ├── core.md
│   │   ├── config.md
│   │   └── release.md
│   ├── skills/                # slash commands
│   ├── agents/                # subagent definitions
│   └── settings.json          # hooks, permissions
└── docs/
    └── ai/                    # human + AI shared documentation
```

The shape varies by project. The point: every piece has a home, and Claude Code knows where to look.

### Plan first, then act (~2 minutes)

_[Slide: plan mode]_

The single biggest behavioral lever I've found:

- For any non-trivial task (3+ steps or anything architectural), enter **plan mode** first.
- Make Claude write a plan. Agree on it. *Then* implement.
- If something goes sideways mid-task, stop and re-plan. Don't push through.
- Use plan mode for verification too, not just for building.

You can try it now — hit Shift+Tab in your Claude Code session to toggle plan mode. The model proposes; you approve; then it executes.

### Vibe coding → agentic engineering (~2 minutes)

_[Slide: workflow evolution]_

Two terms describe two levels of maturity. They **coexist** — they don't replace each other.

- **Vibe Coding** — describe what you want, model generates code, hope it works. Outputs are unpredictable; you can't reliably reproduce a good result. Where most people start.
- **Agentic Engineering** — design agents with rules and skills; they handle complex tasks **reproducibly**. Where this workshop lives.

> *Stop handcrafting every piece. Start conducting.*
> *Set the rules, build the skills, let the agents handle execution.*

### The hardest skill is still speaking (~2 minutes)

_[Slide: language as the bottleneck]_

A point that ties everything together.

Patrick Winston, former director of the MIT AI Lab, opened his famous *How to Speak* lecture with: *"Your success in life will be determined largely by your ability to speak, your ability to write, and the quality of your ideas, in that order."*

In the AI era this matters **more**, not less. The bottleneck for using agents well is your ability to express what you want clearly. The coding language matters less; **your ability to articulate matters more**.

This is also why **Spokenly belongs in the stack**. Voice input lowers the friction of getting a clear prompt out of your head and into the agent.

Old saying: *"Talk is cheap, show me the code."*
New saying: *"Code is cheap, show me the prompt."*

---

## Closing & transition (~1 minute)

_[Slide: recap + handoff]_

Three takeaways from Part 1:

1. **You used an agent.** Spokenly + Claude Code + Positron is a complete loop — speech in, code out, rendered output visible side-by-side. You have a working three-page site to prove it.
2. **An agent is LLM + tools + loop.** Claude Code is an agent because it acts independently in your working directory. Pick that directory carefully — it defines what the agent sees and touches.
3. **Architecture has four components:** Context · Capabilities · Behaviors · Agents. We touched Context (the working directory itself). Part 2 dives into Behaviors — specifically, how to design and use **skills**.

Hand-off to Part 2: now that you have the **vocabulary** and a **working site**, the next part is **Skill Usage and Design** — how to build the reusable workflows that turn one good prompt into a repeatable agent capability.
