# MIND_PAGES.md — Product Requirements Document
## Features: Ideas Vault + Knowledge Log
### For: Study OS — BOSS
### Pages: `/ideas` + `/knowledge` (Fullscreen overlays, back button to BOSS)
### Version: 1.0

---

# PART 1 — IDEAS VAULT
## "The Neural Chamber"

---

## 1.1 VISION

Ideas Vault is not a notes app. It is a **cerebral space** — a visual representation of your mind.

When you open it, you feel like you are diving deep into your own brain. Every idea is a neuron. Every category is a cluster of thought. The space feels alive, pulsing, electric — like your creativity is being given a physical form.

The core feeling: **"I am unlocking the full capacity of my brain."**

This is the place where no idea dies. You capture it here, it lives forever, and when you come back — it doesn't feel like opening a spreadsheet. It feels like walking back into your own mind.

---

## 1.2 DESIGN THEME — "Neural Dark"

```
Background:     #080B14  (near black, deep space)
Primary accent: #7C3AED  (electric violet — synaptic)
Secondary:      #06B6D4  (cyan — neural signal)
Tertiary:       #F59E0B  (amber — spark/fire idea)
Text primary:   #F1F5F9
Text muted:     #64748B
Card bg:        #0F1629
Card border:    #1E2A45
Glow effect:    violet/cyan box-shadow pulses

Font:
  Headings:  'Syne' or 'Space Grotesk' — geometric, futuristic
  Body:      'Inter' — clean readable
  Accent:    'JetBrains Mono' — for tags/metadata
```

**Visual motif:**
- Subtle animated background: slow-moving particle dots connected by faint lines (like a neural network). Use canvas or CSS animation. Particles move at 0.2px/frame — barely noticeable but alive.
- Idea cards have a faint glow on hover — violet pulse
- When a new idea is added: a "synapse fires" animation — brief electric line shoots from the input to the card grid

---

## 1.3 ENTRY INTO THE PAGE

From BOSS sidebar, clicking "Ideas Vault" triggers a **fullscreen takeover**:

```javascript
// Transition: BOSS fades out, Ideas Vault slides up from bottom
// Duration: 400ms ease-in-out
// Not a new tab — overlay on same page, z-index: 9999
```

Top-left corner always shows:
```
← Back to BOSS
```
Small, muted. Clicking it reverses the animation and returns to BOSS.

---

## 1.4 LAYOUT — THE NEURAL CHAMBER

### Header Zone
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to BOSS                              [Search 🔍] [+ New] │
│                                                                   │
│  🧠 Neural Chamber                                               │
│  Your mind, mapped. Every idea captured.                         │
│                                                                   │
│  [All] [🚀 Build] [💡 Learn] [🌍 Explore] [⚡ Random] [🎯 Goals] │
└─────────────────────────────────────────────────────────────────┘
```

Category pills are horizontally scrollable. Each has a unique accent color.

### The Idea Grid (Main Content)

**Default view: Masonry grid** (Pinterest-style, not uniform rows)
Ideas appear as cards of varying heights — short ideas are small cards, detailed ideas are tall cards. This makes the grid feel organic, like actual thoughts — not a database.

```
┌──────────────┐  ┌──────────────────────┐  ┌──────────┐
│ 💡           │  │ 🚀                   │  │ ⚡       │
│ Build a      │  │ Life Portfolio       │  │ Fitness  │
│ portfolio    │  │ Website              │  │ Tracker  │
│              │  │                      │  │          │
│ #build       │  │ A site showing my    │  │ #health  │
│ 2d ago       │  │ ups, downs, peaks... │  │ today    │
└──────────────┘  │                      │  └──────────┘
                  │ #build #life         │
