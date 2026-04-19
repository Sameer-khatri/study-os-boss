# DSA_WORKSPACE.md — Product Requirements Document
## Feature: DSA Story Forge
### For: Study OS — BOSS
### Page: `/dsa` (Standalone page, new nav item)
### Version: 1.0

---

## 1. VISION & PHILOSOPHY

Most students treat DSA like a chore — grind 500 problems, memorize solutions, forget in 2 weeks.
**DSA Story Forge kills that pattern.**

Every problem you solve gets turned into a **story** — with a beginning, a conflict, a resolution, and a moral. You don't just store code. You store *how your brain worked*, *where it broke*, and *how it recovered*. Over time, this becomes a **living journal of your thinking evolution** — not a graveyard of solved problems.

**Core Philosophy:**
> A problem is not solved when you write the code.
> A problem is solved when you can *explain why the code works* in plain English,
> connect it to the real world, and solve it again from scratch one week later.

**The 3 transformations this workspace makes:**
1. Boring → Narrative (every problem is a story, not a task)
2. Forgettable → Revisable (structured capture means structured recall)
3. Isolated → Connected (real-world anchors make concepts stick permanently)

---

## 2. THE DSA DECISION TREE (Core Logic — Hardcode This)

This is the mental model the entire workspace is built around.
Every problem entry is classified through this tree:

```
DSA Problem arrives
│
├── PATH 1: Know the concept?
│   │
│   ├── YES — Can you recall how to apply it?
│   │         │
│   │         ├── YES → Full solo solve
│   │         │         Think → Logic → Structure → Code
│   │         │         [Level: WARRIOR 💪]
│   │         │
│   │         └── NO  → Took a hint, then solved
│   │                   [Level: FIGHTER 🟡]
│   │
│   └── NO — Learn the concept first
│             Then re-enter the tree:
│             │
│             ├── Solved after learning → Think → Logic → Code
│             │   [Level: LEARNER 🟠]
│             │
│             ├── Needed a hint after learning → Hint → Logic → Code
│             │   [Level: ASSISTED 🔵]
│             │
│             └── Still stuck → Study solution → Understand → Rebuild yourself
│                 [Level: REBUILDER 🔴]
```

**This tree determines the "Solve Level" badge on every problem card.**

---

## 3. PROBLEM ENTRY STRUCTURE

Every problem stored in DSA Story Forge has exactly these fields:

---

### BLOCK 1 — PROBLEM IDENTITY
```
Problem Title         : [text]
LeetCode URL          : [url — opens directly in new tab]
LeetCode #            : [number e.g. 42]
Difficulty            : [Easy / Medium / Hard] — pulled from LeetCode tag or manual
Pattern Tag           : [dropdown — see Pattern Tags section]
Date Solved           : [auto timestamp]
Solve Level           : [auto-assigned from decision tree: WARRIOR/FIGHTER/LEARNER/ASSISTED/REBUILDER]
Revisit Score         : [1–5 stars — updated each time user revisits]
```

---

### BLOCK 2 — THE STORY (5 Chapters)

**Chapter 1: "What I Read" — Problem Understanding**
```
Field: my_understanding
Type: Rich text / textarea
Prompt shown to user: "Forget the problem statement. What is this problem actually asking you to do? Write it like you're explaining to a 10-year-old."
Example: "I have an array of heights representing bars. I need to find two bars that can hold the most water between them."
```

**Chapter 2: "My First Instinct" — Raw Thinking**
```
Field: first_instinct
Type: Rich text
Prompt: "What was your FIRST thought when you read this? Even if it was wrong. Even if it was 'I have no idea'. Write it."
Example: "My first thought was brute force — check every pair of bars. O(n²). Works but slow."
```

**Chapter 3: "The English Logic" — Pseudocode in Plain English**
```
Field: english_logic
Type: Rich text (support numbered steps)
Prompt: "Before writing any code — write the solution in English. Step by step. No syntax. Just logic."
Example:
  1. Start with two pointers — one at each end of the array
  2. Calculate water = distance between pointers × shorter bar height
  3. Move the pointer that points to the shorter bar inward
  4. Repeat until pointers meet
  5. Return the maximum water seen
```

**Chapter 4: "The Code" — Actual Implementation**
```
Field: solution_code
Type: Code editor (syntax highlighted)
Language selector: Python / Java / C++ / JavaScript
Prompt: "Now translate your English logic directly into code. Line by line."
```

