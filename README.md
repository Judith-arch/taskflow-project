# TaskFlow

A task management web app built with vanilla JavaScript that lets you create, organize, and track tasks with a clean, notebook-inspired interface. Built as a guided learning project.

## 🚀 Demo

[taskflow-project-sage-five.vercel.app](https://taskflow-project-sage-five.vercel.app/)

---

## ✨ Features

### Task management
- **Create tasks** with title, deadline, status, assigned person and priority
- **Subtasks** — optional expandable checklist per task, added at creation or inline from the card
- **Edit titles inline** — double-click any task title to rename it
- **Change status inline** — dropdown per card (To-do, Doing, Review, Done, Cancelled)
- **Pin tasks** — keeps them pinned at the top of the list
- **Archive tasks** via checkbox — counted as completed in stats
- **Delete tasks** with confirmation dialog (with "don't show again" option)
- **Deadline badge** — shows "Xd left" or "Xd overdue" when a deadline is within 7 days

### Search, filter & sort
- **Filter** by status: All, To-do, Doing, Review, Done, Cancelled, Archived
- **Search** tasks by title in real time
- **Sort** by deadline ascending or descending

### Export & collaboration
- **Export PDF** — formatted table with subtask rows per task
- **Export CSV** — includes all fields and subtask list per task
- **Export JSON** — full data backup
- **Import JSON** — merge with existing tasks or replace all; preserves subtask data

### Stats & overview
- **Donut chart** — visual breakdown by status
- **Stat cards** — total, completed, in progress, to-do
- **Progress bar** — live completion percentage
- **Overdue insights** — count of overdue and archived tasks
- **Critical tasks panel** — highlights tasks due within 5 days or already overdue
- **Calendar** — current month view with dots marking deadline days

### UX & accessibility
- **Dark / Light mode** — toggle with smooth transition, persistent via localStorage
- **Help panel** — slides in from the right with keyboard shortcuts reference
- **Keyboard shortcuts** — `?` opens help, `N` focuses new task, `F` focuses search, `Esc` closes panel
- **Confirm dialogs** — custom modal for destructive actions with "don't show again" option
- **Fully responsive** — works on mobile and desktop

---

## 📐 Design

Wireframes were made in Excalidraw before coding and can be found in `/docs/design/`.

The app is divided into four zones:

**Header** — app logo with pulsing dot, help button and dark/light mode toggle.

**Main view** — project title, task creation form (with optional subtask checklist) and a scrollable task list with filters, search and export controls. Each task card shows title, deadline, deadline badge, status dropdown, priority stars, assigned person, pin button and an optional expandable subtasks section.

**Statistics** — donut chart with task breakdown, stat cards, linear progress bar with percentage and overdue/archived insight rows.

**Bottom section** — critical tasks panel (overdue or due within 5 days) and a monthly calendar with deadline markers.

**Color palette** — warm off-white background with amber accents, inspired by a tidy notebook. Status colors: amber (to-do), blue (doing), purple (review), green (done), red (cancelled).

**Sidebar** — hidden, kept for future development to associate tasks with different projects or lists.

---

## 🛠️ Tech stack

- HTML5 (semantic)
- CSS3 (custom properties, Flexbox, Grid, media queries)
- Vanilla JavaScript (ES6+)
- [jsPDF](https://github.com/parallax/jsPDF) — loaded on demand for PDF export
- LocalStorage for data persistence
- Vercel for deployment

---

## 📦 Installation

No build step required. Just create a folder and inside it, clone and open.


```bash
cd taskflow-project
git clone https://github.com/Judith-arch/taskflow-project.git .
```

Then open `index.html` in your browser directly, or use a local server:

```bash
# With VS Code
# Install the Live Server extension and click "Go Live"

# Or with Python
python -m http.server 8000
# Visit http://localhost:8000
```

---
## 💡 Usage Examples
 
### Creating a task
 
Fill in the form at the top of the main view and press **Add Task**:
 
```
Title:    Fix login bug
Deadline: 2026-04-15
Status:   Doing
Assigned: Judith
Priority: ★★★☆☆
```
 
A green flash confirms the task was added. The card appears immediately in the list.
 
---
 
### Adding subtasks
 
Expand the subtask section in the creation form before submitting, or click **+ subtask** directly on any existing card. Each subtask has its own checkbox and is included in PDF and CSV exports.
 
```
Task: Redesign landing page
  └─ [ ] Update hero copy
  └─ [ ] Replace header image
  └─ [x] Review mobile breakpoints
```
 
---
 
### Pinning and prioritising
 
Click 📌 on any card to pin it — pinned tasks stay at the top regardless of sort order and get an amber left border. Use the priority stars (1–5) at creation time to signal urgency at a glance.
 
---
 
### Filtering and searching
 
Use the status tabs to narrow the list (`All`, `To-do`, `Doing`, `Review`, `Done`, `Cancelled`, `Archived`), or type in the search bar to filter by title in real time. Combine both to find a specific card quickly.
 
---
 
### Keyboard shortcuts
 
| Key | Action |
|-----|--------|
| `N` | Focus the new task form |
| `F` | Focus the search bar |
| `?` | Open the help panel |
| `Esc` | Close the help panel |
 
---
 
### Exporting data
 
Use the export buttons in the task list toolbar:
 
- **PDF** — a formatted table, one row per task, subtasks listed below each.
- **CSV** — all fields in a spreadsheet-friendly format, importable into Excel or Google Sheets.
- **JSON** — full backup including subtasks and metadata.
 
To restore or share a backup, click **Import JSON** and choose whether to merge with existing tasks or replace them entirely.
 
---

## 📁 Project structure

```
taskflow-project/
├── index.html       # App markup
├── style.css        # All styles (17 sections, documented)
├── app.js           # All logic (task CRUD, stats, export, UI)
├── .gitignore
├── README.md
└── docs/
│   └── design/
│   |   └── Excalidra_all_wireframe.png
│   |   └── final_design.png
│   |   └── pototype_1.png
│   |   └── task.png
│   └── ai/
│   |   └── ai-comparison.md
│   |   └── cursor-workflow.md
│   |   └── experiments.md
│   |   └── promt-engineering.md
│   |   └── reflection.md
│   └── exports/
│       └── taskflow-2026-04-10.csv
│       └── taskflow-backup-2026-04-10.json
│       └── taskflow-export-2026-04-10.pdf
├── api/
│   └── client.js                 ← new: all fetch() calls live here
├── .postman/
└── server/                       ← new: entire backend
    ├── .env                      ← PORT=3000 (git-ignored)
    ├── .gitignore                 ← node_modules + .env
    ├── package.json
    └── src/
        ├── index.js              ← entry point, middlewares, error handler
        ├── config/
        │   └── env.js            ← dotenv loader + validation
        ├── services/
        │   └── task.service.js   ← pure logic, in-memory array
        ├── controllers/
        │   └── task.controller.js ← req/res handling, validation
        └── routes/
            └── task.routes.js    ← verb → controller mapping
```
```
---
 
## 🌐 Deploy on Vercel
 
Since this project has no build step, deploying to Vercel is straightforward.
 
### From the Vercel dashboard
 
1. Push your code to GitHub (the repo must be public or you need a Vercel account linked to GitHub).
2. Go to [vercel.com](https://vercel.com) and click **Add New → Project**.
3. Import your GitHub repository (`taskflow-project`).
4. Vercel will auto-detect it as a static site. Leave all settings as default — no framework, no build command, no output directory needed.
5. Click **Deploy**. Done.
Every time you push to `main`, Vercel will redeploy automatically.

---

## 🗺️ Roadmap

- [ ] Full-screen task list view
- [ ] Pomodoro / work timer widget
- [ ] Project/list grouping (sidebar)

---

*TaskFlow © 2026 — Judith-Arch*