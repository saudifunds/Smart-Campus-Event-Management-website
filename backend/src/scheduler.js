const cron = require("node-cron");
const db = require("./db");

// Run every minute to update event statuses automatically
cron.schedule("* * * * *", () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const time = now.toTimeString().split("T")[1].substring(0, 5);

    // Upcoming -> Active (if today and start_time <= now and end_time > now)
    db.run(
        "UPDATE events SET status = 'Active' WHERE status = 'Upcoming' AND date = ? AND start_time <= ? AND end_time > ?",
        [today, time, time]
    );

    // Active -> Expired (if date < today or (date = today and end_time <= time))
    db.run(
        "UPDATE events SET status = 'Expired' WHERE status IN ('Upcoming', 'Active') AND (date < ? OR (date = ? AND end_time <= ?))",
        [today, today, time]
    );
});
