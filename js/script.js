// ===== Role-Based Dashboard Logic =====

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
      <a href="index.html" class="active">🏠 Dashboard</a>
      <a href="rooms.html">🏫 Rooms</a>
      <a href="events.html">📅 Events</a>
      <a href="users.html">👥 Users</a>
    `;
  } else if (role === "Staff") {
    menuHTML = `
      <a href="index.html" class="active">🏠 Dashboard</a>
      <a href="events.html">📅 Manage Events</a>
      <a href="rooms.html">🏫 Check Rooms</a>
    `;
  } else if (role === "Student") {
    menuHTML = `
      <a href="index.html" class="active">🏠 Dashboard</a>
      <a href="events.html">📅 View Events</a>
      <a href="rooms.html">🏫 Available Rooms</a>
    `;
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

  dashboardContent.innerHTML = html;
}

// ===== Logout =====
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

// ===== Initialize Dashboard =====
window.onload = () => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    loadSidebar(user.role);
    loadDashboard(user.role, user.name);
  }
};
