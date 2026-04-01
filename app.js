// Array to store all tasks
let tasks = [];

let currentFilter = 'all';
let currentSearch = '';
let sortAscending = true;

// Filter tasks by status
function filterTasks(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderTasks();
}

// Render tasks in the DOM
function renderTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const statusColors = {
        'to-do': '#f5a623',
        'doing': '#3b82f6',
        'review': '#a855f7',
        'done': '#22c55e',
        'cancelled': '#ef4444',
        'archived': '#9a9a8e'
    };

    let filtered = tasks.filter(t => {
        if (currentFilter === 'archived') {
            return t.status === 'archived';
        }
        if (currentFilter === 'all') {
            return t.status !== 'archived';
        }
        return t.status === currentFilter;
    })
    .filter(t => t.title.toLowerCase().includes(currentSearch));

    filtered.sort((a, b) => {
        const da = new Date(a.deadline);
        const db = new Date(b.deadline);
        return sortAscending ? da - db : db - da;
    });

    filtered.forEach(function(task) {
        const li = document.createElement("li");
        const color = statusColors[task.status] || '#9a9a8e';
        const stars = '⭐'.repeat(task.priority || 1);

        li.classList.add(`status-${task.status}`);

        if (task.status === 'archived') {
            li.style.opacity = '0.65';
        }

        li.innerHTML = `
            <div class="task-main">
                <input type="checkbox" onchange="toggleComplete(${task.id})" ${task.status === 'archived' ? "checked" : ""}>
                <div class="task-content">
                    <div class="task-top">
                        <strong>${task.title}</strong>
                        <span class="task-date">${task.deadline}</span>
                    </div>
                    <div class="task-meta">
                        <select onchange="changeStatus(${task.id}, this.value)" style="color: ${color}; font-weight: 600; border: none; background: transparent; cursor: pointer; font-size: 12px; font-family: inherit;">
                            <option value="to-do" ${task.status === 'to-do' ? 'selected' : ''}>● To-do</option>
                            <option value="doing" ${task.status === 'doing' ? 'selected' : ''}>● Doing</option>
                            <option value="review" ${task.status === 'review' ? 'selected' : ''}>● Review</option>
                            <option value="done" ${task.status === 'done' ? 'selected' : ''}>● Done</option>
                            <option value="cancelled" ${task.status === 'cancelled' ? 'selected' : ''}>● Cancelled</option>
                        </select>
                    </div>
                    <div class="task-bottom">
                        <span class="task-stars">${stars}</span>
                        <span class="task-assigned">👤 ${task.assigned}</span>
                    </div>
                </div>
            </div>
            <button onclick="cancelTask(${task.id})" aria-label="Cancel task" class="task-cancel">🗑</button>
        `;
        taskList.appendChild(li);
    });

    updateStats();
    updateCriticalTasks();
    renderCalendar();
}

// Listen for form submission
document.getElementById("taskForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const deadline = document.getElementById("deadline").value;
    const status = document.getElementById("status").value;
    const assigned = document.getElementById("assigned").value;
    const priority = document.getElementById("priority").value;

    const errorMessages = [];
    if (!title) errorMessages.push("- Task name is required");
    if (!deadline) errorMessages.push("- Deadline is required");
    if (!assigned) errorMessages.push("- Assigned person is required");

    if (errorMessages.length > 0) {
        alert("Please fill in the following fields:\n" + errorMessages.join("\n"));
        return;
    }

    const task = {
        id: Date.now(),
        title: title,
        createdAt: new Date(),
        deadline: deadline,
        completed: false,
        status: status,
        assigned: assigned,
        priority: parseInt(priority),
        notes: "",
        tags: [],
        archived: false
    };

    tasks.push(task);
    document.getElementById("taskForm").reset();
    renderTasks();
    localStorage.setItem("tasks", JSON.stringify(tasks));
});

// Trash icon → delete permanently from localStorage
function cancelTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Checkbox → toggle archived status
function toggleComplete(id) {
    tasks = tasks.map(function(task) {
        if (task.id === id) {
            if (task.status === 'archived') {
                task.status = 'to-do';
                task.completed = false;
            } else {
                task.status = 'archived';
                task.completed = true;
            }
        }
        return task;
    });
    renderTasks();
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Change task status via dropdown
function changeStatus(id, newStatus) {
    tasks = tasks.map(function(task) {
        if (task.id === id) {
            task.status = newStatus;
            task.completed = newStatus === 'done';
        }
        return task;
    });
    renderTasks();
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Update statistics + donut chart
function updateStats() {
    const active = tasks.filter(t => t.status !== 'archived');
    const total = active.length;
    const completed = active.filter(t => t.status === 'done').length;
    const inProgress = active.filter(t => t.status === 'doing' || t.status === 'review').length;
    const todo = active.filter(t => t.status === 'to-do').length;
    const cancelled = active.filter(t => t.status === 'cancelled').length;

    document.getElementById("numTotalTasks").textContent = "Total";
    document.getElementById("numTotalTasks").setAttribute("data-value", total);
    document.getElementById("numTaskCompleted").textContent = "Completed";
    document.getElementById("numTaskCompleted").setAttribute("data-value", completed);
    document.getElementById("numTaskInProgress").textContent = "In Progress";
    document.getElementById("numTaskInProgress").setAttribute("data-value", inProgress);
    document.getElementById("numTaskTodo").textContent = "To-do";
    document.getElementById("numTaskTodo").setAttribute("data-value", todo);

    // Update donut center number
    const donutTotal = document.getElementById("donutTotal");
    if (donutTotal) donutTotal.textContent = total;

    // Update donut SVG segments
    updateDonut(todo, inProgress, completed, cancelled, total);
}

function updateDonut(todo, inProgress, done, cancelled, total) {
    const circumference = 2 * Math.PI * 60; // r=60 → ~377
    const gap = 2; // small gap between segments in px

    const segments = [
        { id: 'donutTodo', count: todo },
        { id: 'donutDoing', count: inProgress },
        { id: 'donutDone', count: done },
        { id: 'donutCancelled', count: cancelled },
    ];

    // Update track color
    const track = document.getElementById('donutTrack');
    if (track) {
        track.style.stroke = getComputedStyle(document.documentElement)
            .getPropertyValue('--border') || 'rgba(255,255,255,0.07)';
    }

    if (total === 0) {
        segments.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) el.setAttribute('stroke-dasharray', `0 ${circumference}`);
        });
        return;
    }

    let offset = 0;
    segments.forEach(s => {
        const el = document.getElementById(s.id);
        if (!el) return;
        const length = (s.count / total) * (circumference - gap * segments.filter(x => x.count > 0).length);
        if (s.count === 0) {
            el.setAttribute('stroke-dasharray', `0 ${circumference}`);
            el.setAttribute('stroke-dashoffset', '0');
        } else {
            el.setAttribute('stroke-dasharray', `${length} ${circumference - length}`);
            el.setAttribute('stroke-dashoffset', -offset);
            offset += length + gap;
        }
    });
}

