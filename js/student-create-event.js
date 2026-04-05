// ===== Student Create Event Page =====
const createEventForm = document.getElementById("createEventForm");
const successMessage = document.getElementById("successMessage");
const notificationContainer = document.getElementById("notificationContainer");

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

// Handle form submission
createEventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const eventPayload = {
    name: document.getElementById("eventName").value,
    date: document.getElementById("eventDate").value,
    startTime: document.getElementById("startTime").value,
    endTime: document.getElementById("endTime").value,
    venue: document.getElementById("eventVenue").value,
  };

  // Validate that end time is after start time
  if (eventPayload.startTime >= eventPayload.endTime) {
    showNotification("❌ End time must be after start time", "error");
    return;
  }

  try {
    await apiRequest("/events", {
      method: "POST",
      body: JSON.stringify(eventPayload),
    });

    // Show success message
    successMessage.style.display = "block";
    createEventForm.reset();

    showNotification("✅ Event created successfully!", "success");

    // Reset success message after 3 seconds
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);

  } catch (err) {
    showNotification(`❌ ${err.message || "Unable to create event"}`, "error");
    console.error(err);
  }
});
