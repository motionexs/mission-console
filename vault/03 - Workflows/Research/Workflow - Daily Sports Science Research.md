# Workflow - Daily Sports Science Research

## Purpose
Automated daily research that finds recent sports science papers, extracts key insights, and drafts vault notes for Elfred's review.

## Schedule
- **Frequency:** Daily at 9:00 AM (or after training)
- **Trigger:** Manual via Hermes or automated via cron

## Steps

### 1. Clinical Scout - Find Recent Papers
**Search for:** Recent papers (last 2 years) on topics relevant to:
- High jump performance
- Sprint energy systems
- Strength & conditioning for jumpers
- Recovery and periodization
- Injury prevention in athletics

**Sources:**
- arXiv (sports science, physiology)
- PubMed (clinical studies)
- Google Scholar

**Output:** 3-5 relevant papers with:
- Title, authors, year
- DOI/URL
- 2-3 sentence summary of key findings

### 2. Mechanistic Analyst - Synthesize
**For each paper:**
- Break down into mechanistic components (Force, Energy Systems, Biomechanics)
- Apply GAS/SFRA frameworks if relevant
- Identify Reasoning Delta (connects to coaching principles)
- State one testable prediction
- Assign confidence level (0.1-1.0)

### 3. Draft Note
**Format:** Source Note following vault naming rules
**Location:** `05 - Evidence Library/Source Notes/`
**Content:**
```
# Source - Journal Article - [Title]

## Key Findings
[Mechanistic breakdown]

## Reasoning Delta
[How this connects to Elfred's coaching]

## Predictive Utility
[One testable prediction]

## Confidence
[0.1-1.0 with justification]

## Links
[[Concept - X]]
[[Concept - Y]]
```

### 4. Review & Approve
Present draft to Elfred via Hermes chat. Upon approval, save to vault.

## Topics to Rotate
- Monday: Energy systems & metabolism
- Tuesday: Strength & power development
- Wednesday: Recovery & periodization
- Thursday: Injury prevention & rehab
- Friday: Sprint mechanics & performance
- Saturday: Youth athlete development
- Sunday: Review & synthesis of week's notes
