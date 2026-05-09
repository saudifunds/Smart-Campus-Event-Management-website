// Admin Event Approval Logic

let pendingEvents = [];
let currentDenialEventId = null;

// Load pending events on page load
document.addEventListener("DOMContentLoaded", async () => {
  console.log("📄 Admin approval page loaded");
  checkAuth();
  console.log("🔐 Auth check passed");
  await loadPendingEvents();
  renderSidebar();
});

async function loadPendingEvents() {
  try {
    console.log("🔄 Loading pending events...");
    console.log("Token available?", !!localStorage.getItem("authToken"));

    pendingEvents = await apiRequest("/events/pending/list", { method: "GET" });
    console.log("✅ Pending events loaded:", pendingEvents.length);

    renderPendingEvents();
    showNotification(
      `${pendingEvents.length} pending event(s) to review`,
      "info",
    );
  } catch (error) {
    console.error("❌ Load pending events error:", error);
    showNotification("Failed to load pending events", "error");
  }
}

function renderPendingEvents() {
  const container = document.getElementById("pendingEventsContainer");

  if (pendingEvents.length === 0) {
    container.innerHTML = `
      <div class="no-pending">
        <i class="fas fa-check-circle"></i>
        <h3>No Pending Events</h3>
        <p>All event requests have been reviewed!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pendingEvents
    .map(
      (event, index) => `
    <div class="approval-card">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div>
          <h3>${event.name}</h3>
          <span class="status-badge">PENDING REVIEW</span>
        </div>
        ${event.imageUrl ? `<img src="${event.imageUrl}" alt="Event" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">` : ""}
      </div>

      <div class="organizer-info">
        <strong><i class="fas fa-user"></i> Organized by: ${event.createdByName}</strong><br>
        Email: ${event.createdByEmail}<br>
        Position: ${event.position || "Student Leader"}
      </div>

      <div class="approval-details">
        <div>
          <strong><i class="fas fa-calendar"></i> Date</strong>
          <p>${event.date}</p>
        </div>
        <div>
          <strong><i class="fas fa-clock"></i> Time</strong>
          <p>${event.startTime} - ${event.endTime}</p>
        </div>
        <div>
          <strong><i class="fas fa-map-marker"></i> Venue</strong>
          <p>${event.venue}</p>
        </div>
        <div>
          <strong><i class="fas fa-info"></i> Status</strong>
          <p>${event.status}</p>
        </div>
      </div>

      <div class="approval-actions">
        <button class="btn success" onclick="approveEvent(${event.id})">
          <i class="fas fa-check"></i> Approve
        </button>
        <button class="btn danger" onclick="showDenialModal(${event.id})">
          <i class="fas fa-times"></i> Deny
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}

async function approveEvent(eventId) {
  if (!confirm("Are you sure you want to approve this event?")) return;

  try {
    await apiRequest(`/events/${eventId}/approve`, { method: "PUT" });
    showNotification("Event approved! Students have been notified.", "success");
    pendingEvents = pendingEvents.filter((e) => e.id !== eventId);
    renderPendingEvents();
  } catch (error) {
    showNotification("Failed to approve event", "error");
    console.error("Approve error:", error);
  }
}

function showDenialModal(eventId) {
  currentDenialEventId = eventId;
  document.getElementById("denialModal").style.display = "flex";
  document.getElementById("denialReason").value = "";
  document.getElementById("denialReason").focus();
}

function closeDenialModal() {
  document.getElementById("denialModal").style.display = "none";
  currentDenialEventId = null;
}

async function confirmDeny() {
  if (!currentDenialEventId) return;

  const reason = document.getElementById("denialReason").value.trim();
  if (!reason) {
    showNotification("Please provide a reason for denial", "warning");
    return;
  }

  try {
    await apiRequest(`/events/${currentDenialEventId}/deny`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
    showNotification("Event denied! Organizer has been notified.", "success");
    pendingEvents = pendingEvents.filter((e) => e.id !== currentDenialEventId);
    renderPendingEvents();
    closeDenialModal();
  } catch (error) {
    showNotification("Failed to deny event", "error");
    console.error("Deny error:", error);
  }
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  const modal = document.getElementById("denialModal");
  if (e.target === modal) {
    closeDenialModal();
  }
});

// Notification system
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
