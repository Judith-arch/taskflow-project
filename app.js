// ============================================================
//  TaskFlow — app.js
// ============================================================

/** @type {Array<Object>} Main tasks array */
let tasks = [];

/** @type {string} Current active filter */
let currentFilter = 'all';

/** @type {string} Current search query */
let currentSearch = '';

/** @type {boolean} Sort direction — true = ascending */
let sortAscending = true;

const CRITICAL_TASKS_MAX = 4;
const LS_SKIP_DELETE_CONFIRM  = 'taskflow-skip-delete-confirm';
const LS_SKIP_ARCHIVE_CONFIRM = 'taskflow-skip-archive-confirm';

// ── Confirm dialog ──────────────────────────────────────────

/**
 * Shows a confirmation dialog and returns a promise that resolves
 * to true (confirmed) or false (cancelled).
 * If the user previously checked "don't show again", resolves immediately.
 * @param {Object} options
 * @param {string} options.title - Dialog title
 * @param {string} options.message - Dialog body message
 * @param {string} options.skipKey - localStorage key to skip dialog
 * @param {string} [options.confirmLabel='Confirm'] - Label for the confirm button
 * @returns {Promise<boolean>}
 */
function confirmAction(options) {
    return new Promise(function(resolve) {
        if (localStorage.getItem(options.skipKey) === '1') { resolve(true); return; }

        const overlay   = document.getElementById('confirmOverlay');
        const titleEl   = document.getElementById('confirmTitle');
        const msgEl     = document.getElementById('confirmMessage');
        const skipEl    = document.getElementById('confirmSkip');
        const okBtn     = document.getElementById('confirmOk');
        const cancelBtn = document.getElementById('confirmCancel');

        titleEl.textContent   = options.title;
        msgEl.textContent     = options.message;
        okBtn.textContent     = options.confirmLabel || 'Confirm';
        skipEl.checked        = false;

        function cleanup() {
            overlay.hidden = true;
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('confirm-modal-open');
            document.removeEventListener('keydown', onKey);
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            overlay.removeEventListener('click', onBackdrop);
        }
        function onOk()        { if (skipEl.checked) localStorage.setItem(options.skipKey, '1'); cleanup(); resolve(true); }
        function onCancel()    { cleanup(); resolve(false); }
        function onKey(e)      { if (e.key === 'Escape') onCancel(); }
        function onBackdrop(e) { if (e.target === overlay) onCancel(); }

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

/**
 * Persists the current tasks array to localStorage.
 */
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ── Filter ──────────────────────────────────────────────────

/**
 * Sets the active filter and re-renders the task list.
 * @param {string} filter - Status filter value (e.g. 'all', 'to-do', 'done')
 * @param {Event} ev - Click event from the filter button
 */
function filterTasks(filter, ev) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const btn = ev && (ev.currentTarget || ev.target);
    if (btn && btn.classList) btn.classList.add('active');
    renderTasks();
}

// ── Render tasks ────────────────────────────────────────────

/**
 * Filters, sorts and renders all task cards into the DOM.
 * Also triggers stats, critical tasks and calendar updates.
 */
function renderTasks() {

    // Save which task details panels are open before re-rendering
    const openDetails = new Set(
        [...document.querySelectorAll('.subtask-details[open]')]
            .map(el => el.closest('li')?.dataset.taskId)
            .filter(Boolean)
    );

    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    const statusColors = {
        'to-do':     'var(--accent)',
        'doing':     'var(--blue)',
        'review':    'var(--purple)',
        'done':      'var(--green)',
        'cancelled': 'var(--red)',
        'archived':  'var(--text-muted)'
    };

    const filtered = getFilteredTasks();

    const empty = document.getElementById('emptyState');
    if (empty) empty.hidden = filtered.length > 0;

    const sorted = [...filtered].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;  // pinned task up
        if (!a.pinned && b.pinned) return 1;
        return 0;
    });

    sorted.forEach(task => {
        const li    = document.createElement('li');
        li.dataset.taskId = task.id; 
        const color = statusColors[task.status] || 'var(--text-muted)';
        const stars = '⭐'.repeat(task.priority || 1);
    
        li.classList.add(`status-${task.status}`);
        if (task.pinned) li.classList.add('pinned-task');
        li.innerHTML = buildTaskHTML(task, color, stars, task.pinned); // includes pinned
        taskList.appendChild(li);
    });

    // Restore open state of subtask panels
    document.querySelectorAll('li[data-task-id]').forEach(li => {
        if (openDetails.has(li.dataset.taskId)) {
            const det = li.querySelector('.subtask-details');
            if (det) det.open = true;
        }
    });

    updateStats();
    updateCriticalTasks();
    renderCalendar();
}