┌────────────────┐│ 3d ago               │  ┌──────────────────┐
│ 🌍             │└──────────────────────┘  │ 💡               │
│ Explore open   │                          │ What if BOSS had  │
│ source and     │  ┌──────────┐            │ an AI that reads  │
│ contribute     │  │ 🎯       │            │ your notes and    │
│                │  │ Learn    │            │ quizzes you?      │
│ #learn #open   │  │ system   │            │                   │
│ 1w ago         │  │ design   │            │ #boss #ai #build  │
└────────────────┘  │ #learn   │            │ 5h ago            │
                    │ 2d ago   │            └──────────────────┘
```

**Card anatomy:**
```
┌─────────────────────────────────┐
│  [category emoji]  [category]   │  ← top metadata
│                                 │
│  IDEA TITLE (if given)          │  ← bold, 16px
│                                 │
│  The actual idea text in full.  │  ← 14px, muted
│  Can be 1 line or a paragraph.  │
│                                 │
│  #tag1  #tag2  #tag3            │  ← mono font, violet
│                                 │
│  2 hours ago        [⋮ menu]    │  ← bottom row
└─────────────────────────────────┘
```

On hover: card lifts (transform: translateY(-4px)), faint violet glow appears on border.

---

## 1.5 THE QUICK CAPTURE INPUT (Most Important UI Element)

This is the **core interaction.** Capturing an idea must take under 5 seconds.

**Fixed at the bottom of the screen, always visible:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🧠  What's in your mind right now?                    [Send ↑] │
│                                                        Ctrl+Enter│
└─────────────────────────────────────────────────────────────────┘
```

Behavior:
- Single line by default. Expands to multiline as user types.
- `Ctrl+Enter` or clicking Send saves instantly.
- After saving: brief "synapse fire" animation — electric arc from input bar to the new card appearing in the grid.
- New card appears at the top-left of grid with a glow-in animation (scale from 0.8 to 1.0, opacity 0 to 1, 300ms).
- Input clears automatically. Cursor stays in input — ready for the next idea.

**After typing, a smart tag bar appears above the input:**
```
Category: [🚀 Build ▾]    Tags: [#_______] [+ Add tag]
```
These are optional — user can skip and just hit send. Uncategorized ideas go to "Uncategorized" by default.

---

## 1.6 IDEA DETAIL VIEW

Clicking any card expands it into a **side drawer** (slides in from the right, 40% width):

```
┌──────────────────────────────────┐
│  ← Close                  [Edit] │
│                                  │
│  🚀 Build                        │
│  ─────────────────────────────── │
│                                  │
│  Life Portfolio Website          │
│  (title — editable inline)       │
│                                  │
│  A site showing my full life     │
│  story. Ups, downs, peaks,       │
│  what I learned, what I built.   │
│  LinkedIn version shows skills.  │
│  GitHub version shows projects.  │
│                                  │
│  ─────────────────────────────── │
│  Tags:  #build  #life  #website  │
│  Added: Saturday, Apr 18, 2026   │
│  Status: [💭 Raw Idea ▾]         │
│                                  │
│  📎 Notes (expand this idea)     │
│  [___________________________]   │
│                                  │
│  🔗 Related Ideas                │
│  [Link another idea...]          │
│                                  │
│  [ 🗑️ Delete ]  [ 🚀 Promote ]   │
└──────────────────────────────────┘
```

**Idea Status (dropdown):**
```
💭 Raw Idea      — just captured, unprocessed
🔥 Hot — Pursue  — this needs action soon
📋 Planned       — added to a plan/todo
✅ Built/Done    — this idea became real
❄️ Archived      — good idea, not now
```

**"Promote" button** → marks idea as "Hot" and moves it to a pinned "On Fire" section at top of grid.

---

## 1.7 CATEGORIES (Default Set — User Can Add More)

