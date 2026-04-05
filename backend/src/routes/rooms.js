const express = require("express");
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Get all rooms
router.get("/", authMiddleware, (req, res) => {
  db.all(
    "SELECT id, name, capacity, type, status FROM rooms ORDER BY name",
    [],
    (err, rows) => {
      if (err) {
        console.error("Fetch rooms error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      res.json(rows);
    }
  );
});

// Create room (Admin, Staff)
router.post("/", authMiddleware, (req, res) => {
  const { name, capacity, type, status } = req.body;

  if (!name || !capacity || !type || !status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!["Admin", "Staff"].includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Only Admin or Staff can create rooms" });
  }

  const stmt = db.prepare(
    "INSERT INTO rooms (name, capacity, type, status, created_by) VALUES (?, ?, ?, ?, ?)"
  );
  stmt.run(
    name,
    capacity,
    type,
    status,
    req.user.id,
    function (err) {
      if (err) {
        console.error("Create room error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        capacity,
        type,
        status,
      });
    }
  );
});

// Update room (Admin, Staff)
router.put("/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, capacity, type, status } = req.body;

  if (!name || !capacity || !type || !status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!["Admin", "Staff"].includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Only Admin or Staff can update rooms" });
  }

  const stmt = db.prepare(
    "UPDATE rooms SET name = ?, capacity = ?, type = ?, status = ? WHERE id = ?"
  );
  stmt.run(name, capacity, type, status, id, function (err) {
    if (err) {
      console.error("Update room error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({
      id: Number(id),
      name,
      capacity,
      type,
      status,
    });
  });
});

// Delete room (Admin only)
router.delete("/:id", authMiddleware, (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only Admin can delete rooms" });
  }

  const stmt = db.prepare("DELETE FROM rooms WHERE id = ?");
  stmt.run(id, function (err) {
    if (err) {
      console.error("Delete room error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(204).send();
  });
});

module.exports = router;