// function to pin a task
function togglePin(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.pinned = !task.pinned;
    renderTasks();
    saveTasks();
}

/**
 * Returns the filtered and sorted subset of tasks based on
 * the current filter and search query.
 * @returns {Array<Object>}
 */
function getFilteredTasks() {
    return tasks
        .filter(t => {
            if (currentFilter === 'archived') return t.status === 'archived';
            if (currentFilter === 'all')      return t.status !== 'archived';
            return t.status === currentFilter;
        })
        .filter(t => t.title.toLowerCase().includes(currentSearch))
        .sort((a, b) => {
            const da = new Date(a.deadline), db = new Date(b.deadline);
            return sortAscending ? da - db : db - da;
        });
}

/**
 * Builds the inner HTML string for a task list item.
 * @param {Object} task - Task object
 * @param {string} color - CSS color string for the status dropdown
 * @param {string} stars - Star emoji string representing priority
 * @returns {string} HTML string
 */
function buildTaskHTML(task, color, stars, pinned = false) {
    return `
        <div class="task-main">
            <input type="checkbox" onchange="toggleComplete(${task.id}, this)"
                ${task.status === 'archived' ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-top">
                    <strong id="title-${task.id}" ondblclick="editTitle(${task.id})" style="cursor:text">${task.title}</strong>
                    <span class="task-date">${task.deadline}</span>
                    <button class="pin-btn ${pinned ? 'active' : ''}" onclick="togglePin(${task.id})">📌</button>
                </div>
                <div class="task-meta">
                    <select onchange="changeStatus(${task.id}, this.value)"
                        style="color:${color};font-weight:600;border:none;background:transparent;cursor:pointer;font-size:12px;font-family:inherit;">
                        <option value="to-do"     ${task.status==='to-do'     ?'selected':''}>● To-do</option>
                        <option value="doing"     ${task.status==='doing'     ?'selected':''}>● Doing</option>
                        <option value="review"    ${task.status==='review'    ?'selected':''}>● Review</option>
                        <option value="done"      ${task.status==='done'      ?'selected':''}>● Done</option>
                        <option value="cancelled" ${task.status==='cancelled' ?'selected':''}>● Cancelled</option>
                    </select>
                </div>
                <div class="task-bottom">
                    <span class="task-stars">${stars}</span>
                    <span class="task-assigned">👤 ${task.assigned}</span>
                </div>
            </div>
            <button onclick="cancelTask(${task.id})" aria-label="Delete task" class="task-cancel">🗑</button>
        </div>
        ${buildSubtasksHTML(task)}`;
}
        
function buildSubtasksHTML(task) {
    if (!task.subtasks || task.subtasks.length === 0) return '';
    const done  = task.subtasks.filter(s => s.done).length;
    const total = task.subtasks.length;

    return `
        <details class="subtask-details">
            <summary class="subtask-summary">
                <span>Subtasks</span>
                <span class="subtask-count">${done}/${total}</span>
            </summary>
            <ul class="subtask-list">
                ${task.subtasks.map(s => `
                    <li class="subtask-item ${s.done ? 'subtask-done' : ''}">
                        <input type="checkbox" ${s.done ? 'checked' : ''}
                            onchange="toggleSubtask(${task.id}, ${s.id}, this)">
                        <span ondblclick="editSubtask(${task.id}, ${s.id}, this)">${s.title}</span>
                        <button type="button" onclick="deleteSubtask(${task.id}, ${s.id})"
                            class="subtask-delete">✕</button>
                    </li>`).join('')}
                <li class="subtask-add-row">
                    <input type="text" class="subtask-inline-input"
                        placeholder="Add subtask…"
                        onkeydown="addInlineSubtask(event, ${task.id})">
                </li>
            </ul>
        </details>`;
}