```javascript
const DEFAULT_CATEGORIES = [
  { id: "build",   emoji: "🚀", label: "Build",   color: "#7C3AED" },
  { id: "learn",   emoji: "💡", label: "Learn",   color: "#06B6D4" },
  { id: "explore", emoji: "🌍", label: "Explore", color: "#10B981" },
  { id: "random",  emoji: "⚡", label: "Random",  color: "#F59E0B" },
  { id: "goals",   emoji: "🎯", label: "Goals",   color: "#EF4444" },
  { id: "people",  emoji: "👥", label: "People",  color: "#EC4899" },
  { id: "money",   emoji: "💰", label: "Money",   color: "#84CC16" },
];
```

---

## 1.8 SEARCH

Clicking the search icon expands a full-width search bar that searches across:
- Idea text
- Title
- Tags
- Category

Results highlight matching text. Real-time as user types (no submit button needed).

---

## 1.9 VIEWS TOGGLE

Top-right corner, two view options:

**Grid view (default):** Masonry layout described above.

**Brain Map view (bonus — if agent can build it):**
Ideas rendered as nodes in a force-directed graph. Connected ideas cluster together. Categories form color clusters. Hovering a node shows the idea text. Clicking opens the detail drawer.
Use: `d3.js` force simulation or simple canvas-based approach.
This view makes the "unlocking your brain" feeling literal.

---

## 1.10 DATA STRUCTURE — Ideas Vault

```javascript
// localStorage key: boss_ideas_vault

{
  version: "1.0",
  ideas: [
    {
      id: "uuid",
      title: "Life Portfolio Website",        // optional
      content: "A site showing my full...",   // required
      category: "build",
      tags: ["build", "life", "website"],
      status: "hot",                          // raw|hot|planned|done|archived
      created_at: "2026-04-18T18:49:00Z",
      updated_at: "2026-04-18T18:49:00Z",
      notes: "Extended thinking...",          // optional
      related_ideas: ["uuid-2", "uuid-5"]
    }
  ],
  custom_categories: [],
  stats: {
    total: 47,
    this_week: 8,
    hot_count: 3
  }
}
```

---

## 1.11 ANIMATIONS SPECIFICATION

```css
/* Card hover */
.idea-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
  transition: all 0.2s ease;
}

/* New card appear */
@keyframes synapseIn {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
.idea-card.new { animation: synapseIn 0.3s ease forwards; }

/* Input bar pulse when focused */
@keyframes borderPulse {
  0%,100% { box-shadow: 0 0 0px rgba(124, 58, 237, 0); }
  50%      { box-shadow: 0 0 12px rgba(124, 58, 237, 0.6); }
}
.quick-input:focus { animation: borderPulse 2s infinite; }

/* Background particles — subtle */
/* Use canvas element, draw 80 dots, connect dots < 150px apart */
/* Dot speed: 0.15–0.3 px per frame, random direction */
/* Line opacity: distance-based, max 0.15 */
```

---
---

# PART 2 — KNOWLEDGE LOG
## "The Codex"

---

## 2.1 VISION

The Knowledge Log is your **personal Codex** — a living record of everything you've ever learned.

Not a boring list of "Today I learned X." Every entry feels like **opening a chapter in your own book.** When you come back to revise, it feels like reading something interesting — not reviewing notes.

The anti-boring principle: **knowledge should feel like discovery, not duty.**

When you open an entry to revise, it greets you. It shows when you last read it. It rewards you for coming back. It makes you feel like you're getting smarter in real time.

---

## 2.2 DESIGN THEME — "The Codex"

```
Background:      #0A0A0F  (almost pure black)
Primary accent:  #E8C547  (gold — knowledge, wisdom)
Secondary:       #FF6B6B  (coral — highlights, important)
Success:         #4ADEAA  (mint green — mastered)
Text primary:    #FAFAFA
Text muted:      #6B7280
Card bg:         #111118
Card border:     #1F1F2E
Divider:         #1A1A28

Font:
  Headings:  'Playfair Display' — editorial, book-like, serious beauty
  Body:      'Inter' — clean
  Code/mono: 'JetBrains Mono'
  Tags:      'Space Mono'
```

