const express = require("express");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { sendEmail } = require("../utils/mailer");

const router = express.Router();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Save file with a unique name
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get all events
router.get("/", authMiddleware, (req, res) => {
  let query = "SELECT id, name, date, start_time AS startTime, end_time AS endTime, venue, status, created_by, image_url AS imageUrl FROM events";
  let params = [];
  
  if (req.user.role === "Student") {
    query += " WHERE status != 'Pending' OR created_by = ?";
    params.push(req.user.id);
  }
  
  query += " ORDER BY date, start_time";
  
  db.all(query, params, (err, rows) => {
      if (err) {
        console.error("Fetch events error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      res.json(rows);
    }
  );
});

// Create event (Admin and Staff only)
router.post("/", authMiddleware, upload.single("image"),
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("date").notEmpty().withMessage("Valid date is required"),
    body("startTime").notEmpty().withMessage("Start time is required"),
    body("endTime").notEmpty().withMessage("End time is required"),
    body("venue").trim().notEmpty().withMessage("Venue is required")
  ],
  (req, res) => {
    let initialStatus = "Upcoming";
    if (!["Admin", "Staff"].includes(req.user.role)) {
      if (req.user.role === "Student" && req.user.position) {
         initialStatus = "Pending";
      } else {
         return res.status(403).json({ message: "Only administrators and student leaders can create events" });
      }
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, date, startTime, endTime, venue } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const stmt = db.prepare(
      "INSERT INTO events (name, date, start_time, end_time, venue, status, created_by, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(name, date, startTime, endTime, venue, initialStatus, req.user.id, imageUrl, function (err) {
      if (err) {
        console.error("Create event error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      
      if (initialStatus === "Upcoming") {
        db.all("SELECT email FROM users WHERE role = 'Student'", [], (err, students) => {
           if (!err && students.length > 0) {
             const emails = students.map(s => s.email).join(", ");
             sendEmail({
               to: emails,
               subject: `New Event: ${name}`,
               text: `A new campus event "${name}" is scheduled on ${date} at ${startTime} in ${venue}. Log in to view details.`
             });
           }
        });
      }

      res.status(201).json({ id: this.lastID, name, date, startTime, endTime, venue, status: initialStatus, imageUrl });
    });
});

// Get student's own events
router.get("/my-events", authMiddleware, (req, res) => {
  const userId = req.user.id;
  db.all(
    "SELECT id, name, date, start_time AS startTime, end_time AS endTime, venue, status, created_by, image_url AS imageUrl FROM events WHERE created_by = ? ORDER BY date, start_time",
    [userId],
    (err, rows) => {
      if (err) {
        console.error("Fetch student events error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      res.json(rows);
    }
  );
});

// Update event
router.put("/:id", authMiddleware, upload.single("image"),
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("date").notEmpty().withMessage("Valid date is required"),
    body("startTime").notEmpty().withMessage("Start time is required"),
    body("endTime").notEmpty().withMessage("End time is required"),
    body("venue").trim().notEmpty().withMessage("Venue is required")
  ],
  (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    
    const { name, date, startTime, endTime, venue, status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    db.get("SELECT created_by, image_url FROM events WHERE id = ?", [id], (err, event) => {
      if (err) { return res.status(500).json({ message: "Internal server error" }); }
      if (!event) { return res.status(404).json({ message: "Event not found" }); }
      if (event.created_by !== userId && userRole === "Student") {
        return res.status(403).json({ message: "You can only edit your own events" });
      }

      const finalImageUrl = imageUrl || event.image_url;

      const stmt = db.prepare(
        "UPDATE events SET name = ?, date = ?, start_time = ?, end_time = ?, venue = ?, status = ?, image_url = ? WHERE id = ?"
      );
      stmt.run(name, date, startTime, endTime, venue, status || event.status, finalImageUrl, id, function (err) {
        if (err) { return res.status(500).json({ message: "Internal server error" }); }
        res.json({ id: Number(id), name, date, startTime, endTime, venue, status: status || event.status, imageUrl: finalImageUrl });
      });
    });
});

// Delete event
router.delete("/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  db.get("SELECT created_by FROM events WHERE id = ?", [id], (err, event) => {
    if (err) { return res.status(500).json({ message: "Internal server error" }); }
    if (!event) { return res.status(404).json({ message: "Event not found" }); }
    if (event.created_by !== userId && userRole === "Student") {
      return res.status(403).json({ message: "You can only delete your own events" });
    }

    const stmt = db.prepare("DELETE FROM events WHERE id = ?");
    stmt.run(id, function (err) {
      if (err) { return res.status(500).json({ message: "Internal server error" }); }
      res.status(204).send();
    });
  });
});

// Approve event (Admin/Staff only)
router.put("/:id/approve", authMiddleware, requireRole(["Admin", "Staff"]), (req, res) => {
  const { id } = req.params;
  
  db.get("SELECT name, date, start_time, venue, status FROM events WHERE id = ?", [id], (err, event) => {
     if (err || !event) return res.status(404).json({ message: "Event not found" });
     if (event.status !== "Pending") return res.status(400).json({ message: "Event is not pending" });
     
     db.run("UPDATE events SET status = 'Upcoming' WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ message: "Internal server error" });
        
        // Notify students it's approved
        db.all("SELECT email FROM users WHERE role = 'Student'", [], (err, students) => {
           if (!err && students.length > 0) {
             const emails = students.map(s => s.email).join(", ");
             sendEmail({
               to: emails,
               subject: `New Event: ${event.name}`,
               text: `A new campus event "${event.name}" is scheduled on ${event.date} at ${event.start_time} in ${event.venue}. Log in to view details.`
             });
           }
        });

        res.json({ message: "Event approved successfully" });
     });
  });
});

