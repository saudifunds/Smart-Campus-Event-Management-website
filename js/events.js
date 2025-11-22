// ===== Smart Campus Events with Live Countdown + Notifications =====
const eventTable = document.querySelector("#eventTable tbody");
const eventModal = document.getElementById("eventModal");
const openEventModal = document.getElementById("openEventModal");
const closeEventModal = document.getElementById("closeEventModal");
const eventForm = document.getElementById("eventForm");
const notificationContainer = document.getElementById("notificationContainer");

let events = JSON.parse(localStorage.getItem("events")) || [];
let notifiedEvents = {}; // store notifications to prevent duplicates

function renderEvents() {
  eventTable.innerHTML = "";
  if (events.length === 0) {
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
      <td>${event.name}</td>
      <td>${formatTime(start)}</td>
      <td>${formatTime(end)}</td>
      <td>${event.venue}</td>
      <td><span class="role ${status}">${status}</span></td>
      <td id="countdown-${index}" style="font-weight:500;">${countdownText}</td>
      <td>
        <button onclick="editEvent(${index})">Edit</button>
        <button class="delete" onclick="deleteEvent(${index})">Delete</button>
      </td>
    `;
    eventTable.appendChild(row);
  });

  localStorage.setItem("events", JSON.stringify(events));
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
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  return `${prefix} ${hrs}h ${mins}m ${secs}s`;
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
  eventForm.reset();
});

closeEventModal.addEventListener("click", () => {
  eventModal.style.display = "none";
});

// ===== Save Event =====
eventForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newEvent = {
    name: document.getElementById("eventName").value,
    date: document.getElementById("eventDate").value,
    startTime: document.getElementById("startTime").value,
    endTime: document.getElementById("endTime").value,
    venue: document.getElementById("eventVenue").value,
  };

  events.push(newEvent);
  localStorage.setItem("events", JSON.stringify(events));

  renderEvents();
  eventModal.style.display = "none";
});

// ===== Edit Event =====
window.editEvent = function (index) {
  const event = events[index];
  document.getElementById("eventName").value = event.name;
  document.getElementById("eventDate").value = event.date;
  document.getElementById("startTime").value = event.startTime;
  document.getElementById("endTime").value = event.endTime;
  document.getElementById("eventVenue").value = event.venue;

  events.splice(index, 1);
  eventModal.style.display = "flex";
};

// ===== Delete Event =====
window.deleteEvent = function (index) {
  if (confirm("Delete this event?")) {
    events.splice(index, 1);
    localStorage.setItem("events", JSON.stringify(events));
    renderEvents();
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
          "warning"
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
          "success"
        );
        notifiedEvents[event.name + "-start"] = true;
      }
    } else {
      status = "Expired";
      countdownText = "Session ended";
    }

    event.status = status;

    const countdownCell = document.getElementById(`countdown-${index}`);
    if (countdownCell) countdownCell.textContent = countdownText;
  });

  localStorage.setItem("events", JSON.stringify(events));
  renderEvents();
}, 1000);

// ===== Initial Render =====
renderEvents();