**Chapter 5: "The Real World" — Why This Matters**
```
Field: real_world_connection
Type: Rich text
Prompt: "Where does this pattern exist in the real world? Don't just say 'arrays are used in databases'. Make it a story."
Example: "Instagram's story viewer uses a two-pointer-like approach when deciding which stories to preload — it balances left (already seen) and right (upcoming) to optimize memory. Same logic, different skin."
```

---

### BLOCK 3 — THE BATTLE REPORT

**Where I Got Stuck**
```
Field: stuck_point
Type: Rich text
Prompt: "What was the wall you hit? The exact moment your thinking broke down. Be specific."
Example: "I kept moving the wrong pointer. I moved the taller bar instead of the shorter one and couldn't figure out why my answer was wrong."
```

**The Aha Moment**
```
Field: aha_moment
Type: Single line text (keep it punchy)
Prompt: "One sentence. What was the single insight that unlocked this problem?"
Example: "Moving the taller bar can never increase the area. Only moving the shorter one can."
```

**Concept Learned (if Path 2)**
```
Field: concept_learned
Type: Rich text
Prompt: "If you didn't know the concept before this problem — summarize it in your own words NOW."
Only shown if: Solve Level = LEARNER / ASSISTED / REBUILDER
```

---

### BLOCK 4 — METADATA

```
Hint Used?            : [Yes / No toggle]
Hint Source           : [text — "LeetCode hint 1", "YouTube", "friend", etc.]
Time Taken            : [manual input in minutes]
Attempts              : [number stepper — how many tries before AC]
Complexity            : Time: O(?) | Space: O(?) — manual input
Related Problems      : [link to other problems in the workspace]
```

---

## 4. PATTERN TAGS (Dropdown Options)

Every problem must be tagged with ONE primary pattern.
These tags power the pattern analytics on the dashboard.

```
Arrays & Hashing
Two Pointers
Sliding Window
Stack
Binary Search
Linked List
Trees
Tries
Heap / Priority Queue
Backtracking
Graphs — BFS
Graphs — DFS
Dynamic Programming — 1D
Dynamic Programming — 2D
Greedy
Intervals
Bit Manipulation
Math & Geometry
Divide & Conquer
Recursion
Segment Tree
Union Find
```

---

## 5. SCREENS & NAVIGATION

### 5.1 Nav Item (add to BOSS sidebar)
```html
<li class="nav-item" data-page="dsa">
  <span class="nav-icon">⚔️</span>
  DSA Forge
</li>
```

---

### 5.2 SCREEN 1 — The War Room (Dashboard)

This is the landing screen when user clicks "DSA Forge" in nav.

**Header (match BOSS style):**
```
Good morning, let's forge something.        [Date]

DSA Story Forge
───────────────
Your personal problem journal. Every battle documented.
```

**Stat Cards Row (4 cards, same style as BOSS dashboard):**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PROBLEMS    │ │  WARRIORS    │ │  PATTERNS    │ │  STREAK      │
│  SOLVED      │ │  (solo wins) │ │  COVERED     │ │              │
│    47        │ │    23        │ │    12/22     │ │   🔥 7 days  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**Pattern Strength Grid:**
A visual grid showing all 22 patterns.
Each pattern shows:
- How many problems solved in that pattern
- Dominant solve level color (green=mostly warrior, red=mostly rebuilder)
- Click to filter problem list by pattern

```
Two Pointers     ████████░░  8 problems  [mostly 💪]
Sliding Window   █████░░░░░  5 problems  [mixed 🟡]
DP — 1D          ███░░░░░░░  3 problems  [mostly 🔴]
Graphs BFS       ░░░░░░░░░░  0 problems  [untouched]
```

**Recent Battles (last 5 problems):**
Cards showing: Problem name, difficulty badge, pattern tag, solve level badge, date, revisit score.

**CTA Button:**
```
[ + Log New Problem ]    [ 🔍 Search Problems ]
```

---

### 5.3 SCREEN 2 — The Forge (New Problem Entry)

This is where user documents a new problem.

**Layout: Single scrollable page, chapter-by-chapter**

Top of page:
```
⚔️ New Battle Log
──────────────────
Problem: [_______________]   LeetCode #: [____]
URL: [____________________________]   [🔗 Open LeetCode]
Difficulty: [Easy] [Medium] [Hard]
Pattern: [dropdown]
```

