// Config first, validates .env before anything else loads
const { PORT } = require('./config/env');

const express = require('express');
const cors    = require('cors');

const taskRoutes = require('./routes/task.routes');

const app = express();

// ── Global middlewares ───────────────────────────────────────

// Allows the frontend (different origin/port) to call this API
app.use(cors());

// Parses incoming JSON request bodies into req.body
app.use(express.json());

// Request logger — logs method, url, status and response time
app.use((req, res, next) => {
    const start = performance.now();

    res.on('finish', () => {
        const ms = (performance.now() - start).toFixed(2);
        console.log(`[${req.method}] ${req.originalUrl} — ${res.statusCode} (${ms}ms)`);
    });

    next();
});

// ── Routes ───────────────────────────────────────────────────

// All task routes live under this prefix
app.use('/api/v1/tasks', taskRoutes);

// ── Global error middleware ──────────────────────────────────
// Must have 4 parameters — Express identifies it as error middleware by that
// Any controller that calls next(err) ends up here
app.use((err, req, res, next) => {
    if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Task not found.' });
    }

    // Log the full error server-side but never expose details to the client
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
});

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});