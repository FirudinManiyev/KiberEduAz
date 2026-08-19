# Risk Identification
### Module 2 — Room 1: Finding the Risks Before They Find You

---

## Table of Contents
1. [Before You Start: A Simple Analogy](#before-you-start-a-simple-analogy)
2. [Introduction](#introduction)
3. [Why Risk Identification Is the Foundation of Everything Else](#why-risk-identification-is-the-foundation-of-everything-else)
4. [Risk vs. Issue vs. Incident — Getting the Vocabulary Right](#risk-vs-issue-vs-incident--getting-the-vocabulary-right)
5. [Categories of Risk](#categories-of-risk)
6. [Risk Identification Techniques](#risk-identification-techniques)
7. [Writing a Good Risk Statement](#writing-a-good-risk-statement)
8. [Top-Down vs. Bottom-Up Identification](#top-down-vs-bottom-up-identification)
9. [Common Mistakes](#common-mistakes)
10. [Case Study: The Risk Everyone Saw But No One Wrote Down](#case-study-the-risk-everyone-saw-but-no-one-wrote-down)
11. [Key Terminology](#key-terminology)
12. [Summary](#summary)
13. [Self-Check: Can You Explain It?](#self-check-can-you-explain-it)
14. [Review Questions](#review-questions)

---

## Before You Start: A Simple Analogy

Picture a lookout on an old sailing ship, standing watch at the top of the mast. Their entire job is to spot danger — icebergs, storms, rocks, other ships — **before** it's close enough to cause harm.

A good lookout doesn't just stare in one direction. They:

- **Scan systematically**, sweeping the whole horizon in sections, rather than staring at whatever catches their eye first
- **Use more than one method** — their own eyes, a spyglass for distant objects, and information passed up from the crew below about water conditions
- **Report what they see in specific, useful terms** — not "something's out there," but "iceberg, two points off the starboard bow, closing"
- **Don't wait for danger to become obvious** — by the time an iceberg is visible to everyone on deck, it may already be too late to turn

**Risk identification works exactly the same way.** It's the disciplined, systematic practice of scanning your organization for potential threats — not waiting for something to go wrong and calling that "finding a risk." A vague warning ("something feels off in that department") is about as useful as a lookout shouting "something's out there" — technically true, but not useful enough to act on.

Keep the lookout in mind. Everything in this room is really about becoming a better, more systematic lookout for your organization.

---

## Introduction

In Module 1, you learned what GRC is, who's accountable for it, and which frameworks exist to guide it. Now we start Module 2, which goes deep into **Risk Management** — and every risk management process, no matter which framework you're following, starts with the same first step: **you cannot manage a risk you haven't identified.**

This sounds obvious, but it's the single most common place risk management quietly breaks down. Organizations don't usually fail because they mismanaged a known risk — they fail because a risk was **never formally identified** in the first place, even though, in hindsight, someone usually "kind of knew" about it.

By the end of this room, you'll know several concrete, repeatable techniques for surfacing risks systematically — not just waiting for them to announce themselves.

---

## Why Risk Identification Is the Foundation of Everything Else

Think of the risk management process as a pipeline:

**Identify → Assess → Treat → Monitor**

Every later stage depends entirely on the first one. If a risk is never identified:
- It can't be assessed (you can't score the likelihood or impact of something you don't know exists)
- It can't be treated (you can't decide to accept, reduce, transfer, or avoid something invisible)
- It can't be monitored (nobody's watching for a risk that was never written down)

> **In plain terms:** A brilliant risk assessment process applied to an incomplete list of risks still produces a dangerously incomplete picture. Identification isn't the "easy first step" to rush through — it's the step that determines how much everything after it is actually worth.

---

## Risk vs. Issue vs. Incident — Getting the Vocabulary Right

Before you can identify risks well, you need to be precise about what you're actually looking for. These three terms get mixed up constantly, and mixing them up leads to messy risk registers.

| Term | Definition | Example |
|---|---|---|
| **Risk** | Something that **might** happen in the future, with uncertain likelihood, that could affect objectives | "Our main cloud provider might suffer a prolonged outage" |
| **Issue** | Something that **is currently** happening or already true — a known problem, not an uncertain future event | "Our cloud provider's uptime has dropped below our contracted SLA for the past two months" |
| **Incident** | Something that **already happened** — a specific event, often used to describe security or operational events | "Our cloud provider had a 6-hour outage last Tuesday that took our platform down" |

> **In plain terms:** A risk lives in the future and is uncertain. An issue lives in the present and is already true. An incident lives in the past and already happened. If you catch yourself writing "risk: our system went down last week," stop — that's an incident, and it should probably prompt you to write a *new*, forward-looking risk statement about it happening again.

---

## Categories of Risk

Risks don't all look alike, and a good identification process deliberately looks across multiple categories rather than only the one your team happens to be most familiar with (security teams tend to only look for cyber risk, finance teams tend to only look for financial risk, and so on).

| Category | What It Covers | Example |
|---|---|---|
| **Strategic** | Risks to achieving the organization's overall direction and objectives | Entering a new market that competitors dominate |
| **Operational** | Risks from day-to-day processes, people, or systems failing | A key manual process breaks when the one person who understands it leaves |
| **Financial** | Risks affecting revenue, cost, liquidity, or financial reporting accuracy | Currency exchange rate swings affecting an international contract |
| **Compliance / Legal** | Risks of violating laws, regulations, or contractual obligations | Failing to meet a new data privacy law's requirements in time |
| **Reputational** | Risks that damage public trust or brand perception, even without direct financial loss | A viral social media complaint about customer treatment |
| **Technology / Cyber** | Risks from IT systems, infrastructure, or cyber threats | A phishing attack leading to unauthorized system access |
| **Third-Party / Vendor** | Risks introduced by external parties an organization depends on | A critical vendor going out of business unexpectedly |

> **In plain terms:** If your risk register only contains cyber risks, that's not because your organization only has cyber risks — it's usually because only the security team was in the room when the register was built. Good identification deliberately pulls in different categories, and often different people, on purpose.

---

## Risk Identification Techniques

No single technique catches everything — just like the ship's lookout uses their eyes *and* a spyglass *and* reports from the crew. Here are the core techniques used in practice, each useful for slightly different situations.

### 1. Brainstorming Workshops
Bringing together a cross-functional group — not just risk specialists — to generate risks in a structured session. Works well because people in different roles notice completely different things. A finance person might spot a risk an engineer would never think to mention, and vice versa.

### 2. Risk Checklists and Taxonomies
Using a pre-built list of common risk categories (like the table above) as a prompt, asking "does any of this apply to us?" rather than starting from a completely blank page. Efficient, but has a weakness: it can only surface risks someone already thought to put on the checklist — it won't catch something genuinely new.

### 3. Stakeholder Interviews
One-on-one conversations with people close to a specific process or area. People are often more candid in a private interview than in a group workshop, especially about risks connected to their own team's mistakes or blind spots.

### 4. Historical Incident and Loss Data Review
Looking at past incidents, near-misses, audit findings, and losses to identify patterns. If a similar problem happened twice already, that's a strong signal it deserves to be a formally tracked risk, not just something everyone quietly remembers.

### 5. SWOT Analysis
A structured look at **S**trengths, **W**eaknesses, **O**pportunities, and **T**hreats — commonly used at a strategic level. The "Weaknesses" and "Threats" quadrants are directly useful for risk identification, since they explicitly prompt "what could hurt us?"

### 6. Scenario Analysis
Imagining specific, plausible future scenarios ("what if our top three engineers left within the same month?") and working backward to identify what risks that scenario would expose. Especially useful for surfacing risks that don't show up in historical data because they haven't happened yet.

### 7. Process Walkthroughs
Physically or procedurally walking through a business process step by step with the people who perform it, asking "what could go wrong at this specific step?" at each stage. Particularly effective for operational risk, because it surfaces risks embedded in the details of daily work that would never come up in a general brainstorming session.

### 8. External Sources
Industry reports, regulatory alerts, threat intelligence feeds, and news about incidents at similar organizations. A risk that just caused a major incident at a competitor is a strong hint that the same risk may apply to you too, even if it hasn't happened internally yet.

> **In plain terms:** Use at least two or three of these techniques together, not just one. A brainstorming workshop combined with a review of last year's incidents will almost always surface a noticeably different — and more complete — list than either technique used alone.

---

## Writing a Good Risk Statement

Identifying a risk isn't complete until it's written down clearly enough that someone else — someone who wasn't in the room — can understand exactly what's being described. A common, effective structure is the **Cause → Risk Event → Effect** format:

> **Because of [cause], [risk event] could happen, resulting in [effect].**

### Weak vs. Strong Risk Statements

| Weak (vague) | Strong (specific, uses Cause → Event → Effect) |
|---|---|
| "Cybersecurity risk" | "Because our customer support team has broad, unreviewed access to the customer database, an account compromise could lead to a large-scale data breach and regulatory penalties." |
| "Vendor risk" | "Because our payment processor has no disclosed business continuity plan, an outage on their end could halt our ability to process transactions for an unknown duration." |
| "People risk" | "Because only one engineer understands our legacy billing system, that engineer's departure could cause billing errors that take months to fully diagnose and fix." |

> **In plain terms:** "Cybersecurity risk" isn't a risk statement — it's a *topic*. A real risk statement names a specific cause, a specific event that could occur, and a specific effect if it does. If you can't fill in all three parts, you probably haven't finished identifying the risk yet — you've only identified the general area it lives in.

---

## Top-Down vs. Bottom-Up Identification

Mature risk identification processes deliberately combine two directions:

| Approach | How It Works | Strength | Weakness |
|---|---|---|---|
| **Top-down** | Senior leadership and the Governing Body identify major strategic risks based on the big picture (new markets, major initiatives, economic conditions) | Captures large, strategic risks that only leadership has visibility into | Often misses operational, day-to-day risks that leadership simply doesn't see |
| **Bottom-up** | Frontline staff and business units identify risks specific to their daily work | Captures granular, operational risks with real detail | Can miss the bigger strategic picture, and risks may not get escalated if there's no clear channel upward |

> **In plain terms:** Leadership sees the horizon; frontline staff see the ground right in front of them. Neither view alone is complete — a strong risk identification process deliberately collects both and reconciles them, rather than relying only on the view from the top of the ship, or only the view from the deck.

---

## Common Mistakes

- **Confusing an issue or incident with a risk.** Writing "risk: the server crashed last week" describes something that already happened — the *risk* is that it could happen again, and that distinction changes how it should be tracked and treated.
- **Writing vague, topic-level risk statements.** "Cybersecurity risk" or "vendor risk" on their own aren't specific enough to assess or act on — they need a cause, an event, and an effect, as shown above.
- **Relying on only one identification technique.** A brainstorming workshop alone will always miss things a process walkthrough or historical data review would have caught, and vice versa.
- **Only capturing risks from one category.** A register built entirely by the security team will be full of cyber risks and largely blind to financial, reputational, or third-party risk.
- **Treating identification as a one-time event.** Risks change as the organization changes — a risk identification exercise done once at program launch and never repeated will drift out of date within months.

---

## Case Study: The Risk Everyone Saw But No One Wrote Down

**Background:** A mid-sized healthcare company experienced a serious outage when a single legacy server, running critical patient scheduling software, failed with no backup system in place.

**What the post-incident review found:**
- Multiple IT staff later admitted, in interviews, that they had "always known" the server was old and risky, and had informally joked about it failing someday.
- No one had ever formally written this down as a tracked risk. It existed only as informal knowledge, shared verbally among a small group of engineers.
- Because it was never written down, it was never assessed, never prioritized for budget, and never escalated to anyone with the authority to approve replacing the hardware.

**Root cause (in risk identification terms):** The organization had *informal awareness* of the risk but no *formal identification process* that would have captured it. The knowledge existed only in individual people's heads — which is not the same as it existing in a risk register that leadership can see and act on.

**Remediation:**
1. Introduced quarterly process walkthroughs with IT staff specifically designed to surface exactly this kind of "everyone kind of knows about it" risk
2. Added a simple, low-friction channel for any employee to submit a potential risk for review, without needing to go through a formal workshop
3. Required that any risk mentioned informally more than once in meeting notes or incident reviews be formally logged and assessed, rather than staying as an unwritten shared assumption

**Lesson:** A risk that "everyone knows about" informally is not the same as a risk that has been identified. If it isn't written down somewhere the organization can act on, it doesn't functionally exist yet — no matter how many people are aware of it.

---

## Key Terminology

| Term | Definition |
|---|---|
| **Risk** | An uncertain future event that could affect the achievement of objectives, if it occurs |
| **Issue** | A current, already-existing problem, as opposed to an uncertain future event |
| **Incident** | A specific event that has already occurred |
| **Risk Identification** | The systematic process of finding and documenting potential risks |
| **Risk Statement** | A clear, specific description of a risk, ideally following a Cause → Risk Event → Effect structure |
| **Risk Taxonomy** | A structured categorization of risk types (e.g., strategic, operational, financial) used to guide identification |
| **Near-Miss** | An event that almost caused harm but didn't, often a strong early warning sign of an underlying risk |
| **Top-Down Identification** | Risk identification driven by senior leadership's strategic view |
| **Bottom-Up Identification** | Risk identification driven by frontline staff's operational view |
| **Scenario Analysis** | A technique of imagining specific plausible future situations to surface risks that haven't yet occurred |

---

## Summary

- **Risk identification is the foundation of the entire risk management pipeline** — a risk that's never identified can never be assessed, treated, or monitored.
- It's essential to distinguish a **risk** (uncertain future event), an **issue** (current known problem), and an **incident** (something that already happened) — mixing these up creates a messy, unreliable risk register.
- Risks fall into multiple **categories** — strategic, operational, financial, compliance/legal, reputational, technology/cyber, and third-party — and a good process deliberately looks across all of them, not just the category your team knows best.
- No single **identification technique** catches everything; combining brainstorming, interviews, historical data review, scenario analysis, process walkthroughs, and external sources produces a far more complete picture.
- A strong **risk statement** follows a Cause → Risk Event → Effect structure, and a vague topic like "cybersecurity risk" is not yet a usable risk statement.
- Combining **top-down** (leadership's strategic view) and **bottom-up** (frontline operational view) identification captures a more complete picture than either alone.
- Informal awareness of a risk — "everyone kind of knows about it" — is not the same as formal identification. If it isn't written down and visible to the people who can act on it, it doesn't functionally exist as a managed risk yet.

---

## Self-Check: Can You Explain It?

Without looking back at the text, try turning this vague statement into a strong risk statement using the Cause → Risk Event → Effect structure: *"We have a risk around remote work."* If you can produce something specific — naming an actual cause, a specific event, and a concrete effect — you've understood the core practical skill of this room.

---

## Review Questions

1. Using the ship's lookout analogy, explain why relying on just one risk identification technique is risky in itself.
2. Explain the difference between a risk, an issue, and an incident, and give one original example of each.
3. Why does risk identification need to pull from more than one risk category, rather than just the category your own team is most familiar with?
4. Rewrite the vague statement "we have a supply chain risk" into a strong risk statement using the Cause → Risk Event → Effect structure.
5. What is the key strength of a top-down identification approach, and what is its key weakness?
6. What is the key strength of a bottom-up identification approach, and what is its key weakness?
7. In the case study, why wasn't the failing server ever formally treated as a risk, even though multiple people were aware of it?
8. Explain why "cybersecurity risk" on its own is not considered a complete risk statement.
9. Name three different risk identification techniques and briefly describe a situation where each one would be especially useful.
10. Why is risk identification described as an ongoing process rather than a one-time event?

---

*This document is Room 1 of Module 2 in the GRC Fundamentals learning path. It builds on Module 1's foundational concepts and is a prerequisite for Room 2 (Risk Assessment), where the risks identified here are scored for likelihood and impact.*
