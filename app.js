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
        'to-do': '#888780',
        'doing': '#3b82f6',
        'review': '#a855f7',
        'done': '#22c55e',
        'cancelled': '#ef4444'
    };

    const statusBg = {
        'to-do': 'var(--color-todo)',
        'doing': 'var(--color-doing)',
        'review': 'var(--color-review)',
        'done': 'var(--color-done)',
        'cancelled': 'var(--color-cancelled)'
    };

    let filtered = tasks.filter(t => {
        if (currentFilter === 'archived') {
            return t.status === 'done' || t.status === 'cancelled';
        }
        if (currentFilter === 'all') {
            return t.status !== 'done' && t.status !== 'cancelled';
        }
        if (currentFilter === 'done' || currentFilter === 'cancelled') {
            return false; // never show in these filters, only in archived
        }
        return t.status === currentFilter;
    })
    .filter(t => t.title.toLowerCase().includes(currentSearch));

    // Sort by deadline
    filtered.sort((a, b) => {
        const da = new Date(a.deadline);
        const db = new Date(b.deadline);
        return sortAscending ? da - db : db - da;
    });

    filtered.forEach(function(task) {
        const li = document.createElement("li");
        const color = statusColors[task.status] || '#888780';
        const stars = '⭐'.repeat(task.priority || 1);

        li.style.backgroundColor = statusBg[task.status] || 'var(--color-card)';
        li.classList.add(`status-${task.status}`);

        if (currentFilter === 'archived') {
            li.style.backgroundColor = 'var(--color-sidebar)';
            li.style.opacity = '0.7';
            li.querySelector('strong')
        }
        li.innerHTML = `
            <div class="task-main">
                <input type="checkbox" onchange="toggleComplete(${task.id})" ${task.completed ? "checked" : ""}>
                <div class="task-content">
                    <div class="task-top">
                        <strong>${task.title}</strong>
                        <span class="task-date">${task.deadline}</span>
                    </div>
                    <div class="task-meta">
                        <select onchange="changeStatus(${task.id}, this.value)" style="color: ${color}; font-weight: 500; border: none; background: transparent; cursor: pointer; font-size: 13px;">
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

    // Get values from form
    const title = document.getElementById("title").value;
    const deadline = document.getElementById("deadline").value;
    const status = document.getElementById("status").value;
    const assigned = document.getElementById("assigned").value;
    const priority = document.getElementById("priority").value;

    // Validate required fields
    const errorMessages = [];
    if (!title) errorMessages.push("- Task name is required");
    if (!deadline) errorMessages.push("- Deadline is required");
    if (!assigned) errorMessages.push("- Assigned person is required");

    if (errorMessages.length > 0) {
        alert("Please fill in the following fields:\n" + errorMessages.join("\n"));
        return;
    }

    // Create task object
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
    // Reset form after adding task
    document.getElementById("taskForm").reset();
    renderTasks();
    localStorage.setItem("tasks", JSON.stringify(tasks));
    console.log("Task added:", tasks);
});

// Cancel a task (move to cancelled instead of deleting)
function cancelTask(id) {
    tasks = tasks.map(function(task) {
        if (task.id === id) {
            task.status = 'cancelled';
            task.completed = false;
        }
        return task;
    });
    renderTasks();
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Mark a task as completed or not
function toggleComplete(id) {
    tasks = tasks.map(function(task) {
        if (task.id === id) {
            task.completed = !task.completed;
            task.status = task.completed ? 'done' : 'to-do';
        }
        return task;
    });
    renderTasks();
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Change task status directly from the list
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

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => t.status === 'doing' || t.status === 'review').length;
    const todo = tasks.filter(t => t.status === 'to-do').length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("numTotalTasks").textContent = "Total";
    document.getElementById("numTotalTasks").setAttribute("data-value", total);
    document.getElementById("numTaskCompleted").textContent = "Completed";
    document.getElementById("numTaskCompleted").setAttribute("data-value", completed);
    document.getElementById("numTaskInProgress").textContent = "In Progress";
    document.getElementById("numTaskInProgress").setAttribute("data-value", inProgress);
    document.getElementById("numTaskTodo").textContent = "To-do";
    document.getElementById("numTaskTodo").setAttribute("data-value", todo);
    document.getElementById("progressBar").style.width = percentage + "%";
    document.getElementById("progressLabel").textContent = percentage + "% completed";
}

// Update critical tasks (deadline in next 5 days)
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
        criticalList.innerHTML = "<li style='color: var(--color-text-muted); font-size: 13px;'>No critical tasks</li>";
        return;
    }

    critical.forEach(t => {
        const li = document.createElement("li");
        if (currentFilter === 'archived') {
            li.classList.add('archived-task');
        }
        const deadline = new Date(t.deadline);
        const isOverdue = deadline < today;
        li.textContent = `${isOverdue ? '⚠️' : '🔔'} ${t.title} — ${t.deadline}`;
        li.style.fontSize = "13px";
        li.style.color = isOverdue ? '#ef4444' : '#f59e0b';
        criticalList.appendChild(li);
    });
}

// Render simple calendar for current month
function renderCalendar() {
    const calendarBody = document.getElementById("calendarBody");
    if (!calendarBody) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get days that have tasks
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

// Search tasks by title
document.getElementById("search").addEventListener("input", function() {
    currentSearch = this.value.toLowerCase();
    renderTasks();
});

// Load tasks from LocalStorage on startup
const savedTasks = localStorage.getItem("tasks");
if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    renderTasks();
} else {
    renderCalendar();
}

// Dark mode toggle
function toggleDark() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    document.getElementById('darkToggle').textContent = isDark ? '☀️ Light mode' : '🌙 Dark mode';
}

// Load dark mode preference — default is dark
if (localStorage.getItem('darkMode') !== 'false') {
    document.documentElement.classList.add('dark');
    document.getElementById('darkToggle').textContent = '☀️ Light mode';
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('sidebarToggle');
    sidebar.classList.toggle('collapsed');
    btn.textContent = sidebar.classList.contains('collapsed') ? '→' : '←';
}

// Ascendin / Descending sort
function toggleSort() {
    sortAscending = !sortAscending;
    document.getElementById('sortBtn').textContent = sortAscending ? '↑↓' : '↓↑';
    renderTasks();
}

function cancelTask(id) {
    tasks = tasks.map(function(task) {
        if (task.id === id) {
            task.status = 'cancelled';
            task.completed = false;
        }
        return task;
    });
    renderTasks();
    localStorage.setItem("tasks", JSON.stringify(tasks));
}