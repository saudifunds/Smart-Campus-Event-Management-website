const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const db = require("../db");
const { generateToken, authMiddleware } = require("../middleware/auth");
const { sendEmail } = require("../utils/mailer");

const router = express.Router();

// Simple in-memory reset codes for demo purposes
const resetCodes = new Map(); // code -> { email, expiresAt }

// Register new user
router.post("/register",
    [
        body("name").trim().notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
        body("role").isIn(["Admin", "Staff", "Student"]).withMessage("Invalid role")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        
        const { name, email, password, role } = req.body;

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        const stmt = db.prepare(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
        );
        stmt.run(name, email, passwordHash, role, function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.status(409).json({ message: "Email already registered" });
                }
                console.error("Register error:", err);
                return res.status(500).json({ message: "Internal server error" });
            }

            const user = {
                id: this.lastID,
                name,
                email,
                role,
            };

            const token = generateToken(user);
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 8 * 60 * 60 * 1000, // 8 hours
                sameSite: "strict"
            });
            
            // Send welcome email asynchronously
            sendEmail({
                to: user.email,
                subject: "Welcome to Smart Campus Events",
                text: `Hi ${user.name}, your ${user.role} account has been successfully created!`
            });

            res.status(201).json({ user });
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Login
router.post("/login",
    [
        body("email").isEmail().withMessage("Valid email required"),
        body("password").notEmpty().withMessage("Password required")
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        const { email, password } = req.body;

    db.get(
        `SELECT id, name, email, password_hash, role, position FROM users WHERE email = ?`,
    [email],
    async (err, user) => {
            if (err) {
                console.error("Login error:", err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const userPayload = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                position: user.position
            };

            const token = generateToken(userPayload);
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 8 * 60 * 60 * 1000,
                sameSite: "strict"
            });
            res.json({ user });
        }
    );
});

// Logout
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});

// Get current user
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Demo: request reset code (no real email)
router.post("/forgot-demo", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  db.get(
    "SELECT id, email FROM users WHERE email = ?",
    [email],
    (err, row) => {
      if (err) {
        console.error("Forgot demo error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!row) {
        return res.status(404).json({ message: "Email not found" });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      resetCodes.set(code, { email, expiresAt });

      // For demo, we just return the code in the response
      res.json({ message: "Reset code generated", code });
    }
  );
});

// Demo: reset password with code
router.post("/reset-demo", async (req, res) => {
  const { code, newPassword } = req.body;
  if (!code || !newPassword) {
    return res
      .status(400)
      .json({ message: "Code and new password are required" });
  }

  const entry = resetCodes.get(code);
  if (!entry) {
    return res.status(400).json({ message: "Invalid reset code" });
  }

  if (Date.now() > entry.expiresAt) {
    resetCodes.delete(code);
    return res.status(400).json({ message: "Reset code has expired" });
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const stmt = db.prepare(
      "UPDATE users SET password_hash = ? WHERE email = ?"
    );
    stmt.run(passwordHash, entry.email, function (err) {
      if (err) {
        console.error("Reset demo error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      resetCodes.delete(code);
      res.json({ message: "Password updated successfully" });
    });
  } catch (err) {
    console.error("Reset demo error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;


