const taskService = require('../services/task.service');

// ── GET /api/v1/tasks ────────────────────────────────────────
function getAllTasks(req, res) {
    const tasks = taskService.getAll();
    res.status(200).json(tasks);
}

// ── POST /api/v1/tasks ───────────────────────────────────────
function createTask(req, res, next) {
    const { title, deadline, status, priority, assigned } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
        return res.status(400).json({
            error: 'Title is required and must be at least 3 characters.'
        });
    }

    if (!deadline) {
        return res.status(400).json({
            error: 'Deadline is required.'
        });
    }

    try {
        const newTask = taskService.create({ title, deadline, status, priority, assigned });
        res.status(201).json(newTask);
    } catch (err) {
        next(err);
    }
}

// ── DELETE /api/v1/tasks/:id ─────────────────────────────────
function deleteTask(req, res, next) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID must be a number.' });
    }

    try {
        taskService.remove(id);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = { getAllTasks, createTask, deleteTask };