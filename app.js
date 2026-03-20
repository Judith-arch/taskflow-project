// Array to store all tasks
let tasks = [];

// Render tasks in the DOM
function renderTasks() {
    const taskList = document.getElementById("taskList");
    
    // Clear the list before rendering
    taskList.innerHTML = "";

    // Create a list item for each task
    tasks.forEach(function(task) {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${task.title}</strong>
            <span>${task.deadline}</span>
            <span>${task.status}</span>
            <span>${task.assigned}</span>
            <button onclick="deleteTask(${task.id})">🗑</button>
            <input type="checkbox" onchange="toggleComplete(${task.id})" ${task.completed ? "checked" : ""}>
        `;
        taskList.appendChild(li);
    });

    updateStats();
}

// Listen for form submission
document.getElementById("taskForm").addEventListener("submit", function(e) {
    e.preventDefault(); // prevent page reload

    // Get values from form
    const title = document.getElementById("title").value;
    const deadline = document.getElementById("deadline").value;
    const status = document.getElementById("status").value;
    const assigned = document.getElementById("assigned").value;

    // Create task object
    const task = {
        id: Date.now(),          // unique id based on timestamp
        title: title,            // task title from form
        createdAt: new Date(),   // creation date
        deadline: deadline,      // limit date
        completed: false,        // not completed by default
        status: status,          // To-do / Doing / Done
        assigned: assigned,      // person assigned
        priority: "low",         // low / medium / high
        notes: "",               // documentation area
        tags: [],                // categories
        archived: false          // not archived by default
    };

    // Add to array
    tasks.push(task);

    renderTasks();

    // Save to LocalStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));

    console.log("Task added:", tasks);
});

// Delete a task by id
function deleteTask(id) {
    tasks = tasks.filter(function(task) {
        return task.id !== id;
    });
    renderTasks();
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Mark a task as completed or not
function toggleComplete(id) {
    tasks = tasks.map(function(task) {
        if (task.id === id) {
            task.completed = !task.completed;
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
    const inProgress = total - completed;

    document.getElementById("numTotalTasks").textContent = "Total = " + total;
    document.getElementById("numTaskCompleted").textContent = "Completed = " + completed;
    document.getElementById("numTaskInProgress").textContent = "In Progress = " + inProgress;
}

// Load tasks from LocalStorage on startup
const savedTasks = localStorage.getItem("tasks");
if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    renderTasks();
}