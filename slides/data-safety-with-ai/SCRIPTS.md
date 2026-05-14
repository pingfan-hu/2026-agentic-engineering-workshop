# Data Safety with AI — Speaker Script

Speaking script for **Part 3: Data Safety with AI** of the 2026 Agentic Engineering Workshop.

Organized into the three sections defined in `resources/part-3-overview.qmd`:

1. **Counter-productivity of AI**
2. **The dilemma in data science**
3. **A successful workflow**

Audience note: this workshop is presented to attendees with a **data science background** but not necessarily heavy AI tooling experience. Parts 1 and 2 deliberately stop short of full automation. Part 3 explains *why*, and what a responsible AI-assisted data-science workflow looks like.

Pacing target: ~25 minutes, ~25–29 slides — matching Parts 1 and 2.

---

## Opening: a deliberate pivot

_[~1 minute — set the tone, defuse the whiplash]_

We just spent fifty minutes selling agentic workflows. Stop handcrafting, start conducting. Let agents handle execution.

I want to be honest with you: that argument works because in software engineering there is usually a **definite right answer**. The tests pass or they fail. The build is green or it is not. The API returns 200 or it does not. When the answer is checkable, agents and harnesses converge on it, and the productivity gains are real.

> Data science is not that. Most of the interesting decisions in our work have **no objectively right answer**.

So Part 3 is the part where we slow down and ask the harder question. Where does AI help a data-science workflow? Where does it quietly hurt it? And how do we keep the productivity wins from Parts 1 and 2 without losing what makes our analyses *credible*?

Three sections:

1. **Counter-productivity of AI** — the visible cost. Speed without supervision is a trap.
2. **The dilemma in data science** — the structural reason. No ground truth means no verifier.
3. **A successful workflow** — what to actually do. Two non-negotiables, plus a delegation map.

---

## 1. Counter-productivity of AI

### Speed is not the win we think it is

_[~1 minute]_

The pitch for AI tooling is almost always speed. *Ship faster. Iterate faster. Less typing.* For many tasks that is true. For data science it can be deeply misleading.

A short test you can apply to any AI-assisted output:

> If a reviewer asked me, *"why did you do it that way?"*, could I answer in a sentence — without re-reading the AI's explanation?

If no, the AI just lowered the **quality** of the analysis, even if it raised the **speed**. That gap is what we mean by counter-productivity.

### Three failure modes you will recognize

_[~3 minutes — make these concrete]_

Patterns I see when data scientists hand work to AI without supervision:

1. **Plausible code, wrong assumptions.** The model writes a `pandas` pipeline that runs cleanly, returns a dataframe of the expected shape, and quietly makes the wrong choice about how to join, group, or filter. The output looks fine. The conclusion is wrong.
2. **Confident summaries of noisy results.** Asked to "summarize the regression," the model returns a paragraph that sounds like a paper abstract — even when the model fit is poor or the assumptions are violated. Confidence is not calibrated to evidence.
3. **Velocity that hides the error.** Because each step is fast, errors compound across a notebook before anyone notices. By the time a coefficient looks weird, you have to retrace ten cells of generated code that no human ever read.

The common thread: each failure is *invisible at the moment it happens*. You only catch it later, often during review, sometimes never.

### The deeper cost: lost reasoning

_[~2 minutes — the load-bearing argument]_

Speed is the visible cost. The invisible cost is bigger.

When a data scientist writes code by hand, they are *thinking*. They are deciding which observations to drop, which transformation to apply, which test to run, and **why**. That reasoning is the actual product of the analysis. The code is just its trace.

When the same data scientist accepts AI-generated code without working through it, the reasoning step is skipped. You still get a result. You no longer know **why** it is the right result, or whether it is.

The artifact looks like work. The understanding that gives the artifact its value is missing.

> AI can write the analysis. It cannot defend it.

### Where AI clearly helps

_[~1 minute — keep it balanced]_

This is not an argument against AI in data science. It is an argument for being **deliberate**. AI clearly accelerates work where you would catch a wrong answer in seconds:

