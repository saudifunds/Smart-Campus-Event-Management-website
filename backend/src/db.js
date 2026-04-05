const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "database.sqlite");
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Admin', 'Staff', 'Student')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      venue TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Upcoming',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

    // Add new columns to existing tables
    db.run("ALTER TABLE users ADD COLUMN bio TEXT", (err) => {
      if (err && !err.message.includes("duplicate column name")) console.error("Add bio column error:", err);
    });
    db.run("ALTER TABLE users ADD COLUMN interests TEXT", (err) => {
      if (err && !err.message.includes("duplicate column name")) console.error("Add interests column error:", err);
    });
    db.run("ALTER TABLE users ADD COLUMN notification_preferences TEXT", (err) => {
      if (err && !err.message.includes("duplicate column name")) console.error("Add notification_preferences column error:", err);
    });
    db.run("ALTER TABLE events ADD COLUMN image_url TEXT", (err) => {
      if (err && !err.message.includes("duplicate column name")) console.error("Add image_url column error:", err);
    });
    db.run("ALTER TABLE users ADD COLUMN position TEXT", (err) => {
      if (err && !err.message.includes("duplicate column name")) console.error("Add position column error:", err);
    });

    db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

module.exports = db;