// ── Subtasks form input ───────────────────────────────────

let pendingSubtasks = [];

// Show/hide subtask input based on checkbox
document.getElementById('hasSubtasks').addEventListener('change', function() {
    document.getElementById('subtasksField').style.display = this.checked ? 'block' : 'none';
    if (!this.checked) {
        pendingSubtasks = [];
        renderPendingSubtasks();
    }
});

// Add subtask on Enter
document.getElementById('subtasksInput').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const val = e.target.value.trim();
    if (!val) return;
    pendingSubtasks.push({ id: Date.now(), title: val, done: false });
    e.target.value = '';
    renderPendingSubtasks();
});

function renderPendingSubtasks() {
    let list = document.getElementById('pendingSubtasksList');
    if (!list) {
        list = document.createElement('ul');
        list.id = 'pendingSubtasksList';
        list.style.cssText = 'list-style:none;padding:0;margin:6px 0 0;display:flex;flex-direction:column;gap:4px;';
        document.getElementById('subtasksInput').insertAdjacentElement('afterend', list);
    }
    list.innerHTML = pendingSubtasks.map((s, i) => `
        <li style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-subtle);">
            <span style="flex:1">· ${s.title}</span>
            <button type="button" onclick="removePendingSubtask(${i})"
                style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:11px;">✕</button>
        </li>`).join('');
}

function removePendingSubtask(index) {
    pendingSubtasks.splice(index, 1);
    renderPendingSubtasks();
}

// ── Form submit ─────────────────────────────────────────────

document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const title    = document.getElementById('title').value.trim();
    const deadline = document.getElementById('deadline').value;
    const status   = document.getElementById('status').value;
    const assigned = document.getElementById('assigned').value.trim();
    const priority = document.getElementById('priority').value;

    const errs = [];
    if (!title)    errs.push('- Task name is required');
    if (!deadline) errs.push('- Deadline is required');
    if (!assigned) errs.push('- Assigned person is required');
    if (errs.length) { alert('Please fill in:\n' + errs.join('\n')); return; }

    // Add task
    tasks.push({
        id: Date.now(), 
        title, 
        createdAt: new Date(),
        deadline, 
        completed: false, 
        pinned: false,
        status, 
        assigned,
        priority: parseInt(priority), 
        notes: '', // future use
        tags: [], // future use
        archived: false,
        subtasks: [...pendingSubtasks] 
    });
    pendingSubtasks = [];               // ← limpiar después del push
    renderPendingSubtasks();            // ← limpiar la lista visual
    document.getElementById('hasSubtasks').checked = false;        // ← añadir
    document.getElementById('subtasksField').style.display = 'none'; // ← añadir

    document.getElementById('taskForm').reset();
    renderTasks();
    saveTasks();

    // Scroll back to top of task list after adding
    document.getElementById('taskList').scrollTo({ top: 0, behavior: 'smooth' });

    showFlash();
});

function showFlash(message = "¡Tarea añadida!") {
    // Create div each time
    const flash = document.createElement('div');
    flash.textContent = message;

    // Style
    Object.assign(flash.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%) translateY(-20px)',
        backgroundColor: '#4caf50',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '5px',
        fontWeight: '600',
        opacity: '0',
        zIndex: '9999',
        transition: 'opacity 0.3s, transform 0.3s'
    });

    // Add to body
    document.body.appendChild(flash);

    // Animation
    requestAnimationFrame(() => {
        flash.style.opacity = '1';
        flash.style.transform = 'translateX(-50%) translateY(0)';
    });
    // Disapears after 1.2 s
    setTimeout(() => {
        flash.style.opacity = '0';
        flash.style.transform = 'translateX(-50%) translateY(-20px)';
        flash.addEventListener('transitionend', () => flash.remove(), { once: true });
    }, 1200);
}

