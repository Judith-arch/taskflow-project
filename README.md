# TaskFlow

A task management web app built with vanilla JavaScript that lets you create, organize, and track tasks with a clean, notebook-inspired interface. Built as a bootcamp project.

## 🚀 Demo

[taskflow-project-sage-five.vercel.app](https://taskflow-project-sage-five.vercel.app/)

---

## ✨ Features

- **Create tasks** with title, deadline, status, assigned person and priority
- **Filter & search** tasks by status or title
- **Change status inline** from each task card via dropdown
- **Archive tasks** via checkbox — counted as completed in stats
- **Delete tasks** with confirmation dialog (with "don't show again" option)
- **Critical tasks panel** — highlights tasks due within 5 days or overdue
- **Statistics** — donut chart, progress bar, overdue insights and stat cards
- **Calendar** — current month with dots on days that have deadlines
- **Dark / Light mode** — persistent via localStorage
- **Sort** tasks by deadline ascending or descending
- **Fully responsive** — works on mobile and desktop

---

## 📐 Design

Wireframes were made in Excalidraw before coding and can be found in `/docs/design/`.

The app has three main zones:

**Header** — app logo and dark/light mode toggle.

**Main view** — project title, a form to create tasks and a scrollable task list with filters and search bar. Each task card shows its title, deadline, status dropdown, priority stars and assigned person.

**Statistics & bottom section** — donut chart with task breakdown, stat cards (total, completed, in progress, to-do), linear progress bar, overdue insights, critical tasks panel and a monthly calendar with deadline markers.

**Color palette** — warm off-white background with amber accents, inspired by a tidy notebook. Each status has its own color: amber (to-do), blue (doing), purple (review), green (done), red (cancelled).

**Sidebar** — hidden, kept for future development to associate tasks with different projects or lists.

---

## 🛠️ Tech stack

- HTML5 (semantic)
- CSS3 (custom properties, Flexbox, Grid, media queries)
- Vanilla JavaScript (ES6+)
- LocalStorage for data persistence
- Vercel for deployment

> Note: Tailwind CSS is listed in an earlier version but is not used in the current codebase — all styles are hand-written with CSS custom properties.

---

## 📦 Installation

No build step required. Just clone and open.
Create a folder for the project and inside the folder for a terminal run:
```bash
git clone https://github.com/Judith-arch/taskflow-project.git .
cd taskflow-project
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

## 📁 Project structure
```
bootcamp-project/
├── index.html
├── style.css
├── app.js
├── .gitignore
├── README.md
└── docs/
    └── design/
        └── wireframe.png
```

---

*TaskFlow © 2026 — Bootcamp project*