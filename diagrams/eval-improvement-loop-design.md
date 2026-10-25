# Designing the Evaluation & Improvement Loop for a Production LLM Assistant

> **Interview context**: An LLM-powered assistant is already live and used by thousands of people. The team ships changes often: new prompts, new models, retrieval tweaks. Nobody is sure whether changes make things better or worse, and user feedback is piling up unused. Design the evaluation and improvement loop.

---

## The Core Loop

The system has four stages that feed each other continuously:

```
Ship change → Evaluate (offline + online) → Collect feedback → Improve → Ship change
```

---

## 1. Offline Evaluation (Before Deploy)

**Golden eval set** — a curated dataset of (input, expected_output, metadata) pairs, versioned alongside the code. This is your regression gate.

- **Graded by type**: factual accuracy (exact match / LLM-as-judge), tone/style (rubric-based LLM judge), refusal correctness (should it have refused?), latency, cost
- **Slice-based analysis**: don't just look at aggregate scores. Break evals by category (e.g., "park hours questions" vs. "dining recommendations" vs. "accessibility requests"). A change that improves average score by 2% but tanks accessibility answers by 15% is a regression.
- **LLM-as-judge with calibration**: use a stronger model (or panel of models) to score open-ended outputs against a rubric. Calibrate the judge against human ratings periodically — if judge and human agreement drops below threshold, retune the rubric.
- **CI gate**: every PR runs the eval suite. Red if any slice drops beyond a threshold (say >2% on any category). Yellow if aggregate dips. Green to merge.

**Why this matters**: without offline evals, you're flying blind on every deploy. The eval set is the single most valuable artifact in the system.

---

## 2. Online Evaluation (After Deploy)

Offline evals can't catch everything — distribution shift, latency under load, real user satisfaction. So you also measure in production:

- **A/B testing or shadow mode**: route a percentage of traffic to the new version. Compare metrics head-to-head on the same traffic distribution.
- **Key online metrics**:
  - **Task completion rate** — did the user accomplish what they came for?
  - **Conversation length** — shorter is usually better (got the answer fast), but context matters
  - **Escalation rate** — how often users ask for a human
  - **Retry/rephrase rate** — user repeating themselves signals the assistant failed
  - **Thumbs up/down ratio** (explicit feedback)
  - **Latency p50/p95/p99**
- **Canary deploys**: roll out to 5% → 25% → 100%, with automatic rollback if error rate or escalation rate spikes beyond baseline + threshold.

---

## 3. Feedback Collection & Labeling

This is where most teams leave value on the table. You have three feedback signals:

| Signal | Volume | Quality | Latency |
|---|---|---|---|
| Implicit (retry, abandon, escalate) | High | Noisy | Real-time |
| Explicit (thumbs up/down, stars) | Medium | Moderate | Real-time |
| Detailed (user comments, support tickets) | Low | High | Delayed |

### Pipeline Design

1. **Log everything**: full conversation, model version, retrieval context, latency, user actions — into an immutable conversation store.
2. **Triage by signal**: thumbs-down and escalation conversations get queued for human review. Thumbs-up go into a "candidate good examples" pool.
3. **Human labeling loop**: reviewers annotate bad conversations with failure mode (wrong fact, bad tone, hallucination, retrieval miss, etc.). This feeds two things:
   - New eval cases (grows the golden set)
   - Failure-mode dashboards (tells you *what kind* of problem to fix next)
4. **Cluster unlabeled feedback**: use embeddings to cluster the thumbs-down conversations. Often you'll find 3-4 dominant failure modes that a targeted fix can address.

---

## 4. Improvement Prioritization

Now you know *what's broken*. The question is what to fix and in what order:

- **Failure mode × frequency × severity matrix**: a rare hallucination about safety info is higher priority than a common minor tone issue.
- **Fix taxonomy** — different failures need different interventions:

| Failure Mode | Intervention |
|---|---|
| Retrieval miss | Update/expand knowledge base, tune retrieval |
| Hallucination | Add grounding constraints, retrieval verification step |
| Wrong tone | Prompt engineering, few-shot examples |
| Capability gap | Model upgrade, fine-tuning |
| Latency | Caching, model size, architecture changes |

- Each fix goes through the offline eval → canary → full deploy cycle above.

---

## 5. The Flywheel

The key insight: **feedback improves the evals, and better evals improve the system.**

```
User feedback → labeled failure cases → new eval entries → better regression detection
                                      → targeted fixes → better system → happier users
```

Over time, your eval set becomes a living representation of what users actually care about, not what you guessed they'd care about at launch.

---

## Architecture Diagram

```
                    ┌─────────────┐
                    │  CI / Eval  │◄── golden eval set (versioned)
                    │    Gate     │
                    └─────┬───────┘
                          │ pass
                    ┌─────▼───────┐
                    │   Canary    │──── online metrics dashboard
                    │   Deploy    │──── auto-rollback trigger
                    └─────┬───────┘
                          │ stable
                    ┌─────▼───────┐
                    │  Full Prod  │──── conversation logger
                    └─────┬───────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         implicit    explicit    detailed
         signals     ratings     comments
              │           │           │
              └───────────┼───────────┘
                          ▼
                    ┌─────────────┐
                    │  Triage &   │──► failure mode clusters
                    │  Labeling   │──► new eval cases ──► back to eval set
                    └─────┬───────┘
                          │
                    ┌─────▼───────┐
                    │ Prioritized │
                    │ Improvement │──► prompt/retrieval/model changes
                    │   Backlog   │
                    └─────────────┘
```

