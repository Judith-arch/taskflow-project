# 📘 Documentation – Improvements made with Cursor

## 📑 Table of Contents

1. [Introduction](#introduction)
2. [Example 1 — Reliability and structure improvements in app.js](#example-1--reliability-and-structure-improvements-in-appjs)
3. [Example 2 — UX and critical tasks logic improvements](#example-2--ux-and-critical-tasks-logic-improvements)
4. [Conclusion](#conclusion)
5. [Shortcuts](#shortcuts)
6. [MCP GitHub Installation](#mcp-github-installation)

---

## 🧠 Introduction

During the development of **TaskFlow**, Cursor was used as an AI assistant to improve code quality, user experience and overall robustness.

Below are **two concrete examples** where Cursor contributed significant improvements.

---

## ✅ Example 1 — Reliability and structure improvements in `app.js`

### 🔍 Initial problem

The `app.js` file had several structural issues:

* Dependency on the global `event` object
* Duplicated `localStorage` save logic
* No error handling for `JSON.parse`
* Inconsistent behaviour on initial load
* Dead code (unused variables)

---

### ⚙️ Improvements applied

#### 1. Removing the global `event` dependency

Before:
```js
function filterTasks(filter) {
    event.target.classList.add("active");
}
```

After:
```js
function filterTasks(filter, ev) {
    const target = ev?.currentTarget || ev?.target;
    if (target) target.classList.add("active");
}
```

✔ Why it matters: compatible with strict mode, more robust and reusable.

---

#### 2. Centralising persistence with `saveTasks()`

Before:
```js
localStorage.setItem("tasks", JSON.stringify(tasks));
```

After:
```js
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
```

✔ Why it matters: avoids duplication and makes future changes (API calls, validation) easier.

---

#### 3. Safe `localStorage` parsing

Before:
```js
const tasks = JSON.parse(localStorage.getItem("tasks"));
```

After:
```js
let tasks = [];

try {
    const saved = JSON.parse(localStorage.getItem("tasks"));
    if (Array.isArray(saved)) tasks = saved;
} catch {
    tasks = [];
}
```

✔ Why it matters: prevents crashes if stored data is corrupted.

---

#### 4. Fixing the initial render flow

Before: only the calendar was rendered on first load.

After:
```js
renderTasks();
updateStats();
updateCriticalTasks();
```

✔ Why it matters: consistent state from the start, regardless of whether the user has tasks.

---

#### 5. Removing dead code

Unused variables (`today`, `setHours`) were removed.

✔ Why it matters: cleaner code, less confusion for future maintainers.

---

### 🎯 Result

* More maintainable codebase
* Fewer runtime errors
* Better foundation for scaling the project

---

## ✅ Example 2 — UX and critical tasks logic improvements

### 🔍 Initial problem

* No limit on the number of critical tasks shown
* Poor visual separation between task items
* Lack of contextual information for the user

---

### ⚙️ Improvements applied

#### 1. Limiting critical tasks displayed
```js
const CRITICAL_TASKS_MAX = 4;

const visibleTasks = criticalTasks
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, CRITICAL_TASKS_MAX);
```

✔ Why it matters: cleaner interface, avoids visual overload.

---

#### 2. Dynamic informational message
```js
criticalSummary.textContent =
    `These are your oldest critical tasks — ${criticalTasks.length} in total. Make sure to keep up ;)`;
```

✔ Why it matters: clear feedback for the user, improves sense of control.

---

#### 3. Visual improvement of the list
```css
#criticalList {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
```

✔ Why it matters: clear separation between items, better readability.

---

#### 4. Styling the summary message
```css
.critical-summary {
    background: var(--accent-dim);
    border-left: 3px solid var(--accent);
}
```

✔ Why it matters: visually reads as an important alert, improves hierarchy.

---

### 🎯 Result

* Cleaner and more usable interface
* Better user experience
* Information correctly prioritised

---

## 🧩 Conclusion

Cursor made it possible to:

* Detect important structural errors early
* Improve code organisation
* Increase application robustness
* Significantly raise the quality of the user experience

These improvements took the application from functional to **more professional, maintainable and scalable**.

---

## ⌨️ Shortcuts

Most used shortcuts:

| Shortcut | Action |
|---|---|
| `Tab` | Accept suggestion |
| `Ctrl + K` | Commands tab in terminal |
| `Ctrl + Shift + V` | Preview README layout |
| `Ctrl + S` | Save manually |
| `Ctrl + Z` | Undo last change |
| `Ctrl + Y` | Redo last change |
| `Ctrl + V` | Paste |
| `Ctrl + ç` | Coment line or selected text |
| `Ctrl + F` | Find text |

---

## 🔧 MCP GitHub Installation

### Prerequisites

You will need a GitHub personal access token. It is recommended to set an expiration date for security reasons.

To create one: GitHub → Settings → Developer settings → Personal access tokens → Generate new token. Give it `repo`, `read:org` and `read:user` permissions.

### Setup in Cursor

1. Open Cursor Settings and search for **MCP**, then select **Tools & MCP**
2. Click **Add new MCP Server**
3. This opens a `mcp.json` file where you configure the server:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Verify the connection

**Option 1 — Via Cursor Settings:** check that the GitHub MCP entry appears with a green dot.

**Option 2 — Via terminal:**
```bash
npx -y @modelcontextprotocol/server-github
```

Expected output:
```bash
GitHub MCP Server running on stdio
```
**Option 3 — Via the Agent:** ask it to list your repositories or create a new one. If it responds with real data, the connection is working.