// Base URL of the backend server
// Change this to your Vercel URL when deploying
const API_URL = 'http://localhost:3000/api/v1/tasks';

// ── Get all tasks ────────────────────────────────────────────
async function fetchTasks() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
}

// ── Create a task ────────────────────────────────────────────
async function createTask(taskData) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create task');
    }
    return res.json();
}

// ── Delete a task ────────────────────────────────────────────
async function deleteTask(id) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete task');
    // 204 has no body — don't try to parse JSON
}

// Export for use in app.js
window.apiClient = { fetchTasks, createTask, deleteTask };