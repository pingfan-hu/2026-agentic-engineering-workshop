# Skill Usage and Design: Speaker Script

Speaking script for **Part 2: Skill Usage and Design** of the 2026 Agentic Engineering Workshop.

Organized into the three sections defined in `resources/part-2-overview.qmd`:

1. **Using Skills**
2. **Installing Skills**
3. **Authoring Skills**

Source of truth: Pingfan's blog post [Agentic Skills](https://pingfanhu.com/blog/2026-06-24-agentic-skills/).

Pacing target: ~25 minutes, ~25 slides. Section dividers are not used; the roadmap previews the three parts once, and every content slide self-explains which part it belongs to.

---

## Opening

### Recap _(slide: Recap)_

_[~1 min]_

In Part 1 you built a website with an agent, then turned it into a skill. That last step is the whole of Part 2. In the four-component picture, this is the **Skills** box, and we are spending the next 25 minutes inside it.

### Today _(slide: Today)_

Everything about a skill splits into three things you do with it, and that is the shape of today:

1. **Using:** summon a workflow by name with a slash.
2. **Installing:** borrow general-purpose skills from the open-source market.
3. **Authoring:** encapsulate your own workflow, once.

### Why wrap work in a skill? _(slide: Why wrap work in a skill?)_

Much of daily work is the same task repeated: image generation, document formatting, HTML content, app release steps. Without a skill, each repetition re-issues essentially the same long instructions to the agent. That is wasteful. A skill designs the workflow **once** and invokes it by name forever after.

---

## 1. Using Skills

### What is a skill? _(slide: What is a skill?)_

Two halves and you know both what a skill is and how you use it.

**On disk:** a skill is a **directory** named after the skill, holding a **`SKILL.md`**: a prompt loaded into context when you call it. That is the entire mental model.

**In use:** you summon it by name with a **slash**. I have a `ph-image` skill that generates images in a consistent style for my blog; I type `/ph-image` plus one short line about what I want. Internally the skill reads its `SKILL.md`, enhances my short prompt, calls the image API, and returns a finished, on-brand asset. One short request in; a consistent asset out. The hard part lives inside the skill, designed once.

### Eight skills from Waza _(slide: Skill usage example: the Waza plugin)_

