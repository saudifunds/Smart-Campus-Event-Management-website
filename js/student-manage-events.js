// ===== Student View All Events (Read-Only) =====
const eventTable = document.querySelector("#eventTable tbody");
const notificationContainer = document.getElementById("notificationContainer");

let allEvents = [];
let notifiedEvents = {};

// Helper function to show notifications
function showNotification(message, type = "info") {
  const note = document.createElement("div");
  note.className = `notification ${type}`;
  note.textContent = message;
  notificationContainer.appendChild(note);
  setTimeout(() => {
    note.remove();
  }, 6000);
}

// Load all events
async function loadAllEvents() {
  try {
    allEvents = await apiRequest("/events", { method: "GET" });
    renderEvents();
    showNotification("📅 Events loaded! Check for upcoming events.", "info");
  } catch (err) {
    console.error(err);
    eventTable.innerHTML =
      "<tr><td colspan='7'>Unable to load events from server.</td></tr>";
    showNotification("❌ Failed to load events", "error");
  }
}

// Render events in table (read-only)
function renderEvents() {
  eventTable.innerHTML = "";

  if (!allEvents.length) {
    eventTable.innerHTML = "<tr><td colspan='7'>No events available.</td></tr>";
    return;
  }

  const now = new Date();

  allEvents.forEach((event, index) => {
    const start = new Date(`${event.date}T${event.startTime}`);
    const end = new Date(`${event.date}T${event.endTime}`);
    let status = "";

    if (now < start) {
      status = "Upcoming";
    } else if (now >= start && now <= end) {
      status = "Active";
    } else {
      status = "Expired";
    }

    // Notify for upcoming events (within 30 minutes)
    const diffToStart = start - now;
    if (
      diffToStart > 0 &&
      diffToStart <= 30 * 60 * 1000 &&
      !notifiedEvents[event.id + "-upcoming"]
    ) {
      const minsUntil = Math.floor(diffToStart / (1000 * 60));
      showNotification(
        `📢 "${event.name}" is happening in ${minsUntil} minutes!`,
        "warning",
      );
      notifiedEvents[event.id + "-upcoming"] = true;
    }

    // Notify when event starts
    if (status === "Active" && !notifiedEvents[event.id + "-started"]) {
      showNotification(
        `🎉 "${event.name}" is now happening! Join at ${event.venue}`,
        "success",
      );
      notifiedEvents[event.id + "-started"] = true;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${event.name}</td>
      <td>${event.date}</td>
      <td>${event.startTime}</td>
      <td>${event.endTime}</td>
      <td>${event.venue}</td>
      <td><span id="student-status-${index}" class="role ${status}">${status}</span></td>
      <td>${status === "Expired" ? `<button onclick="openFeedbackModal(${event.id}, '${event.name}')">Feedback</button>` : ""}</td>
    `;
    eventTable.appendChild(row);
  });
}

// Update status every 30 seconds without rebuilding table
setInterval(() => {
  const now = new Date();

  allEvents.forEach((event, index) => {
    const start = new Date(`${event.date}T${event.startTime}`);
    const end = new Date(`${event.date}T${event.endTime}`);
    let newStatus = "";

    if (now < start) {
      newStatus = "Upcoming";
    } else if (now >= start && now <= end) {
      newStatus = "Active";
    } else {
      newStatus = "Expired";
    }

    // Only update if status changed
    if (event.status !== newStatus) {
      event.status = newStatus;
      const statusCell = document.getElementById(`student-status-${index}`);
      if (statusCell) {
        statusCell.className = `role ${newStatus}`;
        statusCell.textContent = newStatus;
      }
    }

    // Notify for upcoming events (within 30 minutes)
    const diffToStart = start - now;
    if (
      diffToStart > 0 &&
      diffToStart <= 30 * 60 * 1000 &&
      !notifiedEvents[event.id + "-upcoming"]
    ) {
      const minsUntil = Math.floor(diffToStart / (1000 * 60));
      showNotification(
        `📢 "${event.name}" is happening in ${minsUntil} minutes!`,
        "warning",
      );
      notifiedEvents[event.id + "-upcoming"] = true;
    }

    // Notify when event starts
    if (newStatus === "Active" && !notifiedEvents[event.id + "-started"]) {
      showNotification(
        `🎉 "${event.name}" is now happening! Join at ${event.venue}`,
        "success",
      );
      notifiedEvents[event.id + "-started"] = true;
    }
  });
}, 30000);

// Feedback modal
let currentEventId = null;

function openFeedbackModal(eventId, eventName) {
  currentEventId = eventId;
  document.getElementById("feedbackModal").style.display = "block";
  document.querySelector("#feedbackModal h2").textContent =
    `Feedback for "${eventName}"`;
}

function closeFeedbackModal() {
  document.getElementById("feedbackModal").style.display = "none";
  document.getElementById("feedbackForm").reset();
  currentEventId = null;
}

// Handle feedback form submission
document
  .getElementById("feedbackForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const rating = document.getElementById("rating").value;
    const comment = document.getElementById("comment").value;

    try {
      await apiRequest(`/events/${currentEventId}/feedback`, {
        method: "POST",
        body: JSON.stringify({ rating: parseInt(rating), comment }),
      });
      showNotification("✅ Feedback submitted successfully!", "success");
      closeFeedbackModal();
    } catch (error) {
      console.error("Submit feedback error:", error);
      showNotification("❌ Failed to submit feedback", "error");
    }
  });

// Initial load
loadAllEvents();
