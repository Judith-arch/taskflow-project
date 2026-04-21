// In-memory storage — simulates a database for now
// When the server restarts, this resets. That's expected at this stage.
let tasks = [];

// Counter for unique IDs — simpler than random UUIDs for now
let nextId = 1;

// ── Get all tasks ────────────────────────────────────────────
// Returns the full array.
function getAll() {
    return tasks;
}

// ── Create a task ────────────────────────────────────────────
// Receives clean, already-validated data from the controller
// Returns the newly created task
function create(data) {
    const newTask = {
        id:        nextId++,
        title:     data.title,
        deadline:  data.deadline,
        status:    data.status   || 'to-do',
        priority:  data.priority || 1,
        assigned:  data.assigned || '',
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    return newTask;
}

// ── Delete a task ────────────────────────────────────────────
// Throws a specific error string if the ID doesn't exist
// The error middleware in index.js will catch this and return 404
function remove(id) {
    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
        throw new Error('NOT_FOUND');
    }

    // Remove 1 item at that index and return it
    const deleted = tasks.splice(index, 1)[0];
    return deleted;
}

// Export the three functions — controllers will import these
module.exports = { getAll, create, remove };