**Visual motif:**
- Feels like a premium digital book / magazine
- Gold accents everywhere — titles, borders, icons
- Each entry has a subtle "page texture" feel
- Knowledge domain icons are large and decorative
- Mastered entries get a gold shimmer effect

---

## 2.3 ENTRY INTO THE PAGE

Same fullscreen takeover from BOSS as Ideas Vault.
Different transition: **page flip animation** — like opening a book. BOSS slides left, Codex slides in from right.

Top-left:
```
← Back to BOSS
```

---

## 2.4 LAYOUT — THE CODEX

### Header
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to BOSS                          [🔍 Search] [+ Learn]  │
│                                                                   │
│  📚 The Codex                            Entries: 34             │
│  Everything you've ever learned.         This week: 5            │
│                                                                   │
│  🔥 7-day streak    ⚡ 142 total concepts    🏆 12 mastered      │
└─────────────────────────────────────────────────────────────────┘
```

### Domain Filter Bar
```
[All] [💻 Tech] [🧠 DSA] [📐 Math] [🎨 Design] [💼 Career]
      [🌍 World] [💪 Health] [📖 Reading] [⚡ Other]
```

### Main Layout: 2-Column

**Left column (65%) — Entry Feed:**

Entries appear as **editorial cards** — not boring list items. Each card feels like a magazine article teaser.

```
┌───────────────────────────────────────────────────────┐
│  💻 Tech · Prompt Engineering               Apr 18    │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  How to Give the Best Prompts to AI                   │  ← Title, large
│                                                        │
│  The key insight is that AI responds to context       │  ← First line preview
│  and specificity. The more you define the role,       │
│  format, and constraints — the better the output...   │
│                                                        │
│  ──────────────────────────────────────────────────── │
│  #prompting  #ai  #productivity                        │
│  Mastery: ▓▓▓▓░  4/5    Last revised: 2d ago          │
│  [ 📖 Read Full Entry ]    [ ⚡ Quick Revise ]         │
└───────────────────────────────────────────────────────┘
```

**Right column (35%) — The Sidebar:**

```
┌───────────────────────┐
│  📅 TODAY             │
│  Saturday, Apr 18     │
│                       │
│  Logged today: 2      │
│  [+ Log Something]    │
│                       │
│  ─────────────────    │
│  ⏰ REVISE TODAY      │
│                       │
│  3 entries due        │
│  ──────────────       │
│  · Prompt Eng.  4d    │
│  · Two Pointers 7d    │
│  · React Hooks  14d   │
│                       │
│  [ Start Session ]    │
│                       │
│  ─────────────────    │
│  🏆 MASTERED          │
│  12 concepts          │
│  ──────────────       │
│  · Big O Notation     │
│  · Git workflow       │
│  · HTTP Methods       │
│                       │
│  ─────────────────    │
│  📊 DOMAINS           │
│  Tech      ████ 14    │
│  DSA       ███  8     │
│  Design    ██   5     │
│  Career    █    3     │
└───────────────────────┘
```

---

## 2.5 THE LOG INPUT (New Entry)

Clicking `[+ Learn]` or `[+ Log Something]` opens a **fullscreen writing modal** — like opening a blank page in a premium notebook.

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Cancel                                          [ Save Entry ]│
│                                                                   │
│  What did you learn?                                             │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│  Domain:  [💻 Tech ▾]    Tags: [#_________]                      │
│                                                                   │
│  ╔═════════════════════════════════════════════════════════╗     │
│  ║  Title                                                  ║     │
│  ║  ──────────────────────────────────────────────────     ║     │
│  ║  How to Give the Best Prompts to AI                     ║     │
│  ╚═════════════════════════════════════════════════════════╝     │
│                                                                   │
│  What I Learned                                                   │
│  ──────────────────────────────────────────────────────────      │
│  [Rich text area — type freely]                                   │
│                                                                   │
│  Why It Matters (optional)                                        │
│  ──────────────────────────────────────────────────────────      │
│  [Where will I use this? How does it change how I work?]          │
│                                                                   │
│  Real-World Example (optional)                                    │
│  ──────────────────────────────────────────────────────────      │
│  [Give one concrete example of this in action]                    │
│                                                                   │
│  Source (optional)                                                │
│  [YouTube / Article / Book / Course / Experience]                 │
│                                                                   │
│  Initial Mastery: [░░░░░ 1] [░░░░░ 2] [░░░░░ 3] [░░░░░ 4] [░ 5] │
│  (How well do you understand this RIGHT NOW?)                     │
└─────────────────────────────────────────────────────────────────┘
```