// edit title
function editTitle(id) {
    const el = document.getElementById('title-' + id);
    if (!el || el.tagName === 'INPUT') return;
    const original = el.textContent;

    const input = document.createElement('input');
    input.value = original;
    input.style.cssText = 'font-size:inherit;font-weight:600;font-family:inherit;border:1px solid var(--accent);border-radius:4px;padding:1px 6px;background:var(--bg);color:inherit;outline:none;box-shadow:0 0 0 3px rgba(212,144,58,0.15);min-width:60px;';
    el.replaceWith(input);

    // Mide el texto con un span espejo
    function measureText(text) {
        const ruler = document.createElement('span');
        ruler.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font-size:inherit;font-weight:600;font-family:inherit;padding:1px 6px;';
        ruler.textContent = text || ' ';
        document.body.appendChild(ruler);
        const w = ruler.offsetWidth + 4;
        ruler.remove();
        return w;
    }

    input.style.width = measureText(original) + 'px';
    input.addEventListener('input', () => {
        input.style.width = measureText(input.value) + 'px';
    });

    input.focus();
    input.select();

    function save() {
        const trimmed = input.value.trim();
        if (!trimmed) {
            input.style.borderColor = 'var(--red)';
            input.focus(); return;
        }
        const task = tasks.find(t => t.id === id);
        if (task) task.title = trimmed;
        saveTasks(); renderTasks();
    }
    function cancel() {
        renderTasks();
    }

    input.addEventListener('blur', e => { if (!e.relatedTarget) save(); });
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter')  { e.preventDefault(); save(); }
        if (e.key === 'Escape') { e.preventDefault(); cancel(); }
        input.style.borderColor = '';
    });
}

// ── Delete ──────────────────────────────────────────────────

/**
 * Prompts for confirmation and permanently deletes a task.
 * @param {number} id - Task ID
 */
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

// ── Archive / unarchive ─────────────────────────────────────

/**
 * Toggles a task between archived and to-do.
 * Archiving requires confirmation. Unarchiving is instant.
 * @param {number} id - Task ID
 * @param {HTMLInputElement} checkbox - The checkbox element that triggered the change
 */
async function toggleComplete(id, checkbox) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.status === 'archived') {
        tasks = tasks.map(t => t.id === id ? { ...t, status: 'to-do', completed: false } : t);
    } else {
        const ok = await confirmAction({
            title: 'Archive task',
            message: 'Archive this task? It will be counted as completed.',
            skipKey: LS_SKIP_ARCHIVE_CONFIRM,
            confirmLabel: 'Archive'
        });
        if (!ok) { if (checkbox) checkbox.checked = false; return; }
        tasks = tasks.map(t => t.id === id ? { ...t, status: 'archived', completed: true } : t);
    }
    renderTasks();
    saveTasks();
}

// ── Status dropdown ─────────────────────────────────────────

/**
 * Updates a task's status from the inline dropdown.
 * @param {number} id - Task ID
 * @param {string} newStatus - New status value
 */
function changeStatus(id, newStatus) {
    tasks = tasks.map(t => t.id === id
        ? { ...t, status: newStatus, completed: newStatus === 'done' }
        : t
    );
    renderTasks();
    saveTasks();
}

// ── Stats ────────────────────────────────────────────────────

/**
 * Calculates task counts and percentages from the current tasks array.
 * @returns {{total: number, completed: number, inProgress: number, todo: number, cancelled: number, archived: number, overdue: number, pct: number}}
 */
function calcStats() {
    const total      = tasks.length;
    const completed  = tasks.filter(t => t.status === 'done' || t.status === 'archived').length;
    const inProgress = tasks.filter(t => t.status === 'doing' || t.status === 'review').length;
    const todo       = tasks.filter(t => t.status === 'to-do').length;
    const cancelled  = tasks.filter(t => t.status === 'cancelled').length;
    const archived   = tasks.filter(t => t.status === 'archived').length;
    const overdue    = tasks.filter(t => {
        if (['archived', 'done', 'cancelled'].includes(t.status)) return false;
        return new Date(t.deadline) < new Date(new Date().toDateString());
    }).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, inProgress, todo, cancelled, archived, overdue, pct };
}

/**
 * Updates the four stat cards in the overview section.
 * @param {{total: number, completed: number, inProgress: number, todo: number}} stats
 */
