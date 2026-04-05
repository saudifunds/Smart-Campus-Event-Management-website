// ===== Role-Based Dashboard Logic (Backend-auth aware) =====

// Get logged-in user
const user = JSON.parse(localStorage.getItem("loggedInUser"));
const sidebarMenu = document.getElementById("sidebarMenu");
const dashboardContent = document.getElementById("dashboardContent");
const dashboardTitle = document.getElementById("dashboardTitle");

if (!user) {
  window.location.href = "login.html";
}

// ===== Sidebar Setup by Role =====
function loadSidebar(role) {
  let menuHTML = "";

  if (role === "Admin") {
    menuHTML = `
      <a href="index.html" class="active"><i class="fas fa-home"></i> Dashboard</a>
      <a href="rooms.html"><i class="fas fa-door-open"></i> Rooms</a>
      <a href="events.html"><i class="fas fa-calendar-check"></i> Events</a>
      <a href="calendar.html"><i class="fas fa-calendar-days"></i> Calendar</a>
      <a href="users.html"><i class="fas fa-users-gear"></i> Users</a>
      <a href="analytics.html"><i class="fas fa-chart-bar"></i> Analytics</a>
      <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
    `;
  } else if (role === "Staff") {
    menuHTML = `
      <a href="index.html" class="active"><i class="fas fa-home"></i> Dashboard</a>
      <a href="events.html"><i class="fas fa-tasks"></i> Manage Events</a>
      <a href="calendar.html"><i class="fas fa-calendar-days"></i> Calendar</a>
      <a href="rooms.html"><i class="fas fa-building"></i> Check Rooms</a>
      <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
    `;
  } else if (role === "Student") {
    if (user.position) {
      menuHTML = `
        <a href="index.html" class="active"><i class="fas fa-home"></i> Leader Dashboard</a>
        <a href="student-create-event.html"><i class="fas fa-plus-circle"></i> Create Event</a>
        <a href="student-manage-events.html"><i class="fas fa-list-check"></i> Manage Events</a>
        <a href="calendar.html"><i class="fas fa-calendar-days"></i> Calendar</a>
        <a href="rooms.html"><i class="fas fa-building"></i> Available Rooms</a>
        <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
      `;
    } else {
      menuHTML = `
        <a href="index.html" class="active"><i class="fas fa-home"></i> Dashboard</a>
        <a href="student-manage-events.html"><i class="fas fa-list"></i> Events</a>
        <a href="calendar.html"><i class="fas fa-calendar-days"></i> Calendar</a>
        <a href="rooms.html"><i class="fas fa-building"></i> Available Rooms</a>
        <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
      `;
    }
  }
  sidebarMenu.innerHTML = menuHTML;
}

// ===== Dashboard Content by Role =====
function loadDashboard(role, name) {
  let html = "";

  if (role === "Admin") {
    dashboardTitle.textContent = "Admin Dashboard";
    html = `
      <h2>Welcome, ${name} (Admin)</h2>
      <p>You have full control over all Smart Campus modules.</p>
      <div class="card-grid">
        <div class="card">Manage Users</div>
        <div class="card">View Reports</div>
        <div class="card">System Analytics</div>
      </div>
    `;
  } else if (role === "Staff") {
    dashboardTitle.textContent = "Staff Dashboard";
    html = `
      <h2>Welcome, ${name} (Staff)</h2>
      <p>Manage class sessions and view room availability.</p>
      <div class="card-grid">
        <div class="card">Add New Event</div>
        <div class="card">Check Rooms</div>
        <div class="card">Student Engagement</div>
      </div>
    `;
  } else if (role === "Student") {
    if (user.position) {
      dashboardTitle.textContent = "Leader Dashboard";
      html = `
        <h2>Welcome, ${name} (Student Leader)</h2>
        <p>Manage and create campus events for administrative approval.</p>
        <div class="card-grid">
          <div class="card">Upcoming Sessions</div>
          <div class="card">Events Management</div>
          <div class="card">Room Finder</div>
        </div>
      `;
    } else {
      dashboardTitle.textContent = "Student Dashboard";
      html = `
        <h2>Welcome, ${name} (Student)</h2>
        <p>View your upcoming classes and campus events.</p>
        <div class="card-grid">
          <div class="card">Upcoming Sessions</div>
          <div class="card">Events Calendar</div>
          <div class="card">Room Finder</div>
        </div>
      `;
    }
  }

  dashboardContent.innerHTML = html;
}

// ===== Logout =====
function logout() {
  clearAuthSession();
  window.location.href = "login.html";
}

// ===== Initialize Dashboard =====
window.onload = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (user) {
    loadSidebar(user.role);
    loadDashboard(user.role, user.name);
  }
};

// Theme toggle
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  themeToggle.textContent =
    currentTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

  themeToggle.addEventListener("click", () => {
    const newTheme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    themeToggle.textContent =
      newTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  });
}