**On save:**
- Entry appears in feed with gold "NEW" badge for 24h
- Confetti or gold particle burst animation (brief, 1 second)
- Streak counter increments if first log of the day

---

## 2.6 FULL ENTRY VIEW

Clicking "Read Full Entry" opens the entry in a **beautiful full-width reading view** — like reading an article:

```
← Back to Codex                                    [✏️ Edit] [🗑️ Delete]

─────────────────────────────────────────────────────────────────────
💻 Tech  ·  April 18, 2026  ·  Last revised 2 days ago
─────────────────────────────────────────────────────────────────────

How to Give the Best Prompts to AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT I LEARNED
──────────────
The key insight is that AI responds to context and specificity.
The more you define the role, format, and constraints —
the better the output becomes.

Key principles:
  1. Define the role: "You are a senior software engineer..."
  2. Give context: what you're building, what you've tried
  3. Specify format: "Give me a numbered list"
  4. Add constraints: "Keep it under 100 words"
  5. Show examples: "Like this: ..."

WHY IT MATTERS
──────────────
This changes how I use Claude and ChatGPT every single day.
Instead of vague prompts, I now get precise answers.

REAL-WORLD EXAMPLE
──────────────────
Before: "Help me write a function"
After:  "You are a Python expert. Write a function that takes
         a list of integers and returns the two numbers that
         sum to a target. Return it as clean, commented code."

SOURCE
──────
Personal experience + Claude conversations

─────────────────────────────────────────────────────────────────────
#prompting  #ai  #productivity

MASTERY LEVEL: ▓▓▓▓░  4/5
Revision history: Apr 18 (2) → Apr 20 (3) → Apr 22 (4)
─────────────────────────────────────────────────────────────────────

[ ⚡ Start Quick Revision ]
```

---

## 2.7 QUICK REVISION MODE

Clicking "Quick Revise" or "Start Quick Revision" hides the entry content and shows:

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚡ REVISION MODE                                                │
│  How to Give the Best Prompts to AI                             │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│  Without looking — what do you remember about this?             │
│                                                                   │
│  [___________________________________________]                    │
│  [___________________________________________]                    │
│  [___________________________________________]                    │
│                                                                   │
│                              [ Reveal & Compare ]                │
└─────────────────────────────────────────────────────────────────┘
```

After revealing, prompt:
```
How well did you remember?

[😵 Forgot]  [😐 Bits]  [🙂 Most]  [😊 Almost all]  [🔥 Perfect]
   1             2          3            4                5
```

This updates mastery score. If mastery reaches 5 → entry gets **"Mastered" status** with gold shimmer animation.

---

## 2.8 SPACED REPETITION ENGINE

Same logic as DSA Forge but tuned for knowledge:

```javascript
function knowledgeRevisionDue(entry) {
  const days = daysBetween(entry.last_revised, today);
  const intervals = { 1: 1, 2: 2, 3: 4, 4: 10, 5: 21 };
  return days >= intervals[entry.mastery_score];
}
```

Entries due for revision show up in the sidebar "Revise Today" section with days-overdue indicator.

---

## 2.9 DATA STRUCTURE — Knowledge Log

```javascript
// localStorage key: boss_knowledge_log