You do not start from zero. Install one small plugin, [Waza](https://github.com/tw93/Waza) by tw93, and eight general-purpose skills are ready to invoke. They cover most everyday work: `/think` plans before you build, `/ui` crafts frontends, `/hunt` tracks a bug to its root cause, `/check` reviews diffs and releases; `/write` makes prose sound natural, `/read` digests URLs and PDFs, `/learn` researches a topic end-to-end, and `/health` audits your agent setup. Waza stays deliberately small: eight skills, each with one clear purpose. This is the fastest way to feel what using skills is like, and we will install it together shortly.

### Let's use /read to summarize _(slide: Let's use /read to summarize)_

A concrete example of using a skill. The source is John's blog post, "The Unreasonable Effectiveness of Quarto." The prompt is one line: use `/read` to read through the URL and summarize the takeaways. The skill fetches the page, and here is the whole post boiled down to four: **one source, any format** (a single `.qmd` renders to HTML, PDF, Word, and slides); **up to 7x fewer tokens** than asking Claude for the finished format directly; **always current**, because code runs at render time so the data stays live; and **plain text**, so it lives in Git with clean diffs and easy edits. One short request in, a page distilled to what matters. (These very slides are a `.qmd`.)

### Practice 01 _(slide: dark, practice 01)_

_[~10 min]_ Three steps. **Install** the Waza plugin, following its README. **Use** one of its skills on a real task and judge the quality of the result. Then **inspect**: ask your agent to walk you through the pipeline encapsulated in that skill, so you see why it boosts efficiency, the long, careful process runs once inside the skill, and you summon it with a slash.

---

## 2. Installing Skills

### Where to install skills from _(slide: Where to install skills from)_

For general work (editing, coding, reading) you should borrow rather than build. Two sources I use most:

- **Everything Claude Code (ECC):** an expansive, all-inclusive plugin. Its own README advises installing selectively; it is a kitchen sink.
- **Waza** (by tw93): deliberately minimal, eight skills, covering the common cases of everyday development, coding and otherwise.

Anything specific to *your* workflow you author yourself. That is the rest of the talk.

### Practice 02 _(slide: dark, practice 02)_

_[~8 min]_ Install Waza following its README, then run one of its skills: `/read` on a link, or `/think` on an idea.

---

## 3. Authoring Skills

### Skill authoring _(slide: Skill authoring)_

Now you know how to use a skill and how one works; time to create your own to meet your own needs. It all centers on the `SKILL.md`, which is two parts:

- a **YAML header** declaring `name` and `description` (this powers discovery), and
- a **body**, the prompt loaded on invocation, stating the rules, conventions, and examples the agent should follow.

### The minimal skill _(slide: The minimal skill)_

At minimum a skill is a directory bearing the skill's name, holding a single `SKILL.md`. That is the only hard requirement. My `/ph-html` skill has only this one file, yet it produces every styled HTML component across my blog and slides.

### Minimal in form, not in function _(slide: Minimal in form, not in function)_

Minimal in form does not mean minimal in function; `ph-html` proves that. A small naming habit: I prefix every skill I author with my initials, `ph-`. Inside the `skills/` folder, everything I wrote sits together, separate from what I installed.

### Add templates and scripts _(slide: Add templates and scripts)_

A skill can carry more than the master `SKILL.md`. Because an LLM is stochastic, an instruction-only skill drifts between runs. Solidified resource files pin down what should not vary. My `/ph-slide` ships two folders:

- `assets/`: the deterministic building blocks, a shared stylesheet, the deck config, a render script.
- `template/`: a complete Quarto slide project to copy and adapt each time.

### These slides were built with `/ph-slide` _(slide: These slides were built with /ph-slide)_

You are looking at the output right now. All three parts of this workshop were built with `/ph-slide`: one theme, one taste, three decks. The template does the holding-still.

### Randomness vs determinism _(slide: Randomness vs determinism)_

At their core LLMs are probability machines. Every output is sampled, not computed, so randomness is baked into everything an agent makes. Sometimes that is welcome; often it is not, and a banner should match its siblings. You build determinism in on purpose with two levers: **templates** (fixed examples the agent copies) and **scripts** (the pre- and post-processing that must never vary).

### Pinned down by a template and a script _(slide: Pinned down by a template and a script)_

Here are two ingredient icons. Everything deterministic is shared: the bottle, the cork, the framing, and the label text composited on afterward by a script (image models are unreliable with text, so the words live in code and are never garbled). The bottle comes from an image-to-image pass against a saved reference. Only the liquid, the part that should differ, is left random. The reader just sees a matched set.

### Nest another agent _(slide: Nest another agent)_

No model is good at everything. A skill can call another agent that is better at a specific task, while your master agent keeps your context and setup. `/ph-image` does this: I give Claude Code a loose prompt; it enhances the prompt and sends it to Gemini; Gemini generates; Claude Code reviews and loops back if the result is wrong; the final image returns to me. I stay in the loop; the agents handle the prompt engineering and API calls.

### One skill, many workflows _(slide: One skill, many workflows)_

For a whole project, design one skill that embraces as many aspects as possible. Two reasons:

1. **One name to recall:** memorizing many skill names is inefficient; one name for the project is enough.
2. **Cheap to load:** the agent reads `SKILL.md`, then selectively picks only the related files, so token cost stays small.

### `/surveydown`: four workflows, one name _(slide: /surveydown)_

My `/surveydown` skill is the example. surveydown is an open-source survey platform (R, Quarto, Shiny, PostgreSQL). The skill bundles four full workflows under one name: create a survey, connect a database, deploy online, and record a video walkthrough. Each is a complete workflow, not a loose hint.

### Practice 03 _(slide: dark, practice 03)_

_[~10 min]_ Author a skill from your Part 1 website: ask Claude to look at the folder and turn it into a reusable skill, a `SKILL.md` plus a `template/` folder with the pages and `styles.css`, so you can rebuild that style anytime.

---

## Closing & transition

### Four shapes of a skill _(slide: Four shapes of a skill)_

The only requirement is a `SKILL.md`; everything beside it is optional, and takes a few recurring shapes:

1. **Start minimal:** one `SKILL.md` is enough to begin.
2. **Pin the deterministic parts:** templates and scripts keep what must hold still.
3. **Bundle workflows:** one skill can hold many abilities under one theme.
4. **Nest other agents:** delegate the task your agent is weak at.

### Skills are for humans _(slide: dark pull-quote)_

One conceptual point to close on. A skill is not for the agent's benefit. The agent does not distinguish a skill from a temporary prompt; it only reads files, context, and prompts wherever they are. We make skills for the **humans**, to encapsulate a workflow worth keeping.

### Up next _(slide: Up next)_

Hand-off to Part 3, **Data Safety with AI**: where AI helps a data-science workflow, where it quietly hurts, and how to keep the data scientist in the loop as the gatekeeper.
