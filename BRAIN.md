# 🧠 BRAIN.md — Study OS

## Project Name
Study OS

## Goal
AI-powered study system for any semester — built inside this workspace to plan, track, and execute exam preparation with precision.

## Current Phase
🟢 Setup → Structure Built → Smart Agents Defined

---

## Rules
| # | Rule |
|---|------|
| 1 | **System is generalized. Never hardcode subject names anywhere except `semester.config.md`** |
| 2 | **Agents must ANALYZE and REASON, never just copy-paste content. Every agent has a job that requires actual thinking.** |
| 3 | **Intake agent must use vision/image analysis. Student should NEVER manually type syllabus content.** |
| 4 | **Priority list must have reasoning per topic, not just a ranking number.** |
| 7 | **Manager always reads BRAIN.md + semester.config.md first before every response.** |
| 8 | **Manager never answers study questions directly. Always delegates to the correct agent.** |
| 9 | **After every agent session, Manager asks "What next?" — never leaves the student hanging.** |

---

## Subjects This Semester
| # | Subject | Status |
|---|---------|--------|
| 1 | Theory of Computation | 🔴 Not Started |
| 2 | ADA (Algorithm Design & Analysis) | 🔴 Not Started |
| 3 | Statistical Methods | 🔴 Not Started |
| 4 | Discrete Structures | 🔴 Not Started |
| 5 | Database Security | 🔴 Not Started |

---

## Exam Countdown
- **Time Remaining:** ~1 month
- **Last Updated:** 2026-04-13

---

## Architecture
```
BOSS/
├── BRAIN.md              ← This file. System control doc.
├── STATUS.md             ← Live dashboard. Updated after every session.
├── config/
│   └── semester.config.md  ← THE ONLY FILE THAT CHANGES EACH SEMESTER
├── subjects/
│   └── _template/        ← Master template. Never edit directly with real data.
│       ├── syllabus.md
│       ├── pyq.md
│       └── progress.md
├── agents/
│   ├── manager.md        ← Orchestrator
│   ├── intake.md         ← Raw input handler
│   ├── priority.md       ← What to study next
│   ├── study.md          ← Teaching agent
│   ├── progress.md       ← Progress tracker
│   └── answer.md         ← Exam answer generator
└── scripts/
    └── setup_subject.md  ← Creates subject folders from _template
```

## Notes
*This file is the central control document for Study OS. Update it as the system evolves.*