Then the 5 chapters appear as **cards in sequence**, each with:
- Chapter number + name as header
- The prompt text in muted color
- The input field below

Below the chapters, the Battle Report section appears.

Then Metadata fields at the bottom.

**Progress indicator at top:**
```
○ ─── ○ ─── ○ ─── ○ ─── ○
1     2     3     4     5
ID  Think Logic  Code  Real
```
Fills in as user completes each chapter.

**Solve Level Auto-Assign:**
Based on "Hint Used?" toggle and "Concept Learned?" toggle:
```javascript
function assignSolveLevel(hintUsed, conceptLearned, studiedSolution) {
  if (!conceptLearned && !hintUsed)   return "WARRIOR";   // 💪
  if (!conceptLearned && hintUsed)    return "FIGHTER";   // 🟡
  if (conceptLearned  && !hintUsed)   return "LEARNER";   // 🟠
  if (conceptLearned  && hintUsed)    return "ASSISTED";  // 🔵
  if (studiedSolution)                return "REBUILDER"; // 🔴
}
```

**Save button:**
```
[ 💾 Save to Forge ]
```
Saves to localStorage under key `boss_dsa_problems`.

---

### 5.4 SCREEN 3 — The Scroll (Problem Library)

All logged problems in one view.

**Filters row:**
```
[All] [Easy] [Medium] [Hard]    Pattern: [All ▾]    Level: [All ▾]    Sort: [Recent ▾]
```

**Search bar:**
```
🔍 Search by name, concept, aha moment...
```

**Problem Cards:**
Each card shows:
```
┌────────────────────────────────────────────────────┐
│  #42 Trapping Rain Water              [Medium] 🟡  │
│  Two Pointers  •  Solved 3 days ago               │
│                                                    │
│  "Moving the taller bar can never increase area"   │
│   ↑ Aha Moment                                    │
│                                                    │
│  Revisit: ★★★☆☆    Time: 45 min    Attempts: 3   │
│                                                    │
│  [ View Full Story ]    [ Revise Now ]             │
└────────────────────────────────────────────────────┘
```

Color coding on left border:
- 💪 WARRIOR → green border
- 🟡 FIGHTER → yellow border
- 🟠 LEARNER → orange border
- 🔵 ASSISTED → blue border
- 🔴 REBUILDER → red border

---

### 5.5 SCREEN 4 — The Story View (Single Problem)

Full read-only view of one problem's complete story.

**Layout: 2 columns on desktop, 1 column on mobile**

Left column (70%):
- Problem title + LeetCode link button
- All 5 chapters displayed as clean readable sections
- Code block with syntax highlight
- Battle Report section

Right column (30%):
- Metadata card (difficulty, pattern, level badge, date, time, attempts, complexity)
- Revisit Score updater (user can update stars here)
- Related Problems list
- "Solve Again" button → opens a blank re-attempt modal, then compares with original

**"Solve Again" Modal:**
```
Revision Mode — [Problem Name]
────────────────────────────────
Without looking at your solution, solve this again.

English Logic:
[___________________________]

Code:
[___________________________]

[ Compare with my original solution ]
```

After comparing, prompt:
```
How did it go?
[★ Forgot everything] [★★ Remembered bits] [★★★ Got it with effort] [★★★★ Mostly smooth] [★★★★★ Crushed it]
```
This updates the Revisit Score.

---

### 5.6 SCREEN 5 — The Arena (Pattern Analytics)

Deep dive into your pattern performance.

**For each pattern, show:**
```
TWO POINTERS
────────────
8 problems solved
Solve Level breakdown:
  💪 Warrior:   4  ████████░░░░
  🟡 Fighter:   2  ████░░░░░░░░
  🔴 Rebuilder: 2  ████░░░░░░░░

Average time: 38 min
Hardest problem: #42 Trapping Rain Water
Easiest win: #167 Two Sum II

Trend: Getting stronger ↑
```

**Pattern Radar Chart:**
A visual radar/spider chart showing strength across all patterns (1–10 score based on solve levels and revisit scores). This is the single most motivating visual — watching your radar expand over time.

---

## 6. THE REVISIT SYSTEM (Spaced Repetition)

On the War Room dashboard, show a **"Due for Revision"** section.

