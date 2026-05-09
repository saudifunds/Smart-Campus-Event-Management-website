const db = require("./src/db");
const { generateToken } = require("./src/middleware/auth");

console.log("🔍 Comprehensive Backend Diagnostics\n");

// Check pending events
db.all(
  `SELECT id, name, status, created_by FROM events WHERE status = 'Pending'`,
  [],
  (err, rows) => {
    if (err) {
      console.error("❌ Error querying pending events:", err);
    } else {
      console.log("✅ Pending Events in Database:", rows.length);
      if (rows.length > 0) {
        console.log("   Events:");
        rows.forEach((e) => {
          console.log(
            `   - ID ${e.id}: "${e.name}" (created_by: ${e.created_by})`,
          );
        });
      } else {
        console.log("   ⚠️  No pending events found!");
      }
    }

    // Check all events count
    db.all(`SELECT id, name, status FROM events`, [], (err, rows) => {
      console.log("\n✅ Total Events in Database:", rows.length);
      if (rows.length > 0) {
        const statuses = {};
        rows.forEach((e) => {
          statuses[e.status] = (statuses[e.status] || 0) + 1;
        });
        console.log("   By Status:", statuses);
      }

      // Check users
      db.all(`SELECT id, name, role, position FROM users`, [], (err, rows) => {
        console.log("\n✅ Users in Database:", rows.length);
        if (rows.length > 0) {
          rows.forEach((u) => {
            console.log(
              `   - ID ${u.id}: ${u.name} (${u.role})${u.position ? ` - Position: ${u.position}` : ""}`,
            );
          });
        }

        console.log("\n📋 Sample Admin Token (for testing):");
        const adminToken = generateToken({
          id: 1,
          role: "Admin",
          position: null,
        });
        console.log("   " + adminToken);

        db.close();
      });
    });
  },
);
