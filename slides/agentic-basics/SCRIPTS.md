# Agentic Basics — Speaker Script

Speaking script for **Part 1: Agentic Basics** of the 2026 Agentic Engineering Workshop.

Organized into the three sections defined in `resources/part-1-overview.qmd`:

1. **Assistants vs Agents**
2. **Architecture**
3. **Handy Tools**

Source: Pingfan's three "Agentic Engineering" blog posts (March–April 2026), with conceptual fill-ins drawn from Anthropic's published material on agent design (notably *Building Effective Agents* and the harness-engineering framing).

---

## 1. Assistants vs Agents

### Opening: the panic & the opportunity

_[~2 minutes — set the tone]_

- Everyone in this room knows the feeling: every morning there is news of a new model, a new tool, a new workflow. It is overwhelming.
- The reframe: you do not need to chase every release. You need **a workflow that works for you**.
- Anchor quote — Andrej Karpathy: *"everyone has their developing flow."*
- Goal of Part 1: give you the **vocabulary and mental model** to design your own.

### The core distinction

_[Slide: side-by-side comparison]_

These two terms get used interchangeably. They should not be.

- **AI Assistants** — conversational interfaces. You ask, they answer. ChatGPT, Claude.ai, Gemini. Modern assistants can browse, run code, and remember context — but they still wait for you to drive each turn.
- **AI Agents** — autonomous executors. They run shell commands, read and write files, call APIs, and loop through decisions without waiting for you at each step. Codex, Claude Code, Gemini CLI.

The differentiator is not multi-turn conversation. It is **the ability to act independently in an environment**.

> Assistants answer. Agents act.

### What an "agent" actually is

_[Slide: the agent loop diagram]_

Anthropic's framing is the clearest one I've seen: an agent is an **LLM + tools + a loop**.

1. The LLM decides what tool to call.
2. The tool runs in the environment.
3. The result is fed back into the model's context.
4. The model decides the next move.
5. Repeat.

That loop is the whole game. Everything in the rest of this workshop — rules, skills, hooks, subagents, verifiers — is about shaping that loop.

Anthropic also makes a useful distinction in *Building Effective Agents*:

- **Workflows** — predefined sequences of LLM calls glued by code. The control flow is fixed.
- **Agents** — the LLM itself decides the next step. The control flow is dynamic.

Claude Code is firmly in the agent camp.

### When to use which

- One-off questions, quick lookups, polishing a paragraph → **Assistant** (the chat app).
- Multi-step tasks, project work, anything that touches files or external services → **Agent** (Claude Code & friends).

For the rest of this workshop we assume you are ready to step up to agents — specifically Claude Code.

---

## 2. Architecture

### "Architecture" means: where the agent lives

_[Slide: working directory = scope of context]_

The single most important step when you launch an agent is **picking the directory you launch from**. That directory becomes the agent's environment. Every file under it is potential context.

Two kinds of directories matter:

1. **Home directory** (`~`) — for computer-level tasks. Convenient but dangerous: an agent launched in `~` can touch anything on your machine. I keep a global `CLAUDE.md` here for rules that apply to *every* session, but I rarely launch real *work* from here.
2. **Project directories** — where you `cd` before launching. Each project gets its own `CLAUDE.md`, its own `.claude/` configuration, its own history. Scoped. Safer. More focused.

> It matters where you launch Claude Code.

Quick installation aside (skip if audience already has it):

```bash
brew install --cask claude-code     # install
cd /path/to/your-project            # change to project
claude                              # launch
```

Or open the project in an IDE (VS Code, Positron, Kaku) and launch `claude` from the integrated terminal — no `cd` needed.

### The four components of a Claude Code project

_[Slide: four-component diagram]_

After enough sessions you start to see the same pieces again and again. tw93 published a six-layer breakdown of Claude Code; I reorganized it into **four components**, because every Claude Code feature falls into one of them.

| Component | What it does | Examples |
|---|---|---|
| **Context** | What Claude reads at session start | `CLAUDE.md`, `rules/`, `memory/` |
| **Capabilities** | What Claude can act on | MCP servers, plugins |
| **Behaviors** | How Claude operates | skills, hooks |
| **Agents** | Delegated execution | subagents, verifiers |