// Update critical tasks
function updateCriticalTasks() {
    const criticalList = document.getElementById("criticalList");
    criticalList.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in5days = new Date();
    in5days.setDate(today.getDate() + 5);

    const critical = tasks.filter(t => {
        const deadline = new Date(t.deadline);
        return !t.completed &&
                t.status !== 'cancelled' &&
                t.status !== 'done' &&
                ((deadline >= today && deadline <= in5days) || deadline < today);
    });

    if (critical.length === 0) {
        criticalList.innerHTML = "<li style='color: var(--text-muted); font-size: 12px; background: none; border: none; box-shadow: none; padding: 6px 0;'>No critical tasks</li>";
        return;
    }

    critical.forEach(t => {
        const li = document.createElement("li");
        const deadline = new Date(t.deadline);
        const isOverdue = deadline < today;
        li.textContent = `${isOverdue ? '⚠️' : '🔔'} ${t.title} — ${t.deadline}`;
        li.style.fontSize = "12px";
        li.style.color = isOverdue ? '#ef4444' : '#f5a623';
        li.style.background = isOverdue ? 'rgba(239,68,68,0.08)' : 'rgba(245,166,35,0.08)';
        li.style.border = isOverdue ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,166,35,0.2)';
        li.style.fontWeight = '500';
        criticalList.appendChild(li);
    });
}

// Render calendar
function renderCalendar() {
    const calendarBody = document.getElementById("calendarBody");
    if (!calendarBody) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const taskDays = new Set(tasks.map(t => {
        const d = new Date(t.deadline);
        if (d.getFullYear() === year && d.getMonth() === month) {
            return d.getDate();
        }
        return null;
    }).filter(Boolean));

    const monthNames = ["January","February","March","April","May","June",
        "July","August","September","October","November","December"];
    const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];

    let html = `<div class="cal-month">${monthNames[month]} ${year}</div>`;
    html += `<div class="cal-grid">`;

    dayNames.forEach(d => {
        html += `<div class="cal-day-name">${d}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="cal-day empty"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === now.getDate();
        const hasTask = taskDays.has(d);
        html += `<div class="cal-day ${isToday ? 'today' : ''} ${hasTask ? 'has-task' : ''}">${d}</div>`;
    }

    html += `</div>`;
    calendarBody.innerHTML = html;
}

// Search
document.getElementById("search").addEventListener("input", function() {
    currentSearch = this.value.toLowerCase();
    renderTasks();
});

// Load from localStorage
const savedTasks = localStorage.getItem("tasks");
if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    renderTasks();
} else {
    renderCalendar();
}

// Dark/Light mode toggle — smooth animated version
function toggleDark() {
    const html = document.documentElement;
    // Add transition class, toggle, remove after animation
    html.classList.add('theme-transitioning');
    const isNowLight = html.classList.toggle('light');
    localStorage.setItem('taskflow-theme', isNowLight ? 'light' : 'dark');
    updateToggleLabel();
    // Remove transition class after transition completes
    setTimeout(() => html.classList.remove('theme-transitioning'), 500);
    // Re-render donut track (border color changes)
    setTimeout(() => updateStats(), 50);
}

function updateToggleLabel() {
    const isLight = document.documentElement.classList.contains('light');
    const btn = document.getElementById('darkToggle');
    if (btn) btn.textContent = isLight ? '🌙 Dark mode' : '☀️ Light mode';
}

// Load saved theme — default is dark
(function() {
    const saved = localStorage.getItem('taskflow-theme');
    if (saved === 'light') {
        document.documentElement.classList.add('light');
    } else {
        document.documentElement.classList.remove('light');
    }
    updateToggleLabel();
})();

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('sidebarToggle');
    sidebar.classList.toggle('collapsed');
    btn.textContent = sidebar.classList.contains('collapsed') ? '→' : '←';
}

// Sort toggle
function toggleSort() {
    sortAscending = !sortAscending;
    document.getElementById('sortBtn').textContent = sortAscending ? '↑↓' : '↓↑';
    renderTasks();
}