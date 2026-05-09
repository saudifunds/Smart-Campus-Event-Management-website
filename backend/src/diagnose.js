const db = require("./db");

console.log("🔍 Running System Diagnosis...\n");

db.serialize(() => {
  // 1. Check Users
  db.all("SELECT id, name, email, role, position FROM users", [], (err, users) => {
    if (err) {
      console.error("❌ Error fetching users:", err.message);
    } else {
      console.log(`👥 Total Users in Database: ${users.length}`);
      users.forEach(u => {
        console.log(`   - [${u.role}] ${u.name} (${u.email}) | Position: ${u.position || 'None'}`);
      });
    }

    // 2. Check Rooms
    db.all("SELECT id, name FROM rooms", [], (err, rooms) => {
      if (err) {
        console.error("❌ Error fetching rooms:", err.message);
      } else {
        console.log(`\n🚪 Total Rooms in Database: ${rooms.length}`);
        rooms.forEach(r => {
          console.log(`   - ${r.name}`);
        });
      }

      // 3. Verify Admin Access Logic
      const adminUser = users.find(u => u.role === "Admin");
      if (adminUser) {
        console.log(`\n✅ Admin found: ${adminUser.email}`);
        console.log(`👉 Log in with this email and password "admin123" to view all users.`);
      } else {
        console.log("\n❌ NO ADMIN FOUND! You need at least one Admin to view the user list.");
      }

      console.log("\n==================================================");
      console.log("Diagnosis complete.");
      process.exit(0);
    });
  });
});