Walk through each:

#### Context — the foundation

- `CLAUDE.md` is the file Claude reads automatically on every session. One in the project root; each subdirectory can have its own. Keep it short — it loads every time.
- A **global** `CLAUDE.md` lives at `~/.claude/CLAUDE.md` and applies to every Claude Code session, regardless of which project you're in.
- `.claude/rules/*.md` — detailed rules split by topic. They load **on demand**, not upfront. Saves tokens, keeps output consistent.
- The trigger for writing a rule: *"I want this reproduced reliably."*
- `memory/` — auto-managed by Claude Code, lives in `~/.claude/projects/`, **never** pushed to the cloud. Don't worry about it.

Practical workflow tip: complete a full output once, *then* ask Claude in the same session to extract a rule from it. The rule can be reused and refined over time.

#### Capabilities — what Claude can act on

- **MCP** (Model Context Protocol) — external servers. GitHub, Gmail, Figma, browser automation, calendars, databases. Claude calls them as structured tools.
- **Plugins** — installable packages that bundle skills + MCPs + hooks + config together.
- ⚠️ MCPs eat tokens fast. Use sparingly.

#### Behaviors — how Claude operates

- **Skills** — reusable slash commands like `/commit` or `/review`. They load a prompt template into the session to guide a structured workflow.
- **Hooks** — shell commands that fire automatically on Claude Code events. Linter after every edit, formatter on save, build verification at session end.

#### Agents — delegated execution

- **Subagents** — child Claude instances spawned to handle a focused subtask. Keeps the main session's context clean. Run them in parallel when the problem is big.
- **Verifiers** — post-execution checks (a test, a diff, a log review) that confirm the output is actually correct before the task is marked done.

### A concrete project layout

_[Slide: directory tree]_

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

### Plan first, then act

_[Slide: plan mode]_

The single biggest behavioral lever I've found:

- For any non-trivial task (3+ steps or anything architectural), enter **plan mode** first.
- Make Claude write a plan. Agree on it. *Then* implement.
- If something goes sideways mid-task, stop and re-plan. Don't push through.
- Use plan mode for verification too, not just building.

The model is already good. Letting it plan first makes it much better.

### The bigger picture: vibe coding → agentic engineering → harness design

_[Slide: workflow evolution timeline]_

Three terms describe three levels of maturity. They **coexist** — they don't replace each other.

- **Vibe Coding** — describe what you want, model generates code, hope it works. Outputs are unpredictable; you can't reliably reproduce a good result. Where most people start.
- **Agentic Engineering** — design agents with rules and skills; they handle complex tasks **reproducibly**. Where most of this workshop lives.
- **Harness Engineering / Harness Design** — Anthropic's recent framing. The "harness" is the structured environment **around** the model: tools, sandboxes, verifiers, retry logic, evaluation harnesses. Part 3 of this workshop goes deep on this.

> Stop handcrafting every piece. Start conducting.
> Set the rules, build the skills, let the agents handle execution.

---

## 3. Handy Tools

### The framing: don't panic