---

## Clarifying Questions to Ask the Interviewer

Before going deeper, ask:

- **What's the assistant's domain?** (general-purpose vs. narrow like park info — changes how you build evals)
- **What's the current feedback volume?** (determines whether you can rely on explicit feedback or need to invest heavily in implicit signals)
- **Is there a human escalation path already?** (that's free labeled data)
- **What's the deploy cadence?** (daily vs. weekly changes how heavy the eval gate needs to be)

---

## Deep Dive: "How Do You Know If the System Is Performing Better?"

"Better" must be defined before it can be measured. You need to decompose "better" into concrete, measurable dimensions. An LLM assistant doesn't have a single accuracy number like a classifier.

### Three Layers of "Better"

#### Layer 1: Component-Level Metrics (Did the parts improve?)

These are offline, deterministic, and fast. You check them before anything reaches a user.

| Component | Metric | How You Measure |
|---|---|---|
| Retrieval | Recall@k, MRR | Does the retriever surface the right docs for known queries? |
| Generation quality | LLM-judge score on rubric | Score fluency, correctness, completeness on held-out set |
| Factual accuracy | Exact match / entailment check | Compare claims against ground truth |
| Safety/refusal | Precision & recall on adversarial set | Does it refuse when it should, and *not* refuse when it shouldn't? |
| Latency | p50, p95 | Time to first token, total response time |
| Cost | $/conversation | Token usage per turn |

**"Better" here means**: the new version scores equal or higher on every slice of the eval set, with no slice regressing beyond a tolerance band.

Key principle: **aggregate improvement that hides a slice regression is not better.** If you improve park hours answers by 10% but dining recommendations drop 5%, you haven't proven the change is better — you've made a tradeoff you need to justify.

#### Layer 2: Behavioral Metrics (Do users act like it's better?)

These are online, measured via A/B test in production. This proves it's actually better for real users, not just on your curated test set.

**Primary signals** (high confidence, directly measure success):
- **Task completion rate** — did the user get what they came for without escalating or abandoning?
- **Escalation rate** — lower means the assistant handled it
- **Rephrase rate** — user saying the same thing differently means you failed the first time

**Secondary signals** (useful but noisier):
- **Conversation turns to resolution** — fewer is usually better
- **Session return rate** — do users come back? (long-term trust signal)
- **Explicit thumbs up/down ratio** — directionally useful but low coverage (~5-10% of users rate)

**The A/B test protocol**:
- Randomize users (not requests — you want per-user consistency) into control vs. treatment
- Run for statistical significance (not just a day or two — enough volume per slice)
- Pre-register success criteria: "We'll ship if task completion improves by >1% with p<0.05 and no slice regresses by >2%"
- **Look at metric distributions, not just means** — a change that helps 80% of users but makes 20% dramatically worse looks fine on average but isn't

#### Layer 3: Outcome Metrics (Does the business see improvement?)

These take weeks/months to move, so you can't gate a deploy on them, but they're the ultimate scorecard:

- **Support ticket volume** — is the assistant deflecting more tickets over time?
- **User satisfaction surveys** (CSAT/NPS) — periodic, not per-interaction
- **Retention / engagement** — are users choosing the assistant over alternatives?
- **Cost per resolution** — is the system getting cheaper to operate while maintaining quality?

You track these on a dashboard. If component and behavioral metrics improve but outcome metrics don't, your eval set is probably measuring the wrong things — that's a signal to go back and rebuild evals from real user failures.

### The Crisp Answer

> **I know a change is better when:**
> 1. Offline evals show no slice regression and net improvement on the targeted failure mode
> 2. A/B test shows statistically significant improvement on task completion rate (or whichever primary metric we pre-registered) with no slice regression
> 3. Over time, outcome metrics trend in the right direction
>
> **I know a change is worse when:**
> - Any eval slice drops beyond the tolerance threshold → blocked in CI
> - Online metrics degrade during canary → automatic rollback
> - Feedback volume spikes on a specific failure mode post-deploy → manual rollback + investigation
>
> **The hard case — change is sideways:**
> - Helps some users, hurts others, aggregate is flat. This means we need better slicing. Segment further (by user type, query type, context) until you find who it helps and who it hurts. Then decide if the tradeoff is worth it based on business priority.

### What Makes This Answer Strong in an Interview

- You're not hand-waving "we measure accuracy." You're showing you understand that **evaluation is multi-dimensional and adversarial** — the system will find ways to look good on your metrics while being worse.
- You're separating **statistical confidence** (A/B test) from **practical significance** (does the business care about a 0.3% improvement?).
- You're acknowledging the **failure mode of evaluation itself** — if outcome metrics diverge from your eval scores, your evals are wrong.