function updateStatCards({ total, completed, inProgress, todo }) {
    const set = (id, label, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = label;
        el.setAttribute('data-value', value);
    };
    set('numTotalTasks',     'Total',       total);
    set('numTaskCompleted',  'Completed',   completed);
    set('numTaskInProgress', 'In Progress', inProgress);
    set('numTaskTodo',       'To-do',       todo);
}

/**
 * Updates the linear progress bar and percentage label.
 * @param {number} pct - Completion percentage (0–100)
 */
function updateProgressBar(pct) {
    const bar = document.getElementById('progressLinearBar');
    const lbl = document.getElementById('progressPct');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = pct + '%';
}

/**
 * Updates the overdue and archived insight rows below the progress bar.
 * @param {{overdue: number, archived: number, total: number}} stats
 */
function updateInsights({ overdue, archived, total }) {
    const insightOverdue  = document.getElementById('insightOverdue');
    const insightArchived = document.getElementById('insightArchived');

    if (insightOverdue) {
        if (overdue > 0) {
            insightOverdue.textContent  = `⚠ ${overdue} overdue`;
            insightOverdue.className    = 'insight-row is-warning';
        } else {
            insightOverdue.textContent  = total > 0 ? '✓ None overdue' : '';
            insightOverdue.className    = 'insight-row is-ok';
        }
    }
    if (insightArchived) {
        insightArchived.textContent = archived > 0 ? `${archived} archived` : '';
        insightArchived.className   = 'insight-row';
    }
}

/**
 * Orchestrates all statistics updates: cards, donut, progress bar,
 * insights and header pills.
 */
function updateStats() {
    const stats = calcStats();
    const { total, completed, inProgress, todo, cancelled, archived, overdue, pct } = stats;

    const donutTotal = document.getElementById('donutTotal');
    if (donutTotal) donutTotal.textContent = total;

    updateStatCards({ total, completed, inProgress, todo });
    updateProgressBar(pct);
    updateInsights({ overdue, archived, total });
    updateHeaderPills({ todo, inProgress, completed, total });
    updateDonut(todo, inProgress, completed, cancelled, total);
}

/**
 * Updates the quick-stat pills in the main header.
 * @param {{todo: number, inProgress: number, completed: number, total: number}} stats
 */
function updateHeaderPills() { /* pills removed */ }

// ── Donut chart ──────────────────────────────────────────────

const DONUT_COLORS = {
    donutTodo:      '#d4903a',
    donutDoing:     '#6a9fd8',
    donutDone:      '#4caf72',
    donutCancelled: '#f06040'
};

/**
 * Renders the SVG donut chart based on current task counts.
 * @param {number} todo
 * @param {number} inProgress
 * @param {number} done
 * @param {number} cancelled
 * @param {number} total
 */
function updateDonut(todo, inProgress, done, cancelled, total) {
    const circ = 2 * Math.PI * 80;
    const gap  = 3;
    const segs = [
        { id: 'donutTodo',      count: todo },
        { id: 'donutDoing',     count: inProgress },
        { id: 'donutDone',      count: done },
        { id: 'donutCancelled', count: cancelled }
    ];

    const track = document.getElementById('donutTrack');
    if (track) {
        track.style.stroke = getComputedStyle(document.documentElement)
            .getPropertyValue('--border').trim() || 'rgba(191,132,64,0.18)';
    }

    const nonZero   = segs.filter(s => s.count > 0).length;
    const arcBudget = circ - gap * nonZero;
    let offset = 0;

    segs.forEach(s => {
        const el = document.getElementById(s.id);
        if (!el) return;
        if (s.count === 0 || total === 0) {
            el.setAttribute('stroke-dasharray', `0 ${circ}`);
            el.setAttribute('stroke', 'none');
            return;
        }
        const len = (s.count / total) * arcBudget;
        el.setAttribute('stroke', DONUT_COLORS[s.id]);
        el.setAttribute('stroke-dasharray', `${len} ${circ - len}`);
        el.setAttribute('stroke-dashoffset', String(-offset));
        offset += len + gap;
    });
}

