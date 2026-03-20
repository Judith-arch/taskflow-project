# TaskFlow

A task management web application built as a Task Manager that allows users to create, organize, and track tasks across projects with a clean, notebook-inspired interface.

## 🚀 Demo
[https://taskflow-project-sage-five.vercel.app/](https://taskflow-project-sage-five.vercel.app/)
Task manager web, with 3 layouts: sidebar, main view (tasks page) and task panel.

## 📐 Design

The design was made before coding, using in Excalidraw.
The wireframes can be consulted in /docs.

**General structure**
The app has three main zones:
- a sidebar on the left
- a main task view in the center (with a form and tasks list with filters)
- a bottom section with statistics, critical tasks and a calendar

**Sidebar**
Thoughht for future development to asociata tasks to different projects / lists.

**Main view**
Shows the project name, a form to create new tasks (with title, deadline, status, assigned person and priority)
and a scrollable task list with filters and search.
Each task card shows its status with color coding, priority stars, assigned person, and a dropdown to change status inline.

**Bottom section**
Panel with total, completed, in-progress and to-do number of tasks, plus a progress bar.
Below that, critical tasks (deadline within 5 days) and a calendar showing the current month with task deadlines marked.

**User actions**
- Add tasks with title, deadline, status, assigned person and priority
- Mark tasks as completed via checkbox
- Cancel tasks (moves to cancelled status)
- Change task status inline from the task card
- Filter tasks by status
- Search tasks by title
- Switch dark/light mode
- Collapse/expand the sidebar

**Color palette**
Warm off-white background with some yellow accents — inspired by a blank a tidy notebook.
Each status has a color assigned: grey (to-do), blue (doing), purple (review), green (done), red (cancelled).

---

## 🛠️ Tech stack

- HTML5 (semantic)
- CSS3 (custom properties, Flexbox, Grid, media queries)
- Vanilla JavaScript (ES6+)
- Tailwind CSS (CDN, used for dark mode)
- LocalStorage for data persistence
- Vercel for deployment

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

## ✅ Step by step progress

1. **Set up the development environment**
- [X] Install VS Code and Git
- [X] Configure Git with user.name and user.email
- [X] Create GitHub account
- [X] Create private repository bootcamp-project
- [X] Clone repository locally
- [X] Create README.md
- [X] First commit and push to GitHub
- [X] Add @corner-estudios and @elbaronjack as collaborators
- [X] Install VS Code extensions (Prettier, ESLint, Live Server)
- [X] Create .gitignore for Node, OS and editor
- [X] Practice Git workflow with feature/setup branch

2. **Plan the application**
- [X] Design TaskFlow interface before coding
- [X] Create wireframe in Excalidraw
- [X] Define main sections: header, task list, form, statistics panel
- [X] Define user actions: add, complete, cancel and filter tasks
- [X] Save design screenshot in docs/design
- [X] Write design explanation in README

3. **Create the HTML structure**
- [X] Create index.html
- [X] Semantic HTML structure (header, main, aside, footer)
- [X] Main app title (h1)
- [X] Form to add new tasks
- [X] Task list
- [X] Statistics panel
- [X] Task template element
- [X] Correctly associated label tags
- [X] Single h1 with logical heading order
- [X] Validated with W3C validator (no errors)

4. **Design the layout with CSS**
- [X] Create style.css
- [X] CSS variables in :root
- [X] Basic CSS reset
- [X] Application header
- [X] Main layout with Flexbox and Grid
- [X] Fixed-width sidebar
- [X] Task cards with border, padding and shadow
- [X] Minimum 16px typography for inputs
- [X] Hover and focus states

5. **Make the app responsive**
- [X] Media queries for tablet (max 768px)
- [X] Media queries for mobile (max 480px)
- [X] Layout adapts on mobile
- [X] Form adapts to narrow screens
- [X] Tested with browser DevTools

6. **Implement logic with JavaScript**
- [X] Create app.js
- [X] Task object structure (id, title, completed, createdAt + extras)
- [X] Add new tasks
- [X] Render tasks in DOM
- [X] Mark tasks as completed
- [X] Cancel tasks
- [X] Update statistics on change
- [X] Reusable functions (renderTasks, updateStats, updateCriticalTasks, renderCalendar)

7. **Persist data with LocalStorage**
- [X] Save tasks with JSON.stringify
- [X] Retrieve tasks with JSON.parse on load
- [X] Handle empty state correctly
- [X] Auto-save on every change
- [X] Data persists on page reload

8. **Extra features**
- [X] Filter by status (all, to-do, doing, review, done, cancelled)
- [X] Search by title
- [X] Inline status change from task card
- [X] Priority system with stars
- [X] Critical tasks panel (deadline within 5 days)
- [X] Monthly calendar with task deadlines marked
- [X] Form validation with error messages

9. **Migrate styles to Tailwind**
- [X] Tailwind CSS installed via CDN
- [X] Dark mode implemented
- [X] Dark mode toggle button
- [X] Dark mode preference saved in LocalStorage

10. **Manual testing**
- [X] Tested with empty list — app loads correctly
- [X] Tried adding task without title — validation alert shown
- [X] Added task with long title — displays correctly
- [X] Marked several tasks as completed — statistics update correctly
- [X] Cancelled several tasks — moved to cancelled status
- [X] Reloaded page — data persists via LocalStorage

11. **Basic accessibility**
- [X] Keyboard navigation works
- [X] Buttons have aria-label attributes
- [X] Focus visible on Tab navigation
- [X] Color contrast checked

12. **Deploy**
- [X] GitHub repository connected to Vercel
- [X] Project imported from Vercel
- [X] App works correctly in production
- [X] Push to GitHub triggers automatic redeploy
- [X] Public URL added to README


---

*TaskFlow © 2026 — Bootcamp project*