{
  version: "1.0",
  streak: {
    current: 7,
    longest: 15,
    last_log_date: "2026-04-18"
  },
  entries: [
    {
      id: "uuid",
      title: "How to Give the Best Prompts to AI",
      domain: "tech",
      tags: ["prompting", "ai", "productivity"],
      content: {
        what_learned: "...",
        why_matters: "...",
        real_example: "...",
        source: "Personal experience"
      },
      mastery_score: 4,           // 1–5
      created_at: "2026-04-18T...",
      last_revised: "2026-04-20T...",
      revision_count: 2,
      revision_history: [
        { date: "...", score_before: 2, score_after: 3 },
        { date: "...", score_before: 3, score_after: 4 }
      ],
      status: "active"            // active | mastered | archived
    }
  ],
  stats: {
    total_entries: 34,
    mastered: 12,
    total_revisions: 67
  }
}
```

---

## 2.10 DOMAINS (Default Set)

```javascript
const KNOWLEDGE_DOMAINS = [
  { id: "tech",    emoji: "💻", label: "Tech",    color: "#7C3AED" },
  { id: "dsa",     emoji: "🧠", label: "DSA",     color: "#06B6D4" },
  { id: "math",    emoji: "📐", label: "Math",    color: "#F59E0B" },
  { id: "design",  emoji: "🎨", label: "Design",  color: "#EC4899" },
  { id: "career",  emoji: "💼", label: "Career",  color: "#10B981" },
  { id: "world",   emoji: "🌍", label: "World",   color: "#3B82F6" },
  { id: "health",  emoji: "💪", label: "Health",  color: "#EF4444" },
  { id: "reading", emoji: "📖", label: "Reading", color: "#84CC16" },
  { id: "other",   emoji: "⚡", label: "Other",   color: "#64748B" },
];
```

---

## 2.11 ANIMATIONS SPECIFICATION — The Codex

```css
/* Entry card hover — lift with gold glow */
.knowledge-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 16px rgba(232, 197, 71, 0.2);
  border-color: rgba(232, 197, 71, 0.4);
  transition: all 0.25s ease;
}

/* Mastered entry — gold shimmer */
@keyframes goldShimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.entry-card.mastered {
  background: linear-gradient(90deg,
    #111118 0%, #1a1608 40%, #111118 60%, #111118 100%);
  background-size: 200% auto;
  animation: goldShimmer 3s linear infinite;
}

/* New entry save — gold particles */
@keyframes particleBurst {
  0%   { opacity: 1; transform: scale(0) translateY(0); }
  100% { opacity: 0; transform: scale(1) translateY(-60px); }
}

/* Page flip transition from BOSS */
@keyframes pageFlipIn {
  0%   { transform: perspective(1200px) rotateY(90deg); opacity: 0; }
  100% { transform: perspective(1200px) rotateY(0deg);  opacity: 1; }
}
.codex-page { animation: pageFlipIn 0.4s ease-out forwards; }

/* Mastery bar fill animation */
@keyframes masteryFill {
  from { width: 0%; }
  to   { width: var(--mastery-pct); }
}
.mastery-bar { animation: masteryFill 0.8s ease-out forwards; }
```

---

# PART 3 — SHARED SPECIFICATIONS

---

## 3.1 NAVIGATION — HOW BOTH PAGES CONNECT TO BOSS

Add to BOSS sidebar:

```html
<!-- Ideas Vault -->
<li class="nav-item" data-page="ideas" onclick="openFullscreen('ideas')">
  <span class="nav-icon">🧠</span>
  Ideas Vault
</li>

<!-- Knowledge Log -->
<li class="nav-item" data-page="knowledge" onclick="openFullscreen('knowledge')">
  <span class="nav-icon">📚</span>
  The Codex
</li>
```

Fullscreen handler:
```javascript
function openFullscreen(page) {
  const overlay = document.getElementById(`${page}-overlay`);
  overlay.style.display = 'block';
  // trigger entry animation
  requestAnimationFrame(() => overlay.classList.add('active'));
  // lock scroll on BOSS
  document.body.style.overflow = 'hidden';
}

function closeFullscreen(page) {
  const overlay = document.getElementById(`${page}-overlay`);
  overlay.classList.remove('active');
  overlay.addEventListener('transitionend', () => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }, { once: true });
}
```

Both pages are `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999`.

---

## 3.2 FILE STRUCTURE

```
/ideas.html          ← Ideas Vault fullscreen overlay
/knowledge.html      ← Knowledge Log fullscreen overlay
/js/ideas.js         ← All Ideas Vault logic
/js/knowledge.js     ← All Knowledge Log logic
/css/ideas.css       ← Neural Chamber theme
/css/knowledge.css   ← Codex theme
```

OR inject both as `<div id="ideas-overlay">` and `<div id="knowledge-overlay">` directly inside `index.html` if BOSS is single-file.

---

## 3.3 THIRD-PARTY LIBRARIES

```html
<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700&family=Space+Grotesk:wght@400;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">

