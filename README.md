# Study OS — BOSS 🎓

> Stop grinding. Start thinking. A personal AI-powered study operating system.

## What is BOSS?

BOSS is a local web application I built to fix how I study. Instead of scattered notes, forgotten DSA solutions, and no visibility into my CGPA — everything lives in one system.

It's not a todo app. It's an operating system for your brain.

## Features

### ⚔️ DSA Story Forge
Log every problem as a battle. Capture your thinking process, where you got stuck, the aha moment, and a real-world connection. Not just code — the full story.

### 📈 CGPA Intelligence Engine
First-principles CGPA analysis. Applies the Pareto 80/20 rule to show exactly which subjects control your grade and where to focus.

### 📚 The Codex
A personal knowledge log with spaced repetition. Every concept you learn gets a structured entry. Mastery score tracks how well you actually retained it.

### 🧠 Neural Chamber
Capture ideas the moment they appear. Masonry grid, brain map view, and a "Learn This" pipeline that sends ideas directly into The Codex.

### 🤖 Study Room
AI-powered study modes via Groq:
- **Teach** — explains any topic from your syllabus
- **Quiz** — tests your understanding
- **Boss Fight** — aggressive recall challenge
- **Story** — concept explained as a narrative

### 📊 Dashboard
Daily readiness score, exam countdown, subject progress, and topic completion tracking.

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **AI:** Groq API (llama-3.3-70b-versatile) with streaming
- **Storage:** localStorage

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
Open `.env` and add your Groq API key.
Get one free at [console.groq.com](https://console.groq.com)

**4. Run**
```bash
node server.js
```

**5. Open**
http://localhost:3000

## Project Structure
BOSS/
├── index.html          # Main single-page app
├── server.js           # Express server + Groq API
├── js/                 # Feature modules (dsa, knowledge, ideas, cgpa)
├── css/                # Stylesheets per feature
├── data/               # Subject and progress data
├── subjects/           # Syllabus markdown files
├── agents/             # AI agent prompt definitions
└── config/             # Semester configuration

## Built By

**Sameer Khatri** — CS Student, Sem 4, Year 2

Building in public. One system at a time.

[![GitHub](https://img.shields.io/badge/GitHub-Sameer--khatri-181717?style=flat&logo=github)](https://github.com/Sameer-khatri)