// ── Critical tasks ───────────────────────────────────────────

/**
 * Renders the critical tasks panel with tasks that are overdue
 * or due within the next 5 days.
 */
function updateCriticalTasks() {
    const criticalList = document.getElementById('criticalList');
    const summaryEl    = document.getElementById('criticalSummary');
    criticalList.innerHTML = '';

    const today   = new Date(); today.setHours(0,0,0,0);
    const in5days = new Date(); in5days.setDate(today.getDate() + 5);

    const critical = tasks
        .filter(t => {
            const dl = new Date(t.deadline);
            return !t.completed
                && !['archived', 'cancelled', 'done'].includes(t.status)
                && (dl < today || (dl >= today && dl <= in5days));
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (critical.length === 0) {
        if (summaryEl) { summaryEl.hidden = true; summaryEl.textContent = ''; }
        criticalList.innerHTML = "<li style='color:var(--text-muted);font-size:12px;background:none;border:none;box-shadow:none;padding:6px 0;'>No critical tasks 🎉</li>";
        return;
    }

    if (summaryEl) {
        const badgeEl = document.getElementById('criticalBadge');
        if (badgeEl) {
            badgeEl.hidden = false;
            badgeEl.textContent = `${Math.min(critical.length, CRITICAL_TASKS_MAX)} of ${critical.length}`;
        }
        summaryEl.hidden = true; // badge already shows the count
    }

    critical.slice(0, CRITICAL_TASKS_MAX).forEach(t => {
        const li        = document.createElement('li');
        const isOverdue = new Date(t.deadline) < today;
        li.classList.add(isOverdue ? 'critical-item--overdue' : 'critical-item--upcoming');
        li.textContent = `${isOverdue ? '⚠️' : '🔔'} ${t.title} — ${t.deadline}`;
        criticalList.appendChild(li);
    });
}

// ── Calendar ─────────────────────────────────────────────────

/**
 * Renders the current month calendar, marking days that have task deadlines.
 */
function renderCalendar() {
    const calendarBody = document.getElementById('calendarBody');
    if (!calendarBody) return;

    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth();

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const taskDays = new Set(
        tasks
            .map(t => {
                const d = new Date(t.deadline);
                return (d.getFullYear() === year && d.getMonth() === month) ? d.getDate() : null;
            })
            .filter(Boolean)
    );

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayNames   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

    let html = `<div class="cal-month">${monthNames[month]} ${year}</div><div class="cal-grid">`;
    dayNames.forEach(d => { html += `<div class="cal-day-name">${d}</div>`; });
    for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === now.getDate();
        const hasTask = taskDays.has(d);
        html += `<div class="cal-day ${isToday ? 'today' : ''} ${hasTask ? 'has-task' : ''}">${d}</div>`;
    }
    html += '</div>';
    calendarBody.innerHTML = html;
}

// ── Search ───────────────────────────────────────────────────

document.getElementById('search').addEventListener('input', function() {
    currentSearch = this.value.toLowerCase();
    renderTasks();
});

// ── Load from localStorage ───────────────────────────────────

const savedTasks = localStorage.getItem('tasks');
if (savedTasks) {
    try {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) {
            tasks = parsed.map(t => {
                if (t && t.status === 'archived') t.completed = true;
                return t;
            });
        }
    } catch(e) { tasks = []; }
}
renderTasks();

// ── Dark / Light toggle ──────────────────────────────────────

/**
 * Toggles between dark and light theme, persists the choice
 * and smoothly transitions all colors.
 */
function toggleDark() {
    const html = document.documentElement;
    html.classList.add('theme-transitioning');
    const isNowLight = html.classList.toggle('light');
    localStorage.setItem('taskflow-theme', isNowLight ? 'light' : 'dark');
    updateToggleLabel();
    setTimeout(() => html.classList.remove('theme-transitioning'), 500);
    setTimeout(() => updateStats(), 50);
}

/**
 * Updates the dark/light toggle button label to reflect the current theme.
 */
function updateToggleLabel() {
    const isLight = document.documentElement.classList.contains('light');
    const btn = document.getElementById('darkToggle');
    if (btn) btn.textContent = isLight ? '🌙 Dark mode' : '☀️ Light mode';
}

