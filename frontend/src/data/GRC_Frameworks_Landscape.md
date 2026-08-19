# The GRC Frameworks Landscape
### Module 1 — Room 3: COSO, ISO, COBIT, and Friends — Which Framework Does What

---

## Table of Contents
1. [Before You Start: A Simple Analogy](#before-you-start-a-simple-analogy)
2. [Introduction](#introduction)
3. [Why So Many Frameworks Exist](#why-so-many-frameworks-exist)
4. [Two Categories of Frameworks](#two-categories-of-frameworks)
5. [Foundational Frameworks — The Broad Maps](#foundational-frameworks--the-broad-maps)
   - [COSO ERM](#coso-erm)
   - [COSO Internal Control — Integrated Framework](#coso-internal-control--integrated-framework)
   - [COBIT](#cobit)
   - [ISO 31000](#iso-31000)
6. [Domain-Specific Frameworks — The Detailed Maps](#domain-specific-frameworks--the-detailed-maps)
   - [ISO 27001](#iso-27001)
   - [NIST Cybersecurity Framework (CSF)](#nist-cybersecurity-framework-csf)
   - [ISO 22301](#iso-22301)
   - [SOC 2](#soc-2)
7. [Regulations Are Not Frameworks — But They Overlap](#regulations-are-not-frameworks--but-they-overlap)
   - [GDPR](#gdpr)
   - [PCI DSS](#pci-dss)
8. [Certifiable vs. Non-Certifiable — A Crucial Distinction](#certifiable-vs-non-certifiable--a-crucial-distinction)
9. [Quick Comparison Table](#quick-comparison-table)
10. [How Frameworks Overlap — The Idea of "Crosswalking"](#how-frameworks-overlap--the-idea-of-crosswalking)
11. [Choosing the Right Framework(s) for Your Organization](#choosing-the-right-frameworks-for-your-organization)
12. [Common Mistakes](#common-mistakes)
13. [Case Study: The Framework Nobody Needed](#case-study-the-framework-nobody-needed)
14. [Key Terminology](#key-terminology)
15. [Summary](#summary)
16. [Self-Check: Can You Explain It?](#self-check-can-you-explain-it)
17. [Review Questions](#review-questions)

---

## Before You Start: A Simple Analogy

Imagine you need to get across a large, unfamiliar city. You could use several different maps:

- A **subway map** — great for understanding how transit lines connect, but useless for finding a specific street address.
- A **road map** — great for driving, but doesn't show you which subway line to take.
- A **topographic map** — shows elevation and terrain, useful for hiking, but you'd never use it to find a coffee shop.
- A **tourist map** — highlights landmarks and points of interest, but leaves out most residential streets entirely.

None of these maps is "wrong." None of them is "the one true map of the city." Each one was designed for a **specific purpose**, and a smart traveler picks the map — or combination of maps — that matches what they're actually trying to do.

**GRC frameworks work exactly the same way.** COSO, ISO 31000, COBIT, ISO 27001, NIST CSF — none of them is "the correct framework" in some universal sense. Each was built to help with a specific kind of journey:

| Map analogy | GRC framework | What journey it helps with |
|---|---|---|
| Subway map (broad system overview) | **COSO ERM** | Enterprise-wide risk management tied to strategy |
| Road map (getting from A to B reliably) | **COSO Internal Control** | Making sure financial reporting is accurate and controlled |
| Topographic map (technical detail layer) | **COBIT** | Governing and managing IT specifically |
| General "how to read any map" guide | **ISO 31000** | General risk management principles, applicable anywhere |
| Detailed security blueprint | **ISO 27001** | Building and certifying an information security program |

Keep this analogy in mind. The rest of this room is really just describing, one at a time, what each "map" is good for — and, just as importantly, what it's *not* good for.

---

## Introduction

In Room 1, you learned that GRC is built on three pillars, and in Room 2, you learned *who* is accountable for managing them. This room answers a different, very practical question that trips up almost everyone new to GRC: **"There are so many frameworks — COSO, ISO, COBIT, NIST — which one am I actually supposed to use?"**

The honest answer is: **usually more than one, and rarely all of them.** Different frameworks solve different problems, and mature organizations typically combine two or three that fit their specific needs — they don't pick a single "winner" and ignore the rest.

By the end of this room, you'll be able to look at an unfamiliar framework name and quickly answer three questions: *What problem is this trying to solve? Is it certifiable? Does my organization actually need it?*

---

## Why So Many Frameworks Exist

It can feel overwhelming to see a dozen framework names thrown around as if they're interchangeable. They're not — and understanding *why* they multiplied helps make sense of the landscape.

- **Different origins, different problems.** COSO was created in the United States specifically in response to fraudulent financial reporting, so it's deeply tied to *financial* controls. ISO frameworks came out of international standards bodies trying to create globally consistent, industry-neutral guidance. COBIT was built specifically for IT governance, because IT risk didn't fit neatly into the older financial-control frameworks.
- **Different audiences.** A framework built for auditors checking financial statements (COSO Internal Control) looks very different from a framework built for security engineers hardening a network (NIST CSF), even though both are technically about "risk and control."
- **Different levels of detail.** Some frameworks (ISO 31000) intentionally stay abstract and principle-based so they can apply to *any* organization, in *any* industry, for *any* kind of risk. Others (ISO 27001, PCI DSS) are deliberately specific and prescriptive, because they're solving one narrow, well-defined problem.
- **Certification business models.** Some frameworks were designed to be formally audited and certified against (ISO 27001, SOC 2), which creates a market incentive — customers and partners ask "are you certified?" as a trust signal, which drives adoption.

> **In plain terms:** The frameworks landscape looks messy because it grew organically, from different countries, industries, and time periods, each solving a real problem that existed *at that time*. Nobody sat down and designed one unified system — and that's exactly why you need to understand the landscape rather than memorize one framework and assume it covers everything.

---

## Two Categories of Frameworks

Before diving into specifics, it helps enormously to sort frameworks into two broad buckets:

| Category | Purpose | Examples |
|---|---|---|
| **Foundational (broad) frameworks** | General principles for managing risk, control, or governance — applicable across almost any function or industry | COSO ERM, COSO Internal Control, COBIT, ISO 31000 |
| **Domain-specific frameworks** | Detailed, often certifiable standards for a specific area, like information security or business continuity | ISO 27001, NIST CSF, ISO 22301, SOC 2 |

Foundational frameworks are like the "general how-to-read-a-map" guide — they explain principles you can apply anywhere. Domain-specific frameworks are like a detailed blueprint for one particular type of building. Most mature organizations use **one foundational framework to set overall structure**, plus **one or more domain-specific frameworks** for their particular technical needs.

---

## Foundational Frameworks — The Broad Maps

### COSO ERM

**Full name:** Committee of Sponsoring Organizations — Enterprise Risk Management

**What it's for:** COSO ERM helps an organization manage risk **as part of setting and executing strategy** — not as a separate, bolted-on activity. It asks: as we decide where to take this company, what could threaten that direction, and how do we build risk-awareness directly into how we make decisions?

**Where it came from:** COSO itself was formed in the 1980s in the U.S. in response to fraudulent financial reporting, and its ERM framework became especially important after major corporate scandals highlighted the cost of managing risk as an afterthought.

**Who typically uses it:** Large enterprises building an enterprise-wide risk management program, especially publicly traded companies with formal board risk oversight.

**In one sentence:** *"How do we make sure risk thinking is baked into our strategy, not handled separately from it?"*

---

### COSO Internal Control — Integrated Framework

**What it's for:** This is a *different* COSO framework from ERM above — don't confuse them. This one focuses specifically on **internal controls over financial reporting**: making sure the numbers a company reports are accurate, complete, and free from fraud or material error.

**Where it came from:** This is the framework most closely tied to the **Sarbanes-Oxley Act (SOX)**, which you learned about in Room 1. When a US public company says it is "SOX compliant," it is almost always using the COSO Internal Control framework as the backbone of that compliance.

**Who typically uses it:** Publicly traded companies (especially in the US) and any organization that needs to demonstrate strong financial reporting controls to investors or regulators.

**In one sentence:** *"How do we prove our financial numbers can be trusted?"*

> **In plain terms:** If you ever hear "COSO" on its own with no other words attached, ask which one is meant — ERM (strategy-wide risk) or Internal Control (financial reporting controls). They share a name and a creator, but solve different problems.

---

### COBIT

**Full name:** Control Objectives for Information and Related Technologies

**What it's for:** COBIT is specifically about **governing and managing IT** — making sure technology decisions and IT risk are aligned with overall business goals, not managed in a separate silo by "the IT department" disconnected from company strategy.

**Where it came from:** Developed by ISACA, a professional association for IT governance and audit professionals, because older frameworks like COSO didn't go deep enough into IT-specific concerns.

**Who typically uses it:** Organizations that need structured IT governance — deciding how technology investments are approved, how IT risk is reported to the board, and how IT aligns with business strategy.

**In one sentence:** *"How do we make sure IT decisions serve the business, and IT risk gets proper board-level attention?"*

---

### ISO 31000

**What it's for:** ISO 31000 provides **general risk management principles and guidelines** that can be applied to any type of risk, in any organization, in any industry — financial risk, safety risk, reputational risk, strategic risk, anything.

**Important distinction:** Unlike ISO 27001 (below), **ISO 31000 is not certifiable.** You cannot get "ISO 31000 certified." It's meant to be a set of principles you adopt and adapt, not a checklist you get formally audited against.

**Who typically uses it:** Organizations of any size or industry that want a common, internationally recognized language and process for risk management, without being tied to one specific domain like IT or finance.

**In one sentence:** *"What are the universal principles of doing risk management well, regardless of what kind of risk we're managing?"*

---

## Domain-Specific Frameworks — The Detailed Maps

### ISO 27001

**What it's for:** ISO 27001 is the leading international standard for building and running an **Information Security Management System (ISMS)** — a structured, ongoing program for protecting an organization's information.

**Important distinction:** ISO 27001 **is certifiable.** An accredited external body can audit an organization and issue an ISO 27001 certificate, which the organization can then show to customers and partners as proof of a working security program.

**Who typically uses it:** Technology companies, SaaS providers, and any organization that regularly needs to prove its information security posture to enterprise customers, especially in international markets.

**In one sentence:** *"Can we prove, with an independent certificate, that we run a real information security program — not just a policy document?"*

---

### NIST Cybersecurity Framework (CSF)

**Full name:** National Institute of Standards and Technology Cybersecurity Framework

**What it's for:** NIST CSF organizes cybersecurity activities into functions that are easy to communicate to non-technical stakeholders, historically framed around five core functions: **Identify, Protect, Detect, Respond, Recover.**

**Important distinction:** NIST CSF is **not certifiable** in the way ISO 27001 is. Instead, organizations use it to build a "profile" — a description of their current cybersecurity posture versus where they want to be — and measure progress over time.

**Who typically uses it:** Especially common among US organizations, government contractors, and critical infrastructure sectors, though it's used globally as a practical, plain-language reference.

**In one sentence:** *"In plain, non-technical language, what does 'good cybersecurity' actually look like, and where are our gaps?"*

---

### ISO 22301

**What it's for:** ISO 22301 is the international standard for **Business Continuity Management** — planning for how an organization keeps operating (or recovers quickly) during major disruptions like natural disasters, cyberattacks, or supply chain failures.

**Important distinction:** Like ISO 27001, ISO 22301 **is certifiable.**

**Who typically uses it:** Organizations where downtime is extremely costly or dangerous — financial institutions, healthcare providers, critical infrastructure, and large enterprises with complex global operations.

**In one sentence:** *"If something disastrous happens tomorrow, can we prove we have a real plan to keep operating?"*

---

### SOC 2

**Full name:** System and Organization Controls 2

**What it's for:** SOC 2 is an American Institute of CPAs (AICPA) standard that results in a formal report — not a certificate — describing how well a service organization's controls protect customer data, based on five "Trust Services Criteria": Security, Availability, Processing Integrity, Confidentiality, and Privacy.

**Important distinction:** A SOC 2 outcome is a **report** written by an independent auditor, not a certificate. It comes in two types: a **Type I** report (a snapshot of controls at one point in time) and a **Type II** report (evidence that controls operated effectively over a period, usually 6–12 months) — Type II is significantly more valuable as evidence.

**Who typically uses it:** Almost universally required by US-based SaaS and cloud service companies, because enterprise customers routinely ask vendors for a SOC 2 report before signing a contract.

**In one sentence:** *"Can an independent auditor confirm our controls actually protected customer data over a real period of time, not just on paper?"*

---

## Regulations Are Not Frameworks — But They Overlap

It's worth pausing to make an important distinction. **GDPR and PCI DSS are not "frameworks" in the same sense as ISO 27001 or COSO** — they are, respectively, a **law** and an **industry mandate**. You don't "choose" to adopt them the way you might choose ISO 31000; you comply with them because you're legally or contractually required to. But they're included here because in practice, GRC teams treat them very similarly to frameworks — mapping controls, tracking compliance status, and reporting on them the same way.

### GDPR

**What it is:** A European Union law governing how organizations collect, store, and process personal data — with real financial penalties for non-compliance (as covered in Room 1).

**How it relates to frameworks:** GDPR doesn't tell you exactly *how* to secure your systems technically — it tells you *what outcome* is legally required (e.g., data must be adequately protected, individuals have rights over their data). Organizations often use ISO 27001 or NIST CSF as the technical backbone that helps them actually *achieve* GDPR compliance.

### PCI DSS

**Full name:** Payment Card Industry Data Security Standard

**What it is:** A mandatory security standard created by major payment card brands (Visa, Mastercard, etc.) for any organization that stores, processes, or transmits credit card data.

**How it relates to frameworks:** PCI DSS is very prescriptive and specific — unlike ISO 31000's broad principles, PCI DSS tells you exactly what firewall rules, encryption standards, and access controls are required. It's less a "framework you adapt" and more a "checklist you must pass" if you touch card payment data.

---

## Certifiable vs. Non-Certifiable — A Crucial Distinction

This trips up almost everyone new to GRC, so it deserves its own clear section.

| Certifiable (you can get an official certificate/report) | Not certifiable (principles/guidance you adopt, not certify against) |
|---|---|
| ISO 27001 | ISO 31000 |
| ISO 22301 | COSO ERM |
| SOC 2 (technically a report, not a certificate, but functions similarly as external proof) | COBIT |
| PCI DSS (a mandatory validation, not exactly "certification," but organizations must formally attest compliance) | NIST CSF |

> **In plain terms:** If a framework is certifiable, an accredited outside party formally checks your organization and issues something official you can show to customers. If it's not certifiable, the framework is more like a set of best-practice principles you use internally to shape how you work — valuable, but not something you can frame on the wall.

---

## Quick Comparison Table

| Framework | Type | Certifiable? | Primary Focus | Typical User |
|---|---|---|---|---|
| **COSO ERM** | Foundational | No | Enterprise-wide risk tied to strategy | Large enterprises, public companies |
| **COSO Internal Control** | Foundational | No (basis for SOX audits) | Financial reporting controls | Public companies (esp. US) |
| **COBIT** | Foundational | No | IT governance and management | Organizations with complex IT environments |
| **ISO 31000** | Foundational | No | General risk management principles | Any organization, any industry |
| **ISO 27001** | Domain-specific | Yes | Information security management | Tech/SaaS companies, global vendors |
| **NIST CSF** | Domain-specific | No | Practical cybersecurity posture | US organizations, critical infrastructure |
| **ISO 22301** | Domain-specific | Yes | Business continuity management | Finance, healthcare, critical infrastructure |
| **SOC 2** | Domain-specific | Report, not certificate | Data protection controls at service orgs | US SaaS/cloud companies |
| **GDPR** | Regulation (law) | N/A — legal compliance | Personal data protection | Any org handling EU residents' data |
| **PCI DSS** | Industry mandate | Formal validation | Payment card data security | Any org handling card payments |

---

## How Frameworks Overlap — The Idea of "Crosswalking"

Here's something that surprises most beginners: **frameworks overlap heavily.** A single technical control — say, "encrypt sensitive data at rest" — might satisfy requirements in ISO 27001, SOC 2, NIST CSF, PCI DSS, and GDPR all at once, just described in slightly different language in each one.

This is where the idea of a **crosswalk** (also called a control mapping) becomes essential. A crosswalk is simply a table that shows how one framework's requirements line up against another's, so an organization doesn't have to build five separate, disconnected sets of controls for five frameworks.

**Simplified example of a crosswalk:**

| Control Activity | ISO 27001 Reference | NIST CSF Function | SOC 2 Criteria |
|---|---|---|---|
| Encrypt sensitive data at rest | Annex A.8.24 | Protect (PR.DS) | Security, Confidentiality |
| Formal access review process | Annex A.5.18 | Protect (PR.AC) | Security |
| Incident response plan | Annex A.5.24 | Respond (RS.RP) | Security, Availability |

> **In plain terms:** You almost never need to build separate work for each framework from scratch. Build strong controls once, then map ("crosswalk") them to whichever frameworks you need to demonstrate compliance with. This is one of the biggest efficiency wins in mature GRC programs.

---

## Choosing the Right Framework(s) for Your Organization

There's no universal answer, but here's a practical starting point based on organization type:

| If your organization is... | You'll likely need... |
|---|---|
| A publicly traded company (especially in the US) | COSO Internal Control (for SOX) + COSO ERM or ISO 31000 for broader risk |
| A SaaS or cloud technology company selling to enterprises | SOC 2 (almost always requested by customers) + ISO 27001 (especially for international customers) |
| Handling EU residents' personal data | GDPR compliance, typically backed by ISO 27001 or NIST CSF for the technical controls |
| Processing credit card payments | PCI DSS — this one is close to non-negotiable if you touch card data |
| A large enterprise with a complex IT estate | COBIT for IT governance, alongside a security framework like ISO 27001 or NIST CSF |
| An organization in critical infrastructure or with high downtime costs | ISO 22301 for business continuity, layered on top of your security framework |
| Just starting to build a GRC program from scratch, no specific external pressure yet | ISO 31000 as a general foundation — it's flexible and doesn't lock you into one domain |

**A practical rule of thumb:** start by asking *"who is asking us to prove compliance, and with what?"* — a regulator, an enterprise customer, an investor, a payment processor. That external pressure almost always points you directly to the right framework(s), far more reliably than trying to pick "the best framework" in the abstract.

---

## Common Mistakes

- **Treating framework selection as "pick one and you're done."** Most mature GRC programs run two or three frameworks simultaneously (e.g., ISO 27001 for security certification, SOC 2 because customers ask for it, and NIST CSF internally as a practical roadmap). Thinking you must choose only one is one of the most common beginner mistakes.
- **Confusing the two COSO frameworks.** As noted above, COSO ERM (strategy-wide risk) and COSO Internal Control (financial reporting) are genuinely different frameworks that happen to share a name. Mixing them up in a conversation with auditors or executives is an easy way to lose credibility fast.
- **Assuming a framework is certifiable when it isn't (or vice versa).** Telling a customer you're "NIST certified" is a factual error that experienced security reviewers will immediately catch — NIST CSF has no certification. Precision here matters more than it might seem.
- **Building separate, duplicated controls for each framework instead of crosswalking.** Without a crosswalk, teams often end up doing the same work five times under five different names, wasting enormous time and creating inconsistent evidence.
- **Adopting a framework because it's "best practice" with no actual driver.** Implementing ISO 22301 because it sounds impressive, when no customer, regulator, or real business risk is asking for it, consumes resources that could go toward a framework your organization actually needs.

---

## Case Study: The Framework Nobody Needed

**Background:** A 40-person B2B software startup decided to pursue full ISO 27001 certification in its first year of operation, based on a blog post claiming it was "essential for any serious tech company."

**What went wrong:**
- The certification process consumed roughly six months of the small security team's time and a significant external audit budget.
- Meanwhile, the startup's actual enterprise customers weren't asking for ISO 27001 at all — they were asking for a **SOC 2 Type II report**, which is the standard most US enterprise buyers expect from SaaS vendors.
- By the time the ISO 27001 certificate was issued, the company had lost two large deals because it couldn't yet produce the SOC 2 report those specific customers required.

**Root cause (in GRC terms):** The company chose a framework based on general reputation rather than by asking "who is actually asking us to prove compliance, and with what?" — the practical rule of thumb from the section above.

**Remediation:**
1. Pursued a SOC 2 Type II report immediately afterward, which took roughly nine additional months (Type II requires observing controls over a real period of time)
2. Built a crosswalk between the already-completed ISO 27001 controls and the SOC 2 Trust Services Criteria, reusing roughly 70% of the existing work instead of starting over
3. Going forward, adopted the practice of confirming which framework a prospective customer's security team actually required *before* starting any new certification effort

**Lesson:** A framework's reputation is not the same as your organization's actual requirement. The right question is never "which framework is the best?" — it's "which framework does the specific person asking us to prove compliance actually require?"

---

## Key Terminology

| Term | Definition |
|---|---|
| **Framework** | A structured set of principles, processes, or controls for managing governance, risk, or compliance |
| **Certification** | A formal, independent confirmation (usually with a certificate) that an organization meets a specific standard's requirements |
| **SOC 2 Report** | An independent auditor's report on a service organization's controls, not a certificate; comes in Type I (point-in-time) and Type II (over a period) |
| **Crosswalk / Control Mapping** | A table showing how one framework's requirements correspond to another framework's requirements |
| **ISMS (Information Security Management System)** | The structured, ongoing security program required by ISO 27001 |
| **Trust Services Criteria** | The five categories (Security, Availability, Processing Integrity, Confidentiality, Privacy) evaluated in a SOC 2 report |
| **Regulation** | A legally binding requirement (like GDPR) that an organization must comply with, as opposed to a voluntary framework |
| **Industry Mandate** | A requirement imposed by an industry body (like PCI DSS by payment card brands) rather than a government |
| **Type I vs Type II (SOC 2)** | Type I checks controls at a single point in time; Type II checks whether controls operated effectively over a period, usually 6–12 months |

---

## Summary

- There is no single "correct" GRC framework — different frameworks were built to solve different problems, for different audiences, at different times.
- **Foundational frameworks** (COSO ERM, COSO Internal Control, COBIT, ISO 31000) provide broad principles applicable across many situations; **domain-specific frameworks** (ISO 27001, NIST CSF, ISO 22301, SOC 2) solve one specific, detailed problem.
- **COSO ERM** and **COSO Internal Control** are two different frameworks that share a name — don't confuse enterprise-wide strategic risk management with financial reporting controls.
- Some frameworks are **certifiable** (ISO 27001, ISO 22301) with an official outside audit and certificate; others, like ISO 31000, COSO, COBIT, and NIST CSF, are **not certifiable** — they're adopted as guiding principles instead.
- **GDPR and PCI DSS are not frameworks** — they're a law and an industry mandate, respectively — but GRC teams treat and track them similarly to frameworks in practice.
- Frameworks **overlap heavily**, and a **crosswalk** lets an organization build controls once and map them to multiple frameworks, instead of duplicating work.
- The most practical way to choose a framework is to ask: **"who is actually asking us to prove compliance, and with what?"** — not "which framework has the best reputation?"

---

## Self-Check: Can You Explain It?

Without looking back at the text, try to answer out loud: *"My company is a SaaS startup, and a big enterprise customer's security team just asked us for proof of our security controls. Which framework(s) should I expect them to actually want, and why — not just 'the best one,' but the one that matches this specific situation?"* If you can answer confidently (hint: think about who's asking and what US enterprise buyers typically expect), you've understood the core practical lesson of this room.

---

## Review Questions

1. Using the map analogy, explain why it doesn't make sense to ask "which GRC framework is the best?"
2. What is the difference between COSO ERM and COSO Internal Control? Why is it easy to confuse them?
3. Explain the difference between a certifiable framework and a non-certifiable one, and give one example of each.
4. Why are GDPR and PCI DSS not technically "frameworks," even though GRC teams often treat them similarly to frameworks in practice?
5. What is a "crosswalk," and why does it save an organization significant time and effort?
6. Explain the difference between a SOC 2 Type I and Type II report — which one is generally considered stronger evidence, and why?
7. A payment processing company asks you which framework is mandatory for them if they handle credit card data. What do you tell them?
8. In the case study, what was the actual root cause of the startup's wasted effort — and what practical rule would have prevented it?
9. If an organization has no specific external pressure yet (no customer, regulator, or partner demanding a specific framework), which foundational framework might be a reasonable, flexible starting point, and why?
10. Explain in your own words what COBIT is specifically designed to address that a broader framework like ISO 31000 does not focus on.

---

*This document is Room 3 of Module 1 in the GRC Fundamentals learning path. It builds on the foundational concepts from Room 1 (Introduction to GRC) and Room 2 (GRC Roles and the Three Lines Model), and prepares you for Module 4 (Compliance & Frameworks), where several of these standards — especially ISO 27001, NIST CSF, and SOC 2/PCI DSS/GDPR — are explored in much greater technical depth.*