- **Boilerplate and ceremony** — `library()` blocks, themes, axis labels, file I/O.
- **Translation between languages** — R → Python, Stata → R, SQL dialect A → dialect B.
- **Documentation, naming, and writing** — variable names, docstrings, README sections.
- **Searching unfamiliar libraries** — *"how do I do X in `polars`?"*, faster than skimming docs.

The rule of thumb: **delegate where the right answer is checkable in five seconds.** Be careful everywhere else.

---

## 2. The dilemma in data science

### The example that frames the section: missing values

_[~3 minutes — the load-bearing example]_

Pick the simplest possible case. A column in your dataset has missing values. What should you do?

There is no universal answer. It depends on **why** the values are missing.

| Pattern | Right move | Wrong move |
|---|---|---|
| Missing at random (sensor blip, forgot to record) | Impute, drop, or model the missingness | Treat as zero, or as a category |
| Missing systematically (the question was skipped on purpose) | The missingness *is* the signal — encode it as a category | Impute, especially with the column mean |
| Structurally undefined (e.g., "spouse income" for unmarried respondents) | Filter to the relevant subgroup | Impute or drop case-wise |
| Unit changed mid-collection | Investigate, then split along the change point | Treat the column as one column |

A general-purpose AI agent does not know which row of this table applies to your data. It picks a default — usually mean imputation or row-drop — because that is what is most common in its training data. The default is plausible. It is also, in three out of four cases above, **wrong**.

This is not really a missing-values story. This is a story about **every interesting decision in a data-science workflow**:

- Which observations are outliers vs. the actual phenomenon?
- Is the deviation from a model assumption fatal or tolerable for *this* question?
- Should you drop a covariate that is collinear, or keep it for theoretical reasons?
- Is a 0.04 p-value evidence of an effect, or evidence that you ran enough tests?

In each of these, **two competent analysts can disagree** and both be doing real science. There is no test suite that says one of them is wrong.

### Why a harness-style loop fails here

_[~2 minutes — the structural argument]_

A modern AI harness — generator agent, reviewer agent, verifier agent, all running in a loop — works extremely well when the verifier has access to **ground truth**. Tests pass or fail. Builds compile or do not. The loop converges because there is something to converge to.

In the data-science cases above there is no verifier. **The reviewer agent is just another generator agent with a different prompt.** Two LLMs agreeing that the missing-value strategy looks fine is not evidence that it is fine — they will both default to the same statistical convention from the same training data.

So the failure mode of a fully-automated harness in data science is:

- Generator picks a plausible default.
- Reviewer agrees, because it would have picked the same default.
- Verifier checks that the code *runs*, not that the *decision* was right.
- The output ships.
- The conclusion is wrong, and you cannot tell from the artifact.

Every layer of automation we add multiplies the same blind spot. More agents do not fix it; they hide it.

### The credibility question

_[~1 minute]_

Step back: as a data scientist, your output is not the code or the figure. **Your output is a claim about the world.** That a drug works. That a policy change had this effect. That this group is at higher risk.

The credibility of that claim depends on you being able to defend every choice that led to it. A workflow that cannot survive the question *"why did you do it that way?"* is not a workflow — it is a liability.

> Reproducible code is not the same as a defensible analysis.

---

## 3. A successful workflow

### The principle: human as gatekeeper

_[~1 minute]_

The fix is not to stop using AI. The fix is to **decide which steps a human must own**, and enforce that boundary. Two non-negotiables:

> 1. **You own every decision about the data.**
>    What to keep, drop, transform, impute, model, exclude — and *why*.
>
> 2. **You write the methods section.**
>    The audit trail of your analysis is the one piece you should never delegate.

Everything else can flex.

### A delegation map

_[~3 minutes — the practical slide]_

A simple matrix you can use to decide what to hand to AI and what to keep:

| Task | Delegate to AI? | Why |
|---|---|---|
| Boilerplate, syntax, library lookup | **Yes** | Right answer checkable instantly |
| First draft of transformation code | **Yes, then read every line** | Speed up, but reason yourself |
| Choosing how to handle missing values | **No** | No ground truth — your call |
| Picking a model specification | **No** | Theory + judgment, not pattern-match |
| Interpreting model output | **No** | This *is* the analysis |
| Drafting the methods section | **No** | This is how you defend the work |
| Reformatting the methods section | **Yes** | Mechanics, not decisions |