<!-- Syntax highlight (already in BOSS for DSA) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

<!-- UUID -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuid.min.js"></script>

<!-- D3 (for Brain Map view in Ideas Vault — optional bonus) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
```

---

## 3.4 AGENT BUILD CHECKLIST

### Ideas Vault
- [ ] Fullscreen overlay with entry/exit animation (slide up)
- [ ] Neural dark theme (background: #080B14, violet/cyan accents)
- [ ] Animated particle background (canvas, 80 dots, faint connections)
- [ ] Back to BOSS button (top-left)
- [ ] Quick capture input bar (fixed bottom, Ctrl+Enter shortcut)
- [ ] Smart tag/category selector (appears after typing)
- [ ] Masonry grid layout (CSS columns or JS masonry)
- [ ] Card hover effects (lift + violet glow)
- [ ] New card synapse-fire animation
- [ ] Category filter pills (horizontal scroll)
- [ ] Real-time search
- [ ] Side drawer for idea detail view
- [ ] Idea status system (Raw/Hot/Planned/Done/Archived)
- [ ] "Promote to Hot" functionality
- [ ] Pinned "On Fire" section for hot ideas
- [ ] Grid view + Brain Map view toggle (D3 bonus)
- [ ] localStorage under `boss_ideas_vault`
- [ ] Full data structure implemented

### Knowledge Log
- [ ] Fullscreen overlay with page-flip entry animation
- [ ] Codex theme (background: #0A0A0F, gold accents)
- [ ] Back to BOSS button (top-left)
- [ ] Editorial card feed (left 65%)
- [ ] Sidebar with today/revision/mastered/domains (right 35%)
- [ ] Domain filter bar
- [ ] Full-page new entry writing modal
- [ ] 4-field entry structure (what learned / why matters / real example / source)
- [ ] Initial mastery score selector (1–5)
- [ ] Full entry reading view (article-style)
- [ ] Quick revision mode (hide content → recall → reveal → score)
- [ ] Mastery score update on revision
- [ ] Gold shimmer on mastered entries
- [ ] Streak counter (daily log streak)
- [ ] Spaced repetition engine (revision due logic)
- [ ] "Revise Today" list in sidebar
- [ ] Confetti/gold particle on save animation
- [ ] Stats: total entries, mastered count, streak, domain breakdown
- [ ] localStorage under `boss_knowledge_log`
- [ ] Full data structure implemented

---

*End of MIND_PAGES.md — PRD v1.0*
*Features: Ideas Vault (Neural Chamber) + Knowledge Log (The Codex)*
*For: Study OS — BOSS*
*"Your mind is the most powerful system you own. Build an OS for it."*
