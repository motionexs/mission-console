# Librarian - Metadata Rules

Every important note should have frontmatter at the top.

Frontmatter helps Obsidian, future dashboards, and future AI specialists understand the note clearly.

---

## Concept Note Metadata

Use this for concept notes:

```yaml
---
type: concept
domain:
topic:
status: raw
confidence: low
created:
updated:
related:
---
```

---

## Source Note Metadata

Use this for research papers, books, lectures, videos, courses, and PDFs:

```yaml
---
type: source
source_type:
author:
year:
title:
domain:
reliability:
status: raw
created:
updated:
related:
---
```

---

## Workflow Note Metadata

Use this for repeatable processes:

```yaml
---
type: workflow
domain:
use_case:
status: prototype
decision_level: coach-support
created:
updated:
related:
---
```

---

## Field Insight Metadata

Use this for real practical lessons from coaching, training, or athlete experience:

```yaml
---
type: field-insight
domain:
sport:
status: raw
confidence: medium
created:
updated:
related_concepts:
related_workflows:
---
```

---

## Athlete Note Metadata

Use this for athlete profiles:

```yaml
---
type: athlete-profile
sport:
level:
status: active
created:
updated:
goals:
risk_flags:
related:
---
```

---

## Status Options

Use only these status options:

- raw
- developing
- reviewed
- final
- outdated

---

## Confidence Options

Use only these confidence options:

- low
- medium
- high

---

## Rule

If I am unsure about a note, mark it as:

status: raw  
confidence: low

Do not pretend uncertain information is final.