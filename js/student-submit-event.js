// Student Event Submission Logic

let myEvents = [];

document.addEventListener("DOMContentLoaded", async () => {
  checkAuth();
  renderSidebar();
  await loadMyEvents();
  setupFormHandlers();
});

function setupFormHandlers() {
  const form = document.getElementById("eventForm");
  form.addEventListener("submit", handleEventSubmit);

  // File input handling
  document.getElementById("eventImage").addEventListener("change", (e) => {
    const fileName = e.target.files[0]?.name || "No file selected";
    document.getElementById("fileName").textContent = `✓ ${fileName}`;
  });

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("eventDate").setAttribute("min", today);
}

async function handleEventSubmit(e) {
  e.preventDefault();

  const eventName = document.getElementById("eventName").value.trim();
  const eventDate = document.getElementById("eventDate").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const venue = document.getElementById("venue").value.trim();
  const imageFile = document.getElementById("eventImage").files[0];

  // Validation
  if (!eventName || !eventDate || !startTime || !endTime || !venue) {
    showNotification("Please fill in all required fields", "warning");
    return;
  }

  if (startTime >= endTime) {
    showNotification("End time must be after start time", "warning");
    return;
  }

  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append("name", eventName);
  formData.append("date", eventDate);
  formData.append("startTime", startTime);
  formData.append("endTime", endTime);
  formData.append("venue", venue);
  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    const response = await fetch("http://localhost:4000/api/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to submit event");
    }

    const newEvent = await response.json();
    myEvents.unshift(newEvent);

    showNotification(
      "✓ Event submitted for approval! Administrators will review your request soon.",
      "success",
    );

    resetForm();
    loadMyEvents();
  } catch (error) {
    showNotification(error.message, "error");
    console.error("Submit event error:", error);
  }
}

async function loadMyEvents() {
  try {
    myEvents = await apiRequest("/events/my-events", { method: "GET" });
    renderMyEvents();
  } catch (error) {
    console.error("Load my events error:", error);
    showNotification("Failed to load your events", "error");
  }
}

function renderMyEvents() {
  const container = document.getElementById("myEventsContainer");

  if (myEvents.length === 0) {
    container.innerHTML = `<div class="no-events">You haven't submitted any events yet</div>`;
    return;
  }

  container.innerHTML = myEvents
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .map(
      (event) => `
      <div class="event-item">
        <div class="event-info">
          <h4>${event.name}</h4>
          <p><i class="fas fa-calendar"></i> ${event.date} at ${event.startTime}</p>
          <p><i class="fas fa-map-marker"></i> ${event.venue}</p>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="status-${event.status.toLowerCase()}">${event.status}</span>
          ${event.status === "Pending" ? `<button class="btn danger" onclick="deleteEvent(${event.id})"><i class="fas fa-trash"></i> Delete</button>` : ""}
        </div>
      </div>
    `,
    )
    .join("");
}

async function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  try {
    await apiRequest(`/events/${eventId}`, { method: "DELETE" });
    showNotification("Event deleted successfully", "success");
    myEvents = myEvents.filter((e) => e.id !== eventId);
    renderMyEvents();
  } catch (error) {
    showNotification("Failed to delete event", "error");
    console.error("Delete event error:", error);
  }
}

function resetForm() {
  document.getElementById("eventForm").reset();
  document.getElementById("fileName").textContent = "";
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.style.display='none'" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 16px;">×</button>
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 6000);
}
