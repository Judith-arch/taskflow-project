const express = require('express');
const router  = express.Router();

// Import the controller functions
const { getAllTasks, createTask, deleteTask } = require('../controllers/task.controller');

// Map HTTP verbs + URL patterns to controller functions
// These paths are relative to wherever this router is mounted in index.js
router.get('/',      getAllTasks);   // GET    /api/v1/tasks
router.post('/',     createTask);   // POST   /api/v1/tasks
router.delete('/:id', deleteTask);  // DELETE /api/v1/tasks/23

module.exports = router;