// Load saved theme on startup — default is dark
(function() {
    const saved = localStorage.getItem('taskflow-theme');
    if (saved === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    updateToggleLabel();
})();

// ── Sort ─────────────────────────────────────────────────────

/**
 * Toggles the sort direction and re-renders the task list.
 */
function toggleSort() {
    sortAscending = !sortAscending;
    document.getElementById('sortBtn').textContent = sortAscending ? '↑↓' : '↓↑';
    renderTasks();
}

function toggleExportMenu() {
    document.getElementById('exportMenu').classList.toggle('open');
}

// Cerrar si se hace click fuera
document.addEventListener('click', e => {
    if (!e.target.closest('.export-dropdown')) {
        document.getElementById('exportMenu')?.classList.remove('open');
    }
});

// to export the list to pdf
function exportToPDF() {
    const filtered = getFilteredTasks();
    if (filtered.length === 0) { alert('No tasks to export.'); return; }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('TaskFlow — Task Export', 14, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(130);
        doc.text(`Filter: ${currentFilter}  ·  ${filtered.length} tasks  ·  ${new Date().toLocaleDateString()}`, 14, 28);
        doc.setTextColor(0);

        // spacing line
        doc.setDrawColor(220);
        doc.line(14, 32, 196, 32);

        // table header
        const cols   = ['Title', 'Status', 'Deadline', 'Assigned', 'Priority', 'Subtasks'];
        const widths = [60, 24, 24, 36, 16, 32];
        let x = 14, y = 42;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(245, 245, 245);
        doc.rect(14, y - 6, 182, 8, 'F');
        cols.forEach((col, i) => {
            doc.text(col, x, y);
            x += widths[i];
        });

        // rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        filtered.forEach((t, idx) => {
            y += 10;
            if (y > 275) { doc.addPage(); y = 20; }
        
            // Alternating row background
            if (idx % 2 === 0) {
                doc.setFillColor(252, 252, 252);
                doc.rect(14, y - 6, 182, 8, 'F');
            }
        
            doc.setDrawColor(235);
            doc.line(14, y + 2, 196, y + 2);
        
            const priorityLabel = { 1: 'Low', 2: 'Medium', 3: 'High' }[t.priority] || 'Low';
            const subtasks      = t.subtasks || [];
            const subtaskCount  = subtasks.length > 0
                ? `${subtasks.filter(s => s.done).length}/${subtasks.length}`
                : '-';
        
            const values = [t.title, t.status, t.deadline, t.assigned, priorityLabel, subtaskCount];
        
            x = 14;
            values.forEach((val, i) => {
                const text = doc.splitTextToSize(String(val), widths[i] - 2)[0];
                doc.text(text, x, y);
                x += widths[i];
            });
        
            // Subtask rows below the task
            if (subtasks.length > 0) {
                doc.setFontSize(8);
                doc.setTextColor(150);
        
                subtasks.forEach(s => {
                    y += 7;
                    if (y > 275) { doc.addPage(); y = 20; }
        
                    const prefix = s.done ? '[done] ' : '[    ] ';
                    const label  = doc.splitTextToSize(prefix + s.title, 170)[0];
                    doc.text(label, 20, y);
        
                    doc.setDrawColor(245);
                    doc.line(20, y + 2, 196, y + 2);
                });
        
                doc.setFontSize(9);
                doc.setTextColor(0);
            }
        });

        doc.save(`taskflow-export-${new Date().toISOString().slice(0,10)}.pdf`);
    };

    document.head.appendChild(script);
}

// ── Export CSV ────────────────────────────────────────────
function exportToCSV() {
    const filtered = getFilteredTasks();
    if (filtered.length === 0) { alert('No tasks to export.'); return; }

    const priority = { 1: 'Low', 2: 'Medium', 3: 'High' };
    const escape   = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const header = ['ID','Title','Status','Deadline','Assigned','Priority','Pinned','Created','Subtasks'].join(',');
    const rows = filtered.map(t => [
        t.id, t.title, t.status, t.deadline,
        t.assigned, priority[t.priority] || 'Low',
        t.pinned ? 'Yes' : 'No', t.createdAt ?? '',
        (t.subtasks || []).map(s => `${s.done?'[x]':'[ ]'} ${s.title}`).join(' | ')
    ].map(escape).join(','));

    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
        href: url, download: `taskflow-${new Date().toISOString().slice(0,10)}.csv`
    });
    a.click();
    URL.revokeObjectURL(url);
}

