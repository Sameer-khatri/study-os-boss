# CGPA.md — Product Requirements Document
## Feature: CGPA Intelligence Engine
### For: Study OS — BOSS
### Page: `/cgpa` (Standalone page, new nav item)

---

## 1. OVERVIEW & VISION

Build a **CGPA Intelligence Engine** as a dedicated page inside Study OS BOSS. This is NOT a dumb calculator. It is a **first-principles prioritization system** that:

- Takes subjects + credits as input
- Breaks down CGPA mathematically across every subject
- Applies the **Pareto Principle (80/20 rule)** to identify which subjects deserve 80% of the student's energy
- Shows the exact **marks distribution** (External 60 + MST1 15 + MST2 15 + Internal 10 = 100)
- Tells the student **exactly where to focus** to maximize CGPA with minimum effort

**Design mandate:** Match the existing Study OS BOSS aesthetic — dark-leaning, clean card UI, blue accent (`#3B6FE8`), white on dark surfaces, minimal borders, the same font and spacing system already in `index.html`.

---

## 2. MARKS SYSTEM (CRITICAL — HARDCODE THIS LOGIC)

Every subject in this university system follows this fixed marks distribution:

```
Total Subject Marks = 100

External Exam:   100 raw → scaled to 60   (weight: 60%)
MST 1:            30 raw → scaled to 15   (weight: 15%)
MST 2:            30 raw → scaled to 15   (weight: 15%)
Internal:         assignments + class tests (weight: 10%)

FORMULA: Subject Score = (ext/100)*60 + (mst1/30)*15 + (mst2/30)*15 + internal_score
```

**CGPA Formula:**
```
CGPA = Σ (subject_grade_point × subject_credits) / Σ (all_credits)
```

**Grade Point Mapping (standard 10-point scale):**
```
90-100  → S  → 10
80-89   → A+ → 9
70-79   → A  → 8
60-69   → B+ → 7
50-59   → B  → 6
45-49   → C  → 5
40-44   → P  → 4
< 40    → F  → 0
```

---

## 3. USER FLOW

### Step 1 — Subject Input Screen
User lands on `/cgpa`. They see an input interface to add their subjects.

**Input fields per subject row:**
- Subject Name (text input)
- Subject Code (short text, e.g. TOC, ADA)
- Credits (dropdown: 1, 2, 3, 4)
- Subject Type (toggle: Theory / Lab)
- [Optional] MST1 marks obtained (out of 30)
- [Optional] MST2 marks obtained (out of 30)
- [Optional] Internal marks obtained (out of 10)
- [Optional] Expected/target external marks (out of 100)

**Pre-fill button:** "Use My Current Semester" — auto-populates with:
```
TOC           | 4 credits | Theory
Discrete Str. | 4 credits | Theory
ADA           | 3 credits | Theory
DBS           | 3 credits | Theory
OS            | 3 credits | Theory
TWIS          | 2 credits | Theory
OS Lab        | 1 credit  | Lab
ADA Lab       | 1 credit  | Lab
DBS Lab       | 1 credit  | Lab
SPSS Lab      | 1 credit  | Lab
```

User can add/remove rows dynamically. Minimum 1 subject, maximum 12.

**CTA button:** `→ Analyze My CGPA`

---

### Step 2 — CGPA Intelligence Dashboard (Main Output)

After clicking Analyze, the page transitions to the results dashboard. This is the core of the feature. It has the following sections:

---

#### SECTION A — Credit Weight Map (Top of page, hero section)

A **horizontal bar chart** or **proportional block diagram** showing:

```
Total Credits = 23 (example)

TOC          ████████████  4 credits = 17.4% of CGPA
DS           ████████████  4 credits = 17.4% of CGPA
ADA          █████████     3 credits = 13.0% of CGPA
DBS          █████████     3 credits = 13.0% of CGPA
OS           █████████     3 credits = 13.0% of CGPA
TWIS         ██████        2 credits = 8.7%  of CGPA
OS Lab       ███           1 credit  = 4.3%  of CGPA
ADA Lab      ███           1 credit  = 4.3%  of CGPA
DBS Lab      ███           1 credit  = 4.3%  of CGPA
SPSS Lab     ███           1 credit  = 4.3%  of CGPA
```

Each bar is color-coded by impact tier:
- 🔴 **Critical** (≥ 15% CGPA weight) — red/coral accent
- 🟠 **High** (10–14.9%) — orange/amber accent
- 🟡 **Medium** (5–9.9%) — yellow accent
- ⚪ **Low** (< 5%) — gray/muted

**Headline stat card above the chart:**
```
┌─────────────────────────────────────────┐
│  TOC + DS alone control 34.8% of your  │
│  entire CGPA this semester.             │
└─────────────────────────────────────────┘
```