// Submit feedback
router.post("/:id/feedback", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  db.get("SELECT id FROM events WHERE id = ?", [id], (err, event) => {
    if (err) { return res.status(500).json({ message: "Internal server error" }); }
    if (!event) { return res.status(404).json({ message: "Event not found" }); }

    const stmt = db.prepare("INSERT INTO feedback (event_id, user_id, rating, comment) VALUES (?, ?, ?, ?)");
    stmt.run(id, userId, rating, comment || null, function (err) {
      if (err) { return res.status(500).json({ message: "Internal server error" }); }
      res.status(201).json({ message: "Feedback submitted successfully" });
    });
  });
});

// Get feedback
router.get("/:id/feedback", authMiddleware, (req, res) => {
  const { id } = req.params;
  db.all(
    `SELECT f.rating, f.comment, f.created_at, u.name AS user_name
     FROM feedback f JOIN users u ON f.user_id = u.id
     WHERE f.event_id = ? ORDER BY f.created_at DESC`,
    [id],
    (err, rows) => {
      if (err) { return res.status(500).json({ message: "Internal server error" }); }
      const totalRating = rows.reduce((sum, row) => sum + row.rating, 0);
      const averageRating = rows.length > 0 ? (totalRating / rows.length).toFixed(1) : 0;
      res.json({ feedback: rows, averageRating: parseFloat(averageRating), count: rows.length });
    }
  );
});

// Get analytics (Admin only)
router.get("/analytics", authMiddleware, requireRole(["Admin"]), (req, res) => {
  const analytics = {};
  db.get("SELECT COUNT(*) AS totalEvents FROM events", [], (err, row) => {
    if (err) return res.status(500).json({ message: "Internal server error" });
    analytics.totalEvents = row.totalEvents;
    db.all("SELECT status, COUNT(*) AS count FROM events GROUP BY status", [], (err, rows) => {
      if (err) return res.status(500).json({ message: "Internal server error" });
      analytics.eventsByStatus = rows;
      db.all("SELECT venue, COUNT(*) AS count FROM events GROUP BY venue ORDER BY count DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ message: "Internal server error" });
        analytics.roomUsage = rows;
        db.all("SELECT role, COUNT(*) AS count FROM users GROUP BY role", [], (err, rows) => {
          if (err) return res.status(500).json({ message: "Internal server error" });
          analytics.usersByRole = rows;
          db.all(`SELECT u.name, COUNT(e.id) AS eventsCreated FROM users u LEFT JOIN events e ON u.id = e.created_by GROUP BY u.id, u.name ORDER BY eventsCreated DESC LIMIT 10`, [], (err, rows) => {
            if (err) return res.status(500).json({ message: "Internal server error" });
            analytics.topEventCreators = rows;
            res.json(analytics);
          });
        });
      });
    });
  });
});

module.exports = router;