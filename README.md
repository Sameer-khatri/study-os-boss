#  Study OS — BOSS 🎓

> Stop grinding. Start thinking. A personal AI-powered study operating system.

BOSS is a local web application I built to fix how I study. Instead of scattered notes, forgotten DSA solutions, and no visibility into my CGPA — everything lives in one system. It's not a todo app. It's an operating system for your brain.

---

## Screenshots

![Dashboard](uploads/Screenshot%20(629).png)

---

## Features

### 📊 Dashboard
Daily readiness score, exam countdown, subject progress, and topic completion tracking across all subjects.

### 📈 CGPA Intelligence Engine
First-principles CGPA analysis. Applies the Pareto 80/20 rule to identify your "Vital Few" subjects, runs a live CGPA simulator, and generates an automated action plan based on credit weights.

![CGPA Engine](uploads/Screenshot%20(630).png)

### ⚔️ DSA Story Forge
Log every problem as a battle. Capture your thinking process, where you got stuck, the aha moment, and a real-world connection. 22 pattern categories, spaced repetition, solve-level tracking (Warrior → Rebuilder), and a Pattern Arena radar chart. Not just code — the full story.

![DSA Forge](uploads/Screenshot%20(631).png)

### 🧠 Neural Chamber (Ideas Vault)
Capture ideas the moment they appear. Animated neural particle background, masonry grid, brain map view, category filters, and a "Learn This" pipeline that sends ideas directly into The Codex.

![Neural Chamber](uploads/Screenshot%20(632).png)

### 📚 The Codex
A personal knowledge log with spaced repetition. Every concept gets a structured entry: What I Learned, Why It Matters, Real-World Example, Source. Mastery score (1–5) tracks retention. Gold shimmer on mastered entries. Daily streak counter.

![The Codex](uploads/Screenshot%20(633).png)

### 🤖 Study Room
AI-powered study modes via Groq (llama-3.3-70b-versatile) with streaming:
- **Teach** — explains any topic from your syllabus
- **Quiz** — tests your understanding
- **Boss Fight** — aggressive recall challenge
- **Story** — concept explained as a narrative

![Study Room](uploads/Screenshot%20(634).png)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend | Node.js + Express |
| AI | Groq API — llama-3.3-70b-versatile (streaming) |
| Storage | localStorage |

---

## Getting Started

**1. Clone the repo**
```bash
git clone https://github.com/Sameer-khatri/study-os-boss.git
cd study-os-boss
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env
```
Open `.env` and add your Groq API key. Get one free at [console.groq.com](https://console.groq.com)

**4. Run**
```bash
node server.js
```

**5. Open**
http://localhost:3000

---

## Project Structure
BOSS/
├── index.html          # Main single-page app
├── server.js           # Express server + Groq API
├── js/                 # Feature modules (dsa, knowledge, ideas, cgpa)
├── css/                # Stylesheets per feature
├── data/               # Subject and progress data
├── subjects/           # Syllabus markdown files per subject
├── agents/             # AI agent prompt definitions
├── config/             # Semester configuration
└── uploads/            # Screenshots and assets

---

## What's Built

- [x] Dashboard — readiness score, exam countdown, subject tracking
- [x] CGPA Intelligence Engine — Pareto analysis, live simulator, action plan
- [x] DSA Story Forge — battle journal, 22 patterns, spaced repetition, radar chart
- [x] Neural Chamber — ideas vault, particle canvas, brain map, Learn This pipeline
- [x] The Codex — knowledge log, mastery tracking, spaced repetition, streak
- [x] Study Room — Teach / Quiz / Boss Fight / Story modes via Groq AI

## What's Next

- [ ] Persistent backend storage (replace localStorage with JSON files via server.js)
- [ ] Auto syllabus parser (markdown → subjects.js)
- [ ] Boss Fight HP logic tied to actual LLM response evaluation
- [ ] Multi-agent orchestration (Manager, Intake, Priority agents)

---

## Built By

**Sameer Khatri** — CS Student, Sem 4, Year 2

Building in public. One system at a time.

[![GitHub](https://img.shields.io/badge/GitHub-Sameer--khatri-181717?style=flat&logo=github)](https://github.com/Sameer-khatri)