---

#### SECTION B — Pareto Analysis (The 80/20 Engine)

**This is the most important section.**

Using the Pareto Principle, calculate which subjects contribute to 80% of CGPA weight.

**Algorithm:**
1. Sort subjects by credit weight descending
2. Accumulate % until you hit 80%
3. Those subjects = "The Vital Few"
4. Everything else = "The Trivial Many"

**Display:**

```
┌──────────────────────────────────────────────────────┐
│  THE 80/20 RULE APPLIED TO YOUR CGPA                 │
│                                                      │
│  VITAL FEW (spend 80% of your time here)             │
│  ─────────────────────────────────────               │
│  TOC          4 cr   17.4%  ████████████████         │
│  DS           4 cr   17.4%  ████████████████         │
│  ADA          3 cr   13.0%  ████████████             │
│  DBS          3 cr   13.0%  ████████████             │
│  OS           3 cr   13.0%  ████████████             │
│                             ──────────────           │
│  TOTAL:                     73.9% of CGPA            │
│                                                      │
│  TRIVIAL MANY (spend 20% of your time here)          │
│  ─────────────────────────────────────               │
│  TWIS + 4 Labs              26.1% of CGPA            │
└──────────────────────────────────────────────────────┘
```

**Important note displayed below:** "Labs are usually scored high by default (85–90%). Don't over-invest here. Secure them quickly and move on."

---

#### SECTION C — Subject-Level Marks Breakdown

For each subject, show a **collapsible card** with this breakdown:

```
┌─────────────────────────────────────────────────────┐
│  TOC — Theory of Computation           [4 credits]  │
│  CGPA Weight: 17.4% (CRITICAL)                      │
│  ─────────────────────────────────────              │
│  Component      Raw    Scaled   Your Score          │
│  External       /100   → /60    [  ? / 60  ]        │
│  MST 1          /30    → /15    [ 22 / 15* ]        │
│  MST 2          /30    → /15    [  ? / 15  ]        │
│  Internal       /10    → /10    [  ? / 10  ]        │
│  ─────────────────────────────────────              │
│  Projected Total:  ?/100                            │
│  Projected Grade:  ?                                │
│  Projected Grade Point: ?                           │
│                                                     │
│  ⚡ To score O (90+): Need 65+ in External          │
│  ⚡ To score A+ (80+): Need 54+ in External         │
└─────────────────────────────────────────────────────┘

* Scaled: (22/30) × 15 = 11
```

If MST scores are entered, auto-calculate what external marks are needed to hit each grade threshold. This is the **"What do I need to score?"** engine.

---

#### SECTION D — CGPA Simulator

An **interactive live calculator**.

Show a table where user can drag sliders or type expected marks for each subject's external exam. The CGPA updates live in a large display at the top.

```
┌────────────────────────────────────────┐
│  PROJECTED CGPA                        │
│                                        │
│           8.42 / 10                    │
│                                        │
│  Grade: A  |  Scenario: Realistic      │
└────────────────────────────────────────┘

Subject    External (/100)   Proj. Score   Proj. Grade
TOC        [====75====]      82.5          A+ (9)
DS         [====70====]      79.0          A  (8)
ADA        [====80====]      85.0          A+ (9)
...
```

Three preset scenario buttons:
- **Pessimistic** — sets all external sliders to 55
- **Realistic** — sets all external sliders to 70
- **Target: 9+ CGPA** — calculates and sets minimum external scores needed for 9+ CGPA and applies them

---

#### SECTION E — Action Priority List

At the bottom, generate a ranked action plan:

```
YOUR PERSONALIZED CGPA ACTION PLAN
────────────────────────────────────

RANK 1 — TOC (4 credits, 17.4% weight)
  External worth: 60 marks → scales to 60% of subject
  Every 10 marks in External = +0.6 subject score
  Focus: [high priority topics from Study OS if linked]

RANK 2 — DS (4 credits, 17.4% weight)
  ...

[Continue for all subjects in descending credit order]

QUICK WINS (do these fast, they're mostly free marks):
  - OS Lab, ADA Lab, DBS Lab, SPSS Lab
  Labs are attendance + submission based. 85%+ is default.
  Don't spend more than 20% of your time here.
```

---

## 4. UI/UX SPECIFICATIONS

### Design Language (match BOSS exactly)

