const Database = require("better-sqlite3");

const db = new Database("smarttaskmanager.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        priority TEXT NOT NULL,
        due_date TEXT,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);

try {
    db.exec(`
        ALTER TABLE tasks ADD COLUMN due_date TEXT;
    `);
} catch (error) {
    // Column already exists
}

console.log("SQLite database connected successfully!");

module.exports = db;



// for frontend -- npm run dev        http://localhost:3000   (all)
// for backend  -- node server.js     http://localhost:5000