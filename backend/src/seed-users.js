const bcrypt = require("bcryptjs");
const db = require("./db");

// Sample users to create - modify as needed
const usersToCreate = [
    // Admin users
    {
        name: "Admin User",
        email: "admin@campus.edu",
        password: "admin123",
        role: "Admin"
    },

    // Staff users
    {
        name: "John Smith",
        email: "john.smith@campus.edu",
        password: "staff123",
        role: "Staff"
    },
    {
        name: "Sarah Johnson",
        email: "sarah.johnson@campus.edu",
        password: "staff123",
        role: "Staff"
    },
    {
        name: "Michael Brown",
        email: "michael.brown@campus.edu",
        password: "staff123",
        role: "Staff"
    },

    // Student users
    {
        name: "Alice Williams",
        email: "alice.williams@campus.edu",
        password: "student123",
        role: "Student"
    },
    {
        name: "Bob Davis",
        email: "bob.davis@campus.edu",
        password: "student123",
        role: "Student"
    },
    {
        name: "Carol Martinez",
        email: "carol.martinez@campus.edu",
        password: "student123",
        role: "Student"
    },
    {
        name: "David Garcia",
        email: "david.garcia@campus.edu",
        password: "student123",
        role: "Student"
    },
    {
        name: "Emma Wilson",
        email: "emma.wilson@campus.edu",
        password: "student123",
        role: "Student"
    }
];

async function seedUsers() {
    console.log("Starting to seed users...\n");

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    let completed = 0;
    const totalUsers = usersToCreate.length;

    function checkComplete() {
        completed++;
        if (completed === totalUsers) {
            console.log("\n" + "=".repeat(50));
            console.log("Seeding Summary:");
            console.log(`✅ Successfully created: ${successCount} users`);
            console.log(`⏭️  Skipped (already exist): ${skipCount} users`);
            console.log(`❌ Errors: ${errorCount} users`);
            console.log("=".repeat(50));
            console.log("\n💡 Default passwords:");
            console.log("   Admin: admin123");
            console.log("   Staff: staff123");
            console.log("   Student: student123");
            console.log("\n⚠️  Please change passwords after first login!");

            db.close((err) => {
                if (err) {
                    console.error("Error closing database:", err);
                }
                process.exit(0);
            });
        }
    }

    for (const user of usersToCreate) {
        // Check if user already exists
        db.get(
            "SELECT email FROM users WHERE email = ?",
            [user.email],
            async (err, row) => {
                if (err) {
                    console.error(`❌ Error checking user ${user.email}:`, err.message);
                    errorCount++;
                    checkComplete();
                    return;
                }

                if (row) {
                    console.log(`⏭️  User ${user.email} already exists, skipping...`);
                    skipCount++;
                    checkComplete();
                    return;
                }

                // Hash password and insert user
                try {
                    const passwordHash = await bcrypt.hash(user.password, 10);

                    const stmt = db.prepare(
                        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
                    );

                    stmt.run(user.name, user.email, passwordHash, user.role, function (err) {
                        if (err) {
                            if (err.message.includes("UNIQUE constraint failed")) {
                                console.log(`⏭️  User ${user.email} already exists, skipping...`);
                                skipCount++;
                            } else {
                                console.error(`❌ Error creating user ${user.email}:`, err.message);
                                errorCount++;
                            }
                        } else {
                            console.log(`✅ Created ${user.role}: ${user.name} (${user.email})`);
                            successCount++;
                        }
                        stmt.finalize();
                        checkComplete();
                    });
                } catch (hashErr) {
                    console.error(`❌ Error hashing password for ${user.email}:`, hashErr.message);
                    errorCount++;
                    checkComplete();
                }
            }
        );
    }
}

// Run the seeding
seedUsers();

