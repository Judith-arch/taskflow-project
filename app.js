// Array to store all tasks
let tasks = [];

let currentFilter = 'all';
let currentSearch = '';
let sortAscending = true;

const CRITICAL_TASKS_MAX = 4;

const LS_SKIP_DELETE_CONFIRM = 'taskflow-skip-delete-confirm';
const LS_SKIP_ARCHIVE_CONFIRM = 'taskflow-skip-archive-confirm';

function confirmAction(options) {
    return new Promise(function(resolve) {
        if (localStorage.getItem(options.skipKey) === '1') {
            resolve(true);
            return;
        }
        const overlay = document.getElementById('confirmOverlay');
        const titleEl = document.getElementById('confirmTitle');
        const msgEl = document.getElementById('confirmMessage');
        const skipEl = document.getElementById('confirmSkip');
        const okBtn = document.getElementById('confirmOk');
        const cancelBtn = document.getElementById('confirmCancel');

        titleEl.textContent = options.title;
        msgEl.textContent = options.message;
        okBtn.textContent = options.confirmLabel || 'Confirm';
        skipEl.checked = false;

        function cleanup() {
            overlay.hidden = true;
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('confirm-modal-open');
            document.removeEventListener('keydown', onKey);
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            overlay.removeEventListener('click', onBackdrop);
        }

        function onOk() {
            if (skipEl.checked) localStorage.setItem(options.skipKey, '1');
            cleanup();
            resolve(true);
        }

        function onCancel() {
            cleanup();
            resolve(false);
        }

        function onKey(e) {
            if (e.key === 'Escape') onCancel();
        }

        function onBackdrop(e) {
            if (e.target === overlay) onCancel();
        }

        overlay.hidden = false;
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('confirm-modal-open');
        document.addEventListener('keydown', onKey);
        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
        overlay.addEventListener('click', onBackdrop);
        okBtn.focus();
    });
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Filter tasks by status
function filterTasks(filter, ev) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const btn = ev && (ev.currentTarget || ev.target);
    if (btn && btn.classList) btn.classList.add('active');
    renderTasks();
}

// Render tasks in the DOM
function renderTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

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
                <input type="checkbox" onchange="toggleComplete(${task.id}, this)" ${task.status === 'archived' ? "checked" : ""}>
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
    saveTasks();
});

// Trash icon → delete permanently from localStorage
async function cancelTask(id) {
    const ok = await confirmAction({
        title: 'Delete task',
        message: 'Delete this task? This cannot be undone.',
        skipKey: LS_SKIP_DELETE_CONFIRM,
        confirmLabel: 'Delete'
    });
    if (!ok) return;
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
    saveTasks();
}

// Checkbox → toggle archived status
async function toggleComplete(id, checkbox) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.status === 'archived') {
        tasks = tasks.map(function(t) {
            if (t.id === id) {
                t.status = 'to-do';
                t.completed = false;
            }
            return t;
        });
    } else {
        const confirmed = await confirmAction({
            title: 'Archive task',
            message:
                'Archive this task? It will be marked as done and counted in your completed statistics.',
            skipKey: LS_SKIP_ARCHIVE_CONFIRM,
            confirmLabel: 'Archive'
        });
        if (!confirmed) {
            if (checkbox) checkbox.checked = false;
            return;
        }
        tasks = tasks.map(function(t) {
            if (t.id === id) {
                t.status = 'archived';
                t.completed = true;
            }
            return t;
        });
    }
    renderTasks();
    saveTasks();
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
    saveTasks();
}

// Update statistics + donut chart (all tasks; archived count as completed / “done” slice)
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(
        t => t.status === 'done' || t.status === 'archived'
    ).length;
    const inProgress = tasks.filter(
        t => t.status === 'doing' || t.status === 'review'
    ).length;
    const todo = tasks.filter(t => t.status === 'to-do').length;
    const cancelled = tasks.filter(t => t.status === 'cancelled').length;

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

const DONUT_SEGMENT_STROKE = {
    donutTodo: '#f5a623',
    donutDoing: '#3b82f6',
    donutDone: '#22c55e',
    donutCancelled: '#ef4444'
};

function updateDonut(todo, inProgress, done, cancelled, total) {
    const circumference = 2 * Math.PI * 60; // r=60 → ~377
    const gap = 2; // small gap between segments in px

    const segments = [
        { id: 'donutTodo', count: todo },
        { id: 'donutDoing', count: inProgress },
        { id: 'donutDone', count: done },
        { id: 'donutCancelled', count: cancelled }
    ];

    // Update track color
    const track = document.getElementById('donutTrack');
    if (track) {
        track.style.stroke = getComputedStyle(document.documentElement)
            .getPropertyValue('--border') || 'rgba(255,255,255,0.07)';
    }

    function hideSegment(el) {
        if (!el) return;
        el.setAttribute('stroke-dasharray', `0 ${circumference}`);
        el.setAttribute('stroke-dashoffset', '0');
        el.setAttribute('stroke', 'none');
    }

    function showSegment(el, color) {
        if (!el) return;
        el.setAttribute('stroke', color);
    }

    if (total === 0) {
        segments.forEach(s => hideSegment(document.getElementById(s.id)));
        return;
    }

    let offset = 0;
    const nonZeroCount = segments.filter(x => x.count > 0).length;
    const arcBudget = circumference - gap * nonZeroCount;
    segments.forEach(s => {
        const el = document.getElementById(s.id);
        if (!el) return;
        const color = DONUT_SEGMENT_STROKE[s.id];
        if (s.count === 0) {
            hideSegment(el);
            return;
        }
        showSegment(el, color);
        const length = (s.count / total) * arcBudget;
        el.setAttribute('stroke-dasharray', `${length} ${circumference - length}`);
        el.setAttribute('stroke-dashoffset', String(-offset));
        offset += length + gap;
    });
}

// Update critical tasks
function updateCriticalTasks() {
    const criticalList = document.getElementById("criticalList");
    const summaryEl = document.getElementById("criticalSummary");
    criticalList.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in5days = new Date();
    in5days.setDate(today.getDate() + 5);

    const critical = tasks.filter(t => {
        const deadline = new Date(t.deadline);
        return !t.completed &&
                t.status !== 'archived' &&
                t.status !== 'cancelled' &&
                t.status !== 'done' &&
                ((deadline >= today && deadline <= in5days) || deadline < today);
    });

    if (critical.length === 0) {
        if (summaryEl) {
            summaryEl.hidden = true;
            summaryEl.textContent = "";
        }
        criticalList.innerHTML = "<li style='color: var(--text-muted); font-size: 12px; background: none; border: none; box-shadow: none; padding: 6px 0;'>No critical tasks</li>";
        return;
    }

    critical.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const totalCritical = critical.length;
    const toShow = critical.slice(0, CRITICAL_TASKS_MAX);

    if (summaryEl) {
        if (totalCritical > CRITICAL_TASKS_MAX) {
            summaryEl.hidden = false;
            summaryEl.textContent =
                "These are your oldest critical tasks — " +
                totalCritical +
                " in total. Make sure to keep up ;)";
        } else {
            summaryEl.hidden = true;
            summaryEl.textContent = "";
        }
    }

    toShow.forEach(t => {
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
    try {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) {
            tasks = parsed.map(t => {
                if (t && t.status === 'archived') t.completed = true;
                return t;
            });
        }
    } catch (e) {
        tasks = [];
    }
}
renderTasks();

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