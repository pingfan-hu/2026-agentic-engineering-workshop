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

### Randomness vs determinism _(slide: Randomness vs determinism)_

At their core, LLMs are probability machines: every output is sampled, not computed, so randomness is baked into everything an agent makes. Often that is exactly what you want; other times it is not. Authoring a skill comes down to one judgment: deciding what should stay **random** and what must be **pinned down**.

### When randomness is a gift _(slide: When randomness is a gift)_

Sometimes the randomness is the creativity. Take `/create-image`, a stand-in for my real `/ph-image`. I give it one loose line, "a warm banner for a Chinese recipe blog," and run it three times. I get three different images, all on theme. I never described every pixel, and I did not want to: here the variety is the whole point.

### Pinned down by a template and a script _(slide: Pinned down by a template and a script)_

Other times precision matters. When I build recipe pages, the little seasoning bottles have to match across every dish, or the set looks sloppy. Here are two of them: cooking oil and light soy sauce. Both are liquids in the same bottle and cork, yet the color, texture, and background differ. Everything that must hold still (the bottle, the cork, the framing, and the label text composited on by a script) is shared; only the liquid, which should differ, is left free.

### Determinism and randomness, mixed _(slide: Determinism and randomness, mixed)_

How do you get both at once? A saved **reference image** plus an **image-to-image script**. The reference locks the parts I care about (the container and the seal); the script fills in the rest, a different liquid, color, and texture each run. Determinism and randomness in a single asset: the reader just sees a consistent, matched set. Knowing which parts to lock and which to leave free is the whole craft of authoring a skill.

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
