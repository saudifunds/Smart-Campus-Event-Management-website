const express = require("express");
const db = require("../db");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

// Get all users (Admin only)
router.get("/", authMiddleware, requireRole(["Admin"]), (req, res) => {
  db.all(
    "SELECT id, name, email, role, position, created_at FROM users ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error("Fetch users error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      res.json(rows);
    },
  );
});

// Update user (Admin only)
router.put("/:id", authMiddleware, requireRole(["Admin"]), (req, res) => {
  const { id } = req.params;
  const { name, email, role, position } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!["Admin", "Staff", "Student"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const stmt = db.prepare(
    "UPDATE users SET name = ?, email = ?, role = ?, position = ? WHERE id = ?",
  );
  stmt.run(name, email, role, position || null, id, function (err) {
    if (err) {
      console.error("Update user error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ id: Number(id), name, email, role, position });
  });
});

// Delete user (Admin only)
router.delete("/:id", authMiddleware, requireRole(["Admin"]), (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare("DELETE FROM users WHERE id = ?");
  stmt.run(id, function (err) {
    if (err) {
      console.error("Delete user error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(204).send();
  });
});

// Get current user profile
router.get("/profile", authMiddleware, (req, res) => {
  db.get(
    "SELECT id, name, email, role, position, bio, interests, notification_preferences, created_at FROM users WHERE id = ?",
    [req.user.id],
    (err, row) => {
      if (err) {
        console.error("Fetch profile error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!row) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(row);
    }
  );
});

// Update current user profile
router.put("/profile", authMiddleware, (req, res) => {
  const { name, email, bio, interests, notification_preferences } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const stmt = db.prepare(
    "UPDATE users SET name = ?, email = ?, bio = ?, interests = ?, notification_preferences = ? WHERE id = ?"
  );
  stmt.run(name, email, bio || null, JSON.stringify(interests) || null, JSON.stringify(notification_preferences) || null, req.user.id, function (err) {
    if (err) {
      console.error("Update profile error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Profile updated successfully" });
  });
});

module.exports = router;