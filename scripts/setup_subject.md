# ⚙️ Script: setup_subject.md

## Purpose
Creates a new subject folder by copying the `_template` structure and replacing placeholders with real subject data.

---

## When to Run
- At the start of each semester after updating `semester.config.md`.
- When adding a new subject mid-semester.

---

## Steps

### Step 1: Read Config
```
Read: config/semester.config.md
Extract: subjects list → [ {name, short}, ... ]
```

### Step 2: For Each Subject, Create Folder
```
For each subject in config:
  source  = subjects/_template/
  target  = subjects/{SHORT}/
  
  If target does NOT exist:
    Copy all files from source → target
    Replace placeholders in each file:
      {{SUBJECT_NAME}} → subject.name
      {{SHORT}}        → subject.short
      {{SEMESTER}}     → config.semester
      {{YEAR}}         → config.year
    Log: "✅ Created subjects/{SHORT}/"
  Else:
    Log: "⏭️ subjects/{SHORT}/ already exists — skipped"
```

### Step 3: Update STATUS.md
```
Add/update subject row in STATUS.md table.
```

### Step 4: Confirm
```
Print summary:
  Created: [list of new folders]
  Skipped: [list of existing folders]
```

---

## Placeholders Used in _template
| Placeholder | Replaced With |
|-------------|--------------|
| `{{SUBJECT_NAME}}` | Full subject name |
| `{{SHORT}}` | Short code (e.g., TOC) |
| `{{SEMESTER}}` | Semester number |
| `{{YEAR}}` | Year |
| `{{YEAR-1}}` | Year - 1 |
| `{{YEAR-2}}` | Year - 2 |

---

## Rules
- Never modify `_template` files with real data.
- `_template` is the master. Always copy, never move.
- Only `semester.config.md` drives which subjects get created.
