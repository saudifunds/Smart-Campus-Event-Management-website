const db = require("./src/db");

// Insert a test pending event
const stmt = db.prepare(`
  INSERT INTO events (name, date, start_time, end_time, venue, status, created_by, created_at) 
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

stmt.run(
  "Test Event for Admin Approval",
  "2025-05-10",
  "10:00",
  "11:00",
  "Main Hall",
  "Pending",
  1, // created_by user ID 1 (admin user)
  function (err) {
    if (err) {
      console.error("Error inserting event:", err);
    } else {
      console.log("✅ Test event inserted successfully! ID:", this.lastID);
      console.log(
        "Go to admin-approve-events.html to see it in the approval queue.",
      );
    }
    db.close();
  },
);