// ── Export JSON ───────────────────────────────────────────
function exportToJSON() {
    if (tasks.length === 0) { alert('No tasks to export.'); return; }

    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
        href: url, download: `taskflow-backup-${new Date().toISOString().slice(0,10)}.json`
    });
    a.click();
    URL.revokeObjectURL(url);
}

// ── Import JSON ───────────────────────────────────────────
function importFromJSON() {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = '.json';

    input.onchange = e => {
        const file   = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();

        reader.onload = ev => {
            try {
                const imported = JSON.parse(ev.target.result.trim().replace(/^\uFEFF/, ''));
                if (!Array.isArray(imported)) throw new Error();

                const merge = confirm(
                    `Import ${imported.length} tasks?\n\nOK = merge with existing\nCancel = replace all`
                );

                if (merge) {
                    // evitar IDs duplicados
                    const maxId  = tasks.reduce((m, t) => Math.max(m, t.id), 0);
                    let   offset = maxId + 1;
                    imported.forEach(t => { t.id = offset++; });
                    tasks.push(...imported);
                } else {
                    tasks = imported;
                }

                saveTasks();
                location.reload(); // recharge the web, it read the localstorage
            } catch(err) {
                alert('Error: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    input.click();
}

// ── Help panel ────────────────────────────────────────────

function toggleHelpPanel() {
    const panel   = document.getElementById('helpPanel');
    const overlay = document.getElementById('helpOverlay');
    const isOpen  = panel.classList.contains('open');

    panel.classList.toggle('open', !isOpen);
    overlay.classList.toggle('open', !isOpen);
    panel.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
}

document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === '?') toggleHelpPanel();
    if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        document.getElementById('title')?.focus();
    }
    if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        document.getElementById('search')?.focus();
    }

    if (e.key === 'Escape') {
        const panel = document.getElementById('helpPanel');
        if (panel.classList.contains('open')) toggleHelpPanel();
    }
});

function toggleSubtask(taskId, subtaskId, el) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const sub = task.subtasks.find(s => s.id === subtaskId);
    if (sub) sub.done = el.checked;
    saveTasks(); renderTasks();
}

function deleteSubtask(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
    saveTasks(); renderTasks();
}

function addInlineSubtask(e, taskId) {
    if (e.key !== 'Enter') return;
    const val = e.target.value.trim();
    if (!val) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!task.subtasks) task.subtasks = [];
    task.subtasks.push({ id: Date.now(), title: val, done: false });
    saveTasks(); renderTasks();
}

function editSubtask(taskId, subtaskId, el) {
    const original = el.textContent;
    const input = document.createElement('input');
    input.value = original;
    input.style.cssText = 'font-size:inherit;font-family:inherit;border:1px solid var(--accent);border-radius:3px;padding:0 4px;background:var(--bg);color:inherit;outline:none;width:120px;';
    el.replaceWith(input);
    input.focus(); input.select();
    const save = () => {
        const val = input.value.trim();
        if (!val) { renderTasks(); return; }
        const task = tasks.find(t => t.id === taskId);
        const sub  = task?.subtasks.find(s => s.id === subtaskId);
        if (sub) sub.title = val;
        saveTasks(); renderTasks();
    };
    input.addEventListener('blur', save);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter')  { e.preventDefault(); save(); }
        if (e.key === 'Escape') { e.preventDefault(); renderTasks(); }
    });
}

// ── Sidebar (kept for future use) ────────────────────────────
// function toggleSidebar() {
//     const sidebar = document.getElementById('sidebar');
//     const btn = document.getElementById('sidebarToggle');
//     sidebar.classList.toggle('collapsed');
//     btn.textContent = sidebar.classList.contains('collapsed') ? '→' : '←';
// }