The boundary moves over time as you learn what the model is reliable at. The principle does not move: **the data scientist signs off on every decision that affects the conclusion**.

### Pin the decisions in the code

_[~1 minute]_

For every non-trivial decision, leave a comment that captures *why*:

```python
# Drop respondents who skipped the income question.
# Structural skip (only employed respondents see it),
# not a refusal — see codebook §4.2.
df = df[df["employed"] == 1]
```

These comments are what make the analysis defensible six months later. They are also what stops the next AI session from "helpfully" rewriting the filter the wrong way.

### Verify against an independent check

_[~1 minute]_

Before believing a headline number, check it against something AI did not generate:

- A summary statistic from the codebook or a published paper.
- A back-of-envelope calculation you do by hand.
- A second analysis run by a colleague who did not use the same chat session.

If the AI-assisted pipeline and the independent check disagree, the **AI-assisted pipeline is wrong** until you can explain the gap.

### Two issues data science makes worse

_[~2 minutes — the topics no one talks about]_

**Reproducibility.** AI sessions are not deterministic. Different model versions, different system prompts, even different times of day can produce different code. If you do not capture *which model and which session* produced a given step, you have weakened the reproducibility of your work. Practical move: paste the model name and date into a comment when the AI's contribution is non-trivial.

**Disclosure.** Increasingly, journals, conferences, and funders ask whether AI was used in preparing an analysis. The honest answer is almost always *yes, in some form*. A short, accurate methods-section sentence — *"Code drafts were generated with [model name] and reviewed and modified by the authors before use"* — costs nothing and protects you from later challenges.

### The mindset

_[~1 minute — the close]_

Two sayings to leave with:

- **Old**: *"Trust, but verify."*
- **New**: *"Verify, then trust."*

AI assistance flips the default. The output is plausible by default. **Plausible is not the same as correct.** In data science, that gap is the whole game.

> Use AI to write the analysis. Be the one who decides what it means.

---

## Closing & transition

_[Slide: recap]_

Three takeaways from Part 3:

1. **Counter-productivity of AI.** Speed without supervision lowers quality even when it raises throughput. The lost reasoning is what gives an analysis its credibility — skip it and the artifact is just code.
2. **The data-science dilemma.** The decisions that matter most have no ground truth. A harness loop with no verifier does not converge — it hides the blind spot behind more layers. Two LLMs agreeing is not evidence.
3. **A successful workflow.** Two non-negotiables: **you own the data decisions, you write the methods section.** Everything else can be delegated, but every decision goes through you. Pin decisions in comments, verify against independent checks, disclose AI use.

Closing line: *"AI is a powerful collaborator. It is not a competent analyst. The difference is who signs the paper."*

---

## Speaker notes & open questions

_(Working notes for the speaker — not slide content.)_

- **Tone:** sympathetic to AI use (we just spent two parts on it), serious about the failure modes. Avoid "AI is bad for data science" — the message is *"AI is for the mechanics, you are for the decisions."*
- **Pacing:** Section 1 ~7 min, Section 2 ~6 min, Section 3 ~9 min, opening + closing ~3 min = ~25 min total.
- **Open question — live demo:** A 60-second demo of an AI confidently proposing a bad missing-values strategy on a real dataset would land harder than any slide. Could open Section 2 with it. Decide closer to the day based on time and tooling on stage.
- **Open question — domain examples:** Are there examples from John's energy/transportation work or your own PhD area that would resonate more than the generic survey-data example? Worth swapping in if the audience is GW-heavy.
- **Section card icons** (already wired in `resources/part-3-overview.qmd`):
  - Section 1 — `gauge` (counter-productivity / speed without control)
  - Section 2 — `git-fork` (the branching dilemma)
  - Section 3 — `shield-check` (gatekeeper)
- **Cut from earlier draft:** the "missing third stage" meta-framing about how Part 3 was originally going to be Harness Engineering. Audience does not need to know the planning history — moved into this notes section for context only.