**Logic:**
```javascript
function isDueForRevision(problem) {
  const daysSinceSolved = daysBetween(problem.date_solved, today);
  const revisitScore = problem.revisit_score; // 1–5

  // Lower revisit score = revise sooner
  const intervals = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
  return daysSinceSolved >= intervals[revisitScore];
}
```

Show max 5 due problems in a "Revise Today" card on dashboard:
```
┌─────────────────────────────────────┐
│  ⏰ DUE FOR REVISION  (3 problems)  │
│                                     │
│  #42 Trapping Rain Water   🔴 7d   │
│  #3  Longest Substring     🟡 3d   │
│  #1  Two Sum               💪 14d  │
│                                     │
│  [ Start Revision Session ]         │
└─────────────────────────────────────┘
```

---

## 7. GAMIFICATION SYSTEM

**Solve Level Progression:**
When a problem's revisit score reaches 5 stars, its solve level can be "promoted":
```
REBUILDER → ASSISTED → LEARNER → FIGHTER → WARRIOR
```
Show a small animation when a problem gets promoted.

**Badges (earned automatically):**
```
🏹 First Blood        — Solve your first problem
⚡ Pattern Hunter     — Solve 5 problems in one pattern
🧠 The Thinker        — 10 WARRIOR level solves
📖 The Scholar        — Complete all 5 chapters on 20 problems
🔁 Revisor            — Revise 10 problems
🗺️ Pattern Master     — Solve at least 1 problem in 15 patterns
💀 Boss Slayer        — Solve a Hard problem at WARRIOR level
🔥 Week Warrior       — 7-day solving streak
```

Show earned badges on the War Room dashboard.

**Streak counter:**
Solving or revising at least one problem per day maintains the streak.
Show streak fire counter in top-right of dashboard (same style as BOSS days-left counter).

---

## 8. LEETCODE INTEGRATION

Each problem has a **direct LeetCode link**.

Display behavior:
```html
<a href="https://leetcode.com/problems/[slug]/" target="_blank" class="lc-link-btn">
  Open on LeetCode ↗
</a>
```

**Auto-fill from URL:**
When user pastes a LeetCode URL into the URL field, auto-extract:
- Problem number (from URL slug or page)
- Problem name (from URL slug, format it: "trapping-rain-water" → "Trapping Rain Water")
- Difficulty (user still confirms manually)

```javascript
function parseLeetCodeURL(url) {
  const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/);
  if (!match) return null;
  const slug = match[1];
  const name = slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  const number = null; // user fills manually or future API
  return { slug, name };
}
```

---

## 9. DATA STRUCTURE

### Problem Object
```javascript
{
  id: "uuid-generated",
  lc_number: 42,
  lc_url: "https://leetcode.com/problems/trapping-rain-water/",
  lc_slug: "trapping-rain-water",
  title: "Trapping Rain Water",
  difficulty: "Hard",                    // "Easy" | "Medium" | "Hard"
  pattern: "two-pointers",
  date_solved: "2026-04-18T18:49:00Z",
  solve_level: "WARRIOR",               // WARRIOR|FIGHTER|LEARNER|ASSISTED|REBUILDER

  story: {
    my_understanding: "...",
    first_instinct: "...",
    english_logic: "...",
    solution_code: "...",
    solution_language: "python",
    real_world_connection: "..."
  },

  battle: {
    stuck_point: "...",
    aha_moment: "...",
    concept_learned: "..."              // null if Path 1
  },

  meta: {
    hint_used: false,
    hint_source: null,
    studied_solution: false,
    time_taken_mins: 45,
    attempts: 3,
    time_complexity: "O(n)",
    space_complexity: "O(1)",
    related_problems: ["uuid-2", "uuid-5"]
  },

  revision: {
    revisit_score: 4,                   // 1–5 stars
    last_revised: "2026-04-21T10:00Z",
    revision_count: 2,
    revision_history: [
      { date: "...", score_given: 3 },
      { date: "...", score_given: 4 }
    ]
  }
}
```

### Workspace Object
```javascript
{
  version: "1.0",
  last_updated: "...",
  streak: {
    current: 7,
    longest: 12,
    last_activity: "2026-04-18"
  },
  badges_earned: ["first-blood", "pattern-hunter"],
  problems: [ ...problemObjects ]
}
```

localStorage key: `boss_dsa_forge`

---

## 10. FILE STRUCTURE