```css
/* Base colors — match index.html */
--bg-primary:     #0f1117   /* main background */
--bg-card:        #1a1d27   /* card background */
--bg-elevated:    #20243a   /* elevated card */
--accent-blue:    #3B6FE8   /* primary CTA, active state */
--accent-blue-light: #5b8df0
--text-primary:   #ffffff
--text-secondary: #8b8fa8
--text-muted:     #4a4d5e
--border:         #2a2d3e
--success:        #22c55e
--warning:        #f59e0b
--danger:         #ef4444

/* Typography — same as BOSS */
font-family: 'Inter', -apple-system, sans-serif;
```

### Nav Integration

Add a new nav item in the sidebar of `index.html`:

```html
<li class="nav-item" data-page="cgpa">
  <span class="nav-icon">📊</span>
  CGPA Engine
</li>
```

Or use an icon that matches the existing nav icon style (lightning bolt = Study Room, book = Subjects, etc.)

### Page Header (match BOSS greeting style)

```
Good morning, let's get to work.         [Saturday, Apr 18]

CGPA Intelligence Engine
─────────────────────────
Sem 4, Year 2
```

### Card Style

All cards use:
```css
background: var(--bg-card);
border: 1px solid var(--border);
border-radius: 12px;
padding: 20px 24px;
```

Critical tier highlight:
```css
border-left: 3px solid var(--danger);
```

High tier:
```css
border-left: 3px solid var(--warning);
```

### Buttons

Primary CTA (matches Quick Start button in BOSS):
```css
background: #3B6FE8;
color: white;
border-radius: 8px;
padding: 10px 20px;
font-weight: 600;
```

---

## 5. DATA STRUCTURE

### Subject Object
```javascript
{
  id: "toc",
  name: "Theory of Computation",
  code: "TOC",
  credits: 4,
  type: "theory",           // "theory" | "lab"
  marks: {
    mst1_raw: 22,           // out of 30, null if not entered
    mst2_raw: null,         // out of 30
    internal: null,         // out of 10
    external_target: 75,    // out of 100 (simulator)
  },
  computed: {
    mst1_scaled: 11,        // (mst1_raw/30)*15
    mst2_scaled: null,
    external_scaled: null,  // (external_target/100)*60
    total: null,            // sum of all scaled
    grade: null,
    grade_point: null,
    cgpa_weight_pct: 17.39, // (credits/total_credits)*100
    pareto_tier: "vital"    // "vital" | "trivial"
  }
}
```

### Semester Object
```javascript
{
  name: "Sem 4, Year 2",
  total_credits: 23,
  subjects: [ ...subjectObjects ],
  cgpa: {
    projected: 8.42,
    scenario: "realistic"
  },
  pareto: {
    vital_subjects: ["toc", "ds", "ada", "dbs", "os"],
    vital_credit_pct: 73.9,
    trivial_subjects: ["twis", "os_lab", "ada_lab", "dbs_lab", "spss_lab"]
  }
}
```

---

## 6. FILE STRUCTURE

```
/cgpa.html              ← New standalone page
/js/cgpa.js             ← All logic: calculations, Pareto engine, simulator
/css/cgpa.css           ← Additional styles (import base BOSS styles)
/data/cgpa_data.js      ← Saved semester + subject data (localStorage key: boss_cgpa)
```

Or if BOSS uses a single-file architecture (`index.html`), add the CGPA page as a new screen section inside index.html and route to it via the existing nav system (`data-page="cgpa"`).

---

## 7. CALCULATION ENGINE (cgpa.js)

### Core functions the agent must implement:

```javascript
// 1. Scale marks to subject total
function computeSubjectScore(mst1_raw, mst2_raw, internal, external_raw) {
  const mst1  = mst1_raw  !== null ? (mst1_raw / 30) * 15 : 0;
  const mst2  = mst2_raw  !== null ? (mst2_raw / 30) * 15 : 0;
  const ext   = external_raw !== null ? (external_raw / 100) * 60 : 0;
  const intr  = internal !== null ? internal : 0;
  return mst1 + mst2 + ext + intr;
}

// 2. Map score to grade point
function scoreToGradePoint(score) {
  if (score >= 90) return { grade: "O",  gp: 10 };
  if (score >= 80) return { grade: "A+", gp: 9  };
  if (score >= 70) return { grade: "A",  gp: 8  };
  if (score >= 60) return { grade: "B+", gp: 7  };
  if (score >= 50) return { grade: "B",  gp: 6  };
  if (score >= 45) return { grade: "C",  gp: 5  };
  if (score >= 40) return { grade: "P",  gp: 4  };
  return { grade: "F", gp: 0 };
}

// 3. Compute CGPA
function computeCGPA(subjects) {
  const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
  const weightedSum  = subjects.reduce((s, sub) => {
    return s + (sub.computed.grade_point * sub.credits);
  }, 0);
  return (weightedSum / totalCredits).toFixed(2);
}

// 4. Pareto sort
function computePareto(subjects) {
  const total = subjects.reduce((s, sub) => s + sub.credits, 0);
  const sorted = [...subjects].sort((a, b) => b.credits - a.credits);
  let cumulative = 0;
  return sorted.map(sub => {
    cumulative += (sub.credits / total) * 100;
    return {
      ...sub,
      cgpa_weight_pct: ((sub.credits / total) * 100).toFixed(1),
      pareto_tier: cumulative <= 80 ? "vital" : "trivial"
    };
  });
}

// 5. What external marks are needed to hit a target grade?
function externalNeededForGrade(targetScore, mst1_raw, mst2_raw, internal) {
  const mst1 = mst1_raw !== null ? (mst1_raw / 30) * 15 : 0;
  const mst2 = mst2_raw !== null ? (mst2_raw / 30) * 15 : 0;
  const intr = internal !== null ? internal : 0;
  const already = mst1 + mst2 + intr;
  const neededScaled = targetScore - already;
  const neededRaw = (neededScaled / 60) * 100;
  return Math.max(0, Math.min(100, Math.ceil(neededRaw)));
}
```