_[Slide: don't panic]_

Open this section the way I open Part 2 of my blog series: **don't panic.** You see lists like *"10 must-install AI tools"* everywhere. You install them, they quietly disappear from your life a week later.

There is no must-install kit. General-purpose tools help, but most of what you need is buildable. The tools below are the ones that actually stuck for me.

### Software

_[Slide: 4-tool stack]_

Four tools I use daily. Each is replaceable; the categories are not.

- **Obsidian** — note-taking, plain `.md` files, free iCloud sync. I pair it with Claude Code via `cd-obsidian`. Works for knowledge base, drafts, plans, anything text. Plain markdown is the cheapest format for Claude to read and edit.
- **Spokenly** — speech-to-text, multilingual, Mac & iOS. Largely replaces hand-typing for me. The blog posts you read for this workshop were dictated.
- **Positron** — IDE from Posit, built for data science but fine for general dev. VS Code foundation, so all extensions and shortcuts transfer. Editor, terminal, console, and data viewer open at once.
- **Kaku** — open-source macOS terminal, built-in tools, customizable shortcuts. Tabs and split panels with two keystrokes. Includes Yazi (terminal file manager) — I added a custom `yy` command that `cd`s into whatever Yazi is browsing when you quit it. Claude Code wrote it for me in a few seconds.

The pattern: each tool is **small, configurable, and integrates with Claude Code** via either text files or terminal commands.

### Extensions

_[Slide: plugins / MCPs / skills taxonomy]_

There is no official name for installable LLM contents. I call them **extensions**. Three kinds:

- **Plugins** — marketplace bundles. Install via `/plugin`. Bring in their own skills, MCPs, hooks, config.
  - `everything-claude-code` — the community kitchen sink.
  - `claude-plugins-official` — Anthropic-maintained. I use `claude-md-management`, `code-review`, `code-simplifier`, `context7`.
- **MCPs (connectors)** — external servers giving Claude real-time tool/data access.
  - **Excalidraw** — sketch system designs and flow charts.
  - **Figma** — read access to design files; generate code that matches your UI specs.
  - **TinyFish** — browser automation (forms, scraping, web UIs) without writing a script.
  - **Gmail / Google Calendar** — schedule check, inbox triage, todo list from email.
- **Skills** — slash commands stored as `.md` files. Auto-trigger on context, or invoke manually with `/name`.
  - tw93's [Waza](https://github.com/tw93/waza) is a great reference: eight skills, deliberately small surface area — `/think`, `/design`, `/hunt`, `/check`, `/write`, `/learn`, `/read`, `/health`.

Two design principles from the Waza author worth absorbing — these will come back in Part 2:

1. **Less is more.** Fewer skills with shorter names → easier to remember → actually used. Big bundles like `everything-claude-code` lose to focused sets in practice.
2. **Negative examples.** Define what a skill should *not* do. LLMs default to "broadly useful"; constraints sharpen targeting. Underused. Very effective.

### Custom shell commands

_[Slide: q- and cd- commands]_

Two patterns of bash commands I use daily — these aren't AI tools, but they're what makes the AI workflow frictionless.

- **`q-` (quick)** commands for routine maintenance.
  - `q-brew` → `brew update && brew upgrade && brew cleanup`. Fires every morning, leaves a log.
  - `q-pull` → pull all my GitHub repos (current branch + `main`). Fires every morning.
  - `q-hide` hides all windows, `q-close` closes all apps. For focus.
- **`cd-` (change directory)** commands replace plain `cd` with named shortcuts.
  - `cd-obsidian` → my vault.
  - `cd-website` → my website project.
  - `cd-github` → repos root.

Each is one line: an alias for `cd <path>`. Cheap to add, real time saved every day.

### The actual hardest skill: speaking well

_[Slide: callback to language as the bottleneck]_

Coming back to a point that ties this all together:

Patrick Winston, former director of the MIT AI Lab, opened his *How to Speak* lecture with: *"Your success in life will be determined largely by your ability to speak, your ability to write, and the quality of your ideas, in that order."*

In the AI era this matters **more**, not less. Being able to express what you want clearly is a humanistic skill, and it is the bottleneck for using agents well. The coding language matters less; **your ability to articulate matters more**.

Old saying: *"Talk is cheap, show me the code."*
New saying: *"Code is cheap, show me the prompt."*

---

## Closing & transition

_[Slide: recap + handoff]_

Three takeaways from Part 1:

1. **Assistants vs Agents.** Agents act independently in an environment. The agent = LLM + tools + loop.
2. **Architecture.** Working directory is the scope. Four components: **Context, Capabilities, Behaviors, Agents.** Plan first.
3. **Handy Tools.** No must-install kit. Pick small composable software. Use plugins/MCPs/skills sparingly. Automate the drudgery with `q-` and `cd-` commands. The hardest skill is still speaking clearly.

Hand-off to Part 2: now that you have the **vocabulary** and the **toolbox**, the next part dives into **Skill Usage and Design** — how to actually build the skills that drive your agentic workflow.
