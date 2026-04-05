// ===== Smart Campus Events with Live Countdown + Notifications (Backend-powered) =====
const eventTable = document.querySelector("#eventTable tbody");
const eventModal = document.getElementById("eventModal");
const openEventModal = document.getElementById("openEventModal");
const closeEventModal = document.getElementById("closeEventModal");
const eventForm = document.getElementById("eventForm");
const notificationContainer = document.getElementById("notificationContainer");

let events = [];
let notifiedEvents = {}; // store notifications to prevent duplicates
let editingEventId = null;

const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};
if (loggedInUser.role === "Student" && !loggedInUser.position) {
  if (openEventModal) openEventModal.style.display = "none";
}

async function loadEvents() {
  try {
    events = await apiRequest("/events", { method: "GET" });
    renderEvents();
  } catch (err) {
    console.error(err);
    eventTable.innerHTML =
      "<tr><td colspan='7'>Unable to load events from server.</td></tr>";
  }
}

function renderEvents() {
  eventTable.innerHTML = "";
  if (!events.length) {
    eventTable.innerHTML = "<tr><td colspan='7'>No events found.</td></tr>";
    return;
  }

  const now = new Date();

  events.forEach((event, index) => {
    const start = new Date(`${event.date}T${event.startTime}`);
    const end = new Date(`${event.date}T${event.endTime}`);
    let status = "";
    let countdownText = "";

    if (now < start) {
      status = "Upcoming";
      countdownText = getCountdownText(start, "Starts in");
    } else if (now >= start && now <= end) {
      status = "Active";
      countdownText = getCountdownText(end, "Ends in");
    } else {
      status = "Expired";
      countdownText = "Session ended";
    }

    event.status = status;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        ${event.imageUrl ? `<img src="http://localhost:4000${event.imageUrl}" alt="Event" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; display: block;">` : '<div style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #666; font-size: 10px;">No Image</div>'}
      </td>
      <td>${event.name}</td>
      <td>${formatTime(start)}</td>
      <td>${formatTime(end)}</td>
      <td>${event.venue}</td>
      <td><span id="status-${index}" class="role ${status.replace(" ", "-")}">${status}</span></td>
      <td id="countdown-${index}" style="font-weight:500;">${countdownText}</td>
      <td>
        ${status === "Pending" && ["Admin", "Staff"].includes(loggedInUser.role) ? `<button class="success" onclick="approveEvent(${event.id})" style="background-color: var(--success); color: white; margin-right: 5px;">Approve</button>` : ""}
        ${status === "Pending" && loggedInUser.role === "Student" ? `<span style="font-style: italic; font-size: 0.9em; margin-right: 5px;">Awaiting Approval</span>` : ""}
        <button onclick="editEvent(${index})">Edit</button>
        <button class="delete" onclick="deleteEvent(${index})">Delete</button>
      </td>
    `;
    eventTable.appendChild(row);
  });
}

// ===== Helper: Format Time =====
function formatTime(date) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

// ===== Helper: Countdown Text =====
function getCountdownText(targetTime, prefix) {
  const now = new Date();
  const diff = targetTime - now;
  if (diff <= 0) return "Session ended";

  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hrs > 0) {
    return `${prefix} ${hrs}h ${mins}m`;
  } else {
    return `${prefix} ${mins}m`;
  }
}

// ===== Notification =====
function showNotification(message, type = "info") {
  const note = document.createElement("div");
  note.className = `notification ${type}`;
  note.textContent = message;
  notificationContainer.appendChild(note);
  setTimeout(() => {
    note.remove();
  }, 6000);
}

// ===== Modal Controls =====
openEventModal.addEventListener("click", () => {
  eventModal.style.display = "flex";
  editingEventId = null;
  eventForm.reset();
});

closeEventModal.addEventListener("click", () => {
  eventModal.style.display = "none";
});

// ===== Save Event (Create or Update) =====
eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", document.getElementById("eventName").value);
  formData.append("date", document.getElementById("eventDate").value);
  formData.append("startTime", document.getElementById("startTime").value);
  formData.append("endTime", document.getElementById("endTime").value);
  formData.append("venue", document.getElementById("eventVenue").value);

  const imageFile = document.getElementById("eventImage")?.files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    if (editingEventId) {
      await apiRequest(`/events/${editingEventId}`, {
        method: "PUT",
        body: formData,
      });
      showNotification("✏️ Event updated successfully!", "success");
    } else {
      await apiRequest("/events", {
        method: "POST",
        body: formData,
      });
      showNotification(
        "✅ New event created! Students will be notified.",
        "success",
      );
    }

    eventModal.style.display = "none";
    await loadEvents();
  } catch (err) {
    showNotification(`❌ ${err.message || "Unable to save event."}`, "error");
  }
});

// ===== Edit Event =====
window.editEvent = function (index) {
  const event = events[index];
  editingEventId = event.id;

  document.getElementById("eventName").value = event.name;
  document.getElementById("eventDate").value = event.date;
  document.getElementById("startTime").value = event.startTime;
  document.getElementById("endTime").value = event.endTime;
  document.getElementById("eventVenue").value = event.venue;

  eventModal.style.display = "flex";
};

// ===== Approve Event =====
window.approveEvent = async function (id) {
  if (
    !confirm(
      "Approve this event? It will become visible to everyone and notifications will be sent.",
    )
  )
    return;

  try {
    await apiRequest(`/events/${id}/approve`, { method: "PUT" });
    showNotification("✅ Event approved successfully!", "success");
    await loadEvents();
  } catch (err) {
    showNotification(
      `❌ ${err.message || "Unable to approve event."}`,
      "error",
    );
  }
};

// ===== Delete Event =====
window.deleteEvent = async function (index) {
  const event = events[index];
  if (!event || !event.id) return;

  if (!confirm("Delete this event?")) return;

  try {
    await apiRequest(`/events/${event.id}`, { method: "DELETE" });
    showNotification("🗑️ Event deleted successfully!", "success");
    await loadEvents();
  } catch (err) {
    showNotification(`❌ ${err.message || "Unable to delete event."}`, "error");
  }
};

// ===== Live Countdown + Notifications =====
setInterval(() => {
  const now = new Date();

  events.forEach((event, index) => {
    const start = new Date(`${event.date}T${event.startTime}`);
    const end = new Date(`${event.date}T${event.endTime}`);
    let countdownText = "";
    let status = "";

    const diffToStart = start - now;
    const diffToEnd = end - now;

    // --- Determine Status ---
    if (diffToStart > 0) {
      status = "Upcoming";
      countdownText = getCountdownText(start, "Starts in");

      // Notify 5 minutes before
      if (
        diffToStart <= 5 * 60 * 1000 &&
        !notifiedEvents[event.name + "-soon"]
      ) {
        showNotification(
          `⏰ "${event.name}" is starting in 5 minutes at ${event.venue}.`,
          "warning",
        );
        notifiedEvents[event.name + "-soon"] = true;
      }
    } else if (diffToStart <= 0 && diffToEnd > 0) {
      status = "Active";
      countdownText = getCountdownText(end, "Ends in");

      // Notify when starts
      if (!notifiedEvents[event.name + "-start"]) {
        showNotification(
          `🚀 "${event.name}" has just started in ${event.venue}!`,
          "success",
        );
        notifiedEvents[event.name + "-start"] = true;
      }
    } else {
      status = "Expired";
      countdownText = "Session ended";
    }

    // Only update if status changed
    if (event.status !== status) {
      event.status = status;
      // Update status cell
      const statusCell = document.querySelector(`#status-${index}`);
      if (statusCell) {
        statusCell.innerHTML = `<span class="role ${status.replace(" ", "-")}">${status}</span>`;
      }
    }

    // Update countdown cell
    const countdownCell = document.getElementById(`countdown-${index}`);
    if (countdownCell) countdownCell.textContent = countdownText;
  });

  // Remove renderEvents() call - only update countdowns, don't rebuild table
}, 10000);

// ===== Initial Load =====
loadEvents();
