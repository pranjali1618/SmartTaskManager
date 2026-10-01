const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Smart Task Manager Backend is running!"
    });
});

// Register user
app.post("/api/users", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Please provide name, email and password"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const statement = db.prepare(`
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `);

        const result = statement.run(
            name,
            email,
            hashedPassword
        );

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: result.lastInsertRowid,
                name,
                email
            }
        });
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Error creating user"
        });
    }
});

// Login
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const user = db.prepare(`
        SELECT * FROM users
        WHERE email = ?
    `).get(email);

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    res.json({
        message: "Login successful",
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

// Get all users
app.get("/api/users", (req, res) => {
    const users = db.prepare(`
        SELECT id, name, email FROM users
    `).all();

    res.json(users);
});

// Add task
// Add task
// Add task
app.post("/api/tasks", (req, res) => {
    const { user_id, name, priority, due_date } = req.body;

    if (!user_id || !name || !priority) {
        return res.status(400).json({
            message: "Please provide user_id, task name and priority"
        });
    }

    const statement = db.prepare(`
        INSERT INTO tasks (user_id, name, priority, due_date, completed)
        VALUES (?, ?, ?, ?, 0)
    `);

    const result = statement.run(
        user_id,
        name,
        priority,
        due_date || null
    );

    const newTask = {
        id: result.lastInsertRowid,
        user_id,
        name,
        priority,
        due_date: due_date || null,
        completed: false
    };

    res.status(201).json({
        message: "Task added successfully",
        task: newTask
    });
});

// Get tasks for a specific user
app.get("/api/tasks/:userId", (req, res) => {
    const userId = Number(req.params.userId);

    const tasks = db.prepare(`
        SELECT id, user_id, name, priority, due_date, completed
        FROM tasks
        WHERE user_id = ?
        ORDER BY id DESC
    `).all(userId);

    const formattedTasks = tasks.map(task => ({
        ...task,
        completed: Boolean(task.completed)
    }));

    res.json(formattedTasks);
});

// Complete / Undo task
app.put("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    const task = db.prepare(`
        SELECT * FROM tasks WHERE id = ?
    `).get(id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const newCompleted = task.completed ? 0 : 1;

    db.prepare(`
        UPDATE tasks
        SET completed = ?
        WHERE id = ?
    `).run(newCompleted, id);

    const updatedTask = db.prepare(`
        SELECT * FROM tasks WHERE id = ?
    `).get(id);

    res.json({
        message: "Task updated successfully",
        task: {
            ...updatedTask,
            completed: Boolean(updatedTask.completed)
        }
    });
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    const result = db.prepare(`
        DELETE FROM tasks WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.json({
        message: "Task deleted successfully"
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});