// ===== Smart Campus Calendar View =====
const calendarDays = document.getElementById("calendarDays");
const monthYearEl = document.getElementById("monthYear");
const selectedDateEl = document.getElementById("selectedDate");
const dayEventsEl = document.getElementById("dayEvents");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const notificationContainer = document.getElementById("notificationContainer");

let currentDate = new Date();
let allEvents = [];
let selectedDate = null;

// Load events from API
async function loadAllEvents() {
  try {
    allEvents = await apiRequest("/events", { method: "GET" });
    renderCalendar();
    showNotification("📅 Calendar loaded successfully!", "success");
  } catch (err) {
    console.error(err);
    showNotification("❌ Unable to load events", "error");
  }
}

// Show notification
function showNotification(message, type = "info") {
  const note = document.createElement("div");
  note.className = `notification ${type}`;
  note.textContent = message;
  notificationContainer.appendChild(note);
  setTimeout(() => {
    note.remove();
  }, 6000);
}

// Get events for a specific date
function getEventsForDate(date) {
  const dateStr = date.toISOString().split('T')[0];
  return allEvents.filter(event => event.date === dateStr);
}

// Get event status
function getEventStatus(event) {
  const now = new Date();
  const start = new Date(`${event.date}T${event.startTime}`);
  const end = new Date(`${event.date}T${event.endTime}`);

  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Active";
  return "Expired";
}

// Render calendar month
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Update header
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  monthYearEl.textContent = `${monthNames[month]} ${year}`;

  // Clear previous calendar
  calendarDays.innerHTML = "";

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day empty";
    calendarDays.appendChild(emptyCell);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-day";

    // Highlight today
    const today = new Date();
    if (dateObj.toDateString() === today.toDateString()) {
      dayCell.classList.add("today");
    }

    // Check if date has events
    const eventsForDay = getEventsForDate(dateObj);
    if (eventsForDay.length > 0) {
      dayCell.classList.add("has-events");
      const eventCount = document.createElement("span");
      eventCount.className = "event-count";
      eventCount.textContent = eventsForDay.length;
      dayCell.appendChild(eventCount);
    }

    const dayNum = document.createElement("div");
    dayNum.className = "day-number";
    dayNum.textContent = day;
    dayCell.appendChild(dayNum);

    // Add event dots
    eventsForDay.slice(0, 3).forEach(event => {
      const dot = document.createElement("div");
      dot.className = `event-dot ${getEventStatus(event).toLowerCase()}`;
      dayCell.appendChild(dot);
    });

    // Click to select date
    dayCell.addEventListener("click", () => selectDate(dateObj));
    calendarDays.appendChild(dayCell);
  }

  // If a date was previously selected, keep it selected
  if (selectedDate) {
    selectDate(selectedDate, true);
  }
}

// Select a date and show its events
function selectDate(dateObj, justRender = false) {
  selectedDate = dateObj;
  const dateStr = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  selectedDateEl.textContent = `📅 ${dateStr}`;
  dayEventsEl.innerHTML = "";

  const eventsForDay = getEventsForDate(dateObj);

  if (eventsForDay.length === 0) {
    dayEventsEl.innerHTML = "<p style='color: #888; text-align: center;'>No events scheduled</p>";
  } else {
    eventsForDay.forEach(event => {
      const eventCard = document.createElement("div");
      eventCard.className = `event-card ${getEventStatus(event).toLowerCase()}`;

      const status = getEventStatus(event);
      eventCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <h4>${event.name}</h4>
          <span class="event-status-badge">${status}</span>
        </div>
        <p><strong>🕐 Time:</strong> ${event.startTime} - ${event.endTime}</p>
        <p><strong>📍 Venue:</strong> ${event.venue}</p>
      `;
      dayEventsEl.appendChild(eventCard);
    });
  }

  // Highlight selected date in calendar
  document.querySelectorAll(".calendar-day").forEach(cell => {
    cell.classList.remove("selected");
  });
  const allDays = document.querySelectorAll(".calendar-day:not(.empty)");
  const dayNum = dateObj.getDate();
  let currentDayIndex = 0;
  for (let i = 0; i < allDays.length; i++) {
    const dayText = allDays[i].querySelector(".day-number")?.textContent;
    if (parseInt(dayText) === dayNum) {
      allDays[i].classList.add("selected");
      break;
    }
  }

  if (!justRender) {
    const eventCount = eventsForDay.length;
    if (eventCount > 0) {
      showNotification(`📍 ${eventCount} event(s) on ${dateStr.split(",")[0]}`, "info");
    }
  }
}

// Navigation buttons
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Initialize calendar with today's date selected
window.addEventListener("load", () => {
  loadAllEvents();
  selectDate(new Date());
});

// Auto-refresh calendar every minute to update statuses
setInterval(() => {
  if (selectedDate) {
    selectDate(selectedDate, true);
  }
}, 60000);
