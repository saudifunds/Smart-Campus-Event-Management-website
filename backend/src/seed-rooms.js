const db = require("./db");

const rooms = [
  { name: "Grand Auditorium", capacity: 500, type: "Auditorium", status: "Available" },
  { name: "Tech Lab 101", capacity: 30, type: "Lab", status: "Available" },
  { name: "Main Library Hall", capacity: 200, type: "Study Hall", status: "Available" },
  { name: "Conference Room A", capacity: 15, type: "Conference Room", status: "Occupied" },
  { name: "Sports Arena", capacity: 1000, type: "Outdoor", status: "Available" },
  { name: "Classroom 202", capacity: 40, type: "Classroom", status: "Maintenance" },
  { name: "Innovation Center", capacity: 50, type: "Lab", status: "Available" }
];

console.log("Starting to seed rooms...");

db.serialize(() => {
  // Check if rooms already exist to avoid duplicates
  db.get("SELECT COUNT(*) as count FROM rooms", [], (err, row) => {
    if (err) {
      console.error("Error checking rooms:", err);
      return;
    }

    if (row.count > 0) {
      console.log("⏭️  Rooms already exist in database. Skipping seeding.");
      process.exit(0);
    }

    const stmt = db.prepare("INSERT INTO rooms (name, capacity, type, status) VALUES (?, ?, ?, ?)");
    
    rooms.forEach((room) => {
      stmt.run(room.name, room.capacity, room.type, room.status, (err) => {
        if (err) {
          console.error(`❌ Error creating room ${room.name}:`, err.message);
        } else {
          console.log(`✅ Created room: ${room.name}`);
        }
      });
    });

    stmt.finalize(() => {
      console.log("\n==================================================");
      console.log("Seeding complete!");
      console.log("==================================================");
      process.exit(0);
    });
  });
});