```
/dsa.html              ← New standalone page (or screen in index.html)
/js/dsa.js             ← All DSA logic: CRUD, analytics, revisit engine, gamification
/js/dsa-patterns.js    ← Pattern definitions and tag list
/css/dsa.css           ← Additional styles (imports BOSS base)
/data/dsa_data.js      ← Loaded from localStorage boss_dsa_forge
```

If BOSS uses single-file architecture → add as `data-page="dsa"` screen in `index.html`.

---

## 11. DESIGN SPECIFICATIONS

### Match BOSS exactly:

```css
/* Same variables as BOSS index.html */
--bg-primary:     #0f1117
--bg-card:        #1a1d27
--bg-elevated:    #20243a
--accent-blue:    #3B6FE8
--text-primary:   #ffffff
--text-secondary: #8b8fa8
--border:         #2a2d3e
--success:        #22c55e
--warning:        #f59e0b
--danger:         #ef4444

/* Solve level colors */
--warrior:   #22c55e    /* green  */
--fighter:   #eab308    /* yellow */
--learner:   #f97316    /* orange */
--assisted:  #3b82f6    /* blue   */
--rebuilder: #ef4444    /* red    */
```

### Card Style (identical to BOSS):
```css
.dsa-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 24px;
}
```

### Solve level left border accent:
```css
.problem-card[data-level="WARRIOR"]   { border-left: 3px solid var(--warrior);   }
.problem-card[data-level="FIGHTER"]   { border-left: 3px solid var(--fighter);   }
.problem-card[data-level="LEARNER"]   { border-left: 3px solid var(--learner);   }
.problem-card[data-level="ASSISTED"]  { border-left: 3px solid var(--assisted);  }
.problem-card[data-level="REBUILDER"] { border-left: 3px solid var(--rebuilder); }
```

### Code Block:
```css
.code-block {
  background: #0d1117;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}
```

---

## 12. COPY & TONE GUIDELINES

Every piece of UI text must feel like a **battle journal**, not a study app.

| Instead of... | Say... |
|---|---|
| "Add new problem" | "Log New Battle" |
| "Problem solved" | "Battle Won" |
| "You haven't solved any problems" | "The forge is cold. Time to heat it up." |
| "Pattern: Two Pointers" | "Weapon: Two Pointers" |
| "Revision due" | "This enemy is returning. Are you ready?" |
| "View solution" | "Read the full story" |
| "Difficulty: Hard" | "Hard — Boss Level" |
| "Streak: 7 days" | "🔥 7-day war streak" |
| "You earned a badge" | "Achievement unlocked" |

The workspace should feel like a **war room**, not a classroom.

---

## 13. AGENT BUILD CHECKLIST

- [ ] New page/screen: `data-page="dsa"` in BOSS nav
- [ ] Nav item: ⚔️ DSA Forge
- [ ] War Room dashboard (5 stat cards, pattern grid, recent battles, revision due)
- [ ] The Forge — new problem entry form (5 chapters + battle report + metadata)
- [ ] Chapter progress indicator (5-step visual)
- [ ] Solve level auto-assign logic (decision tree)
- [ ] The Scroll — problem library (filter, search, sort, color-coded cards)
- [ ] Story View — full single problem read view
- [ ] "Solve Again" revision modal with score update
- [ ] Pattern Analytics screen (breakdown per pattern + radar concept)
- [ ] Spaced repetition engine (`isDueForRevision` function)
- [ ] "Due for Revision" card on dashboard
- [ ] Gamification: badges, streak counter, level promotion animation
- [ ] LeetCode URL auto-parse (slug → name)
- [ ] LeetCode "Open ↗" button on every problem
- [ ] localStorage persistence under `boss_dsa_forge`
- [ ] All CSS matching BOSS design system
- [ ] Full data structure implementation (Problem object + Workspace object)
- [ ] Syntax-highlighted code editor (use highlight.js from CDN)
- [ ] Mobile-responsive layout

---

## 14. THIRD-PARTY LIBRARIES (CDN — no install needed)

```html
<!-- Syntax highlighting for code blocks -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

<!-- UUID generation for problem IDs -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuid.min.js"></script>
```

---

*End of DSA_WORKSPACE.md — PRD v1.0*
*Feature: DSA Story Forge | Built for Study OS — BOSS*
*"Every problem is a story. Document the battle, not just the solution."*