---

## 8. PARETO DISPLAY LOGIC

The Pareto section must show a **clear visual split** between Vital Few and Trivial Many.

Use a **two-zone layout**:

```
LEFT ZONE (blue border, 60% width):        RIGHT ZONE (gray, 40% width):
"VITAL FEW"                                "TRIVIAL MANY"
Spend 80% of time here                     Spend 20% of time here
[Subject bars with credit weights]         [Subject bars - muted colors]
Controls ~74% of your CGPA                 Controls ~26% of CGPA
```

Add an insight callout below:
> "The 80/20 rule says: 20% of your subjects drive 80% of your results. In your case, 5 theory subjects = 74% of your CGPA. Nail those. The labs will handle themselves."

---

## 9. SIMULATOR BEHAVIOR

- Sliders range: 0–100 for external, live update on drag
- When user drags a slider, recalculate:
  1. That subject's total score
  2. That subject's grade and grade point
  3. Overall CGPA
  4. Update the big CGPA display with animation (count up/down)
- Color the CGPA display:
  - ≥ 9.0 → green
  - 8.0–8.9 → blue
  - 7.0–7.9 → yellow
  - < 7.0 → red

---

## 10. PERSISTENCE

Save to localStorage under key `boss_cgpa`:
```javascript
localStorage.setItem('boss_cgpa', JSON.stringify(semesterObject));
```

On page load, check for saved data and pre-populate the form. Show a "Last saved: [timestamp]" indicator.

Also sync the subject list with whatever subjects are in the main `subjects.js` data file if accessible — so the user doesn't re-enter subjects they already set up in BOSS.

---

## 11. EDGE CASES

- If no marks entered (all null) → still show credit weight analysis and Pareto, just skip grade projection
- If user has only labs entered → show warning: "Add at least one theory subject for meaningful CGPA analysis"
- Credits of 0 → reject with inline validation error
- All external sliders at 0 → show "At risk of failing" warning banner in red
- Single subject only → Pareto still works, show "100% of CGPA is this subject" message

---

## 12. WHAT THE AGENT MUST BUILD (CHECKLIST)

- [ ] New page/screen: `/cgpa` or `data-page="cgpa"` section
- [ ] Nav item added in sidebar
- [ ] Subject input form (dynamic rows, add/remove)
- [ ] "Use My Current Semester" prefill button
- [ ] Credit Weight Map — horizontal bar chart, color-coded by tier
- [ ] Pareto Analysis section — vital/trivial split with insight callout
- [ ] Subject cards — collapsible, showing marks breakdown + what-external-needed
- [ ] CGPA Simulator — sliders, live CGPA update, three scenario presets
- [ ] Action Priority List — ranked by credit weight
- [ ] All calculation functions in `cgpa.js`
- [ ] localStorage persistence under `boss_cgpa`
- [ ] Responsive layout matching BOSS design system
- [ ] Grade point color coding throughout

---

## 13. TONE & COPY GUIDELINES

All text in the UI must be **direct and motivating**, matching BOSS's personality:

- Don't say: "This subject has a higher credit value"
- Say: "TOC controls 17% of your CGPA. This is your most important battle."

- Don't say: "Please allocate more time to high credit subjects"
- Say: "Ignore the labs. Win the theory. That's how CGPA is built."

- Don't say: "The Pareto Principle suggests..."
- Say: "80/20 Rule: 5 subjects = 74% of your CGPA. Everything else is noise."

---

*End of CGPA.md — PRD v1.0*
*Built for Study OS — BOSS | Sem 4, Year 2*
