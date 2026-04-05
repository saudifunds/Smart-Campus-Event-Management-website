// ===== Profile Page Logic =====

const user = JSON.parse(localStorage.getItem("loggedInUser"));
const sidebarMenu = document.getElementById("sidebarMenu");

if (!user) {
  window.location.href = "login.html";
}

// ===== Sidebar Setup by Role =====
function loadSidebar(role) {
  let menuHTML = "";

  if (role === "Admin") {
    menuHTML = `
      <a href="index.html"><i class="fas fa-home"></i> Dashboard</a>
      <a href="rooms.html"><i class="fas fa-door-open"></i> Rooms</a>
      <a href="events.html"><i class="fas fa-calendar-check"></i> Events</a>
      <a href="calendar.html"><i class="fas fa-calendar-days"></i> Calendar</a>
      <a href="users.html"><i class="fas fa-users-gear"></i> Users</a>
      <a href="analytics.html"><i class="fas fa-chart-bar"></i> Analytics</a>
      <a href="profile.html" class="active"><i class="fas fa-user"></i> Profile</a>
    `;
  } else if (role === "Staff") {
    menuHTML = `
      <a href="index.html"><i class="fas fa-home"></i> Dashboard</a>
      <a href="events.html"><i class="fas fa-tasks"></i> Manage Events</a>
      <a href="calendar.html"><i class="fas fa-calendar-days"></i> Calendar</a>
      <a href="rooms.html"><i class="fas fa-building"></i> Check Rooms</a>
      <a href="profile.html" class="active"><i class="fas fa-user"></i> Profile</a>
    `;
  } else if (role === "Student") {
    const hasPosition = user && user.position;
    if (hasPosition) {
      menuHTML = `
        <a href="index.html"><i class="fas fa-home"></i> Leader Dashboard</a>
        <a href="student-create-event.html"><i class="fas fa-plus-circle"></i> Create Event</a>
        <a href="student-manage-events.html"><i class="fas fa-list-check"></i> Manage Events</a>
        <a href="calendar.html"><i class="fas fa-calendar-days"></i> Calendar</a>
        <a href="rooms.html"><i class="fas fa-building"></i> Available Rooms</a>
        <a href="profile.html" class="active"><i class="fas fa-user"></i> Profile</a>
      `;
    } else {
      menuHTML = `
        <a href="index.html"><i class="fas fa-home"></i> Dashboard</a>
        <a href="student-manage-events.html"><i class="fas fa-list"></i> Events</a>
        <a href="calendar.html"><i class="fas fa-calendar-days"></i> Calendar</a>
        <a href="rooms.html"><i class="fas fa-building"></i> Available Rooms</a>
        <a href="profile.html" class="active"><i class="fas fa-user"></i> Profile</a>
      `;
    }
  }

  sidebarMenu.innerHTML = menuHTML;
}

// ===== Update Hero Banner UI =====
function updateHeroUI(profile) {
  const nameEl = document.getElementById("profileName");
  const roleEl = document.getElementById("profileRole");
  const emailEl = document.getElementById("profileEmail");
  const positionEl = document.getElementById("profilePosition");
  const avatarEl = document.getElementById("avatarCircle");

  if (nameEl) nameEl.textContent = profile.name || "—";
  if (roleEl) roleEl.textContent = profile.role || "—";
  if (emailEl) emailEl.textContent = profile.email || "—";

  if (positionEl && profile.position) {
    positionEl.textContent = profile.position;
    positionEl.style.display = "inline-block";
  }

  if (avatarEl) {
    // Use first letter of name as avatar or saved image
    const saved = localStorage.getItem("profileAvatar");
    if (saved) {
      avatarEl.innerHTML = `<img src="${saved}" alt="Avatar">`;
    } else {
      avatarEl.textContent = (profile.name || "?").charAt(0).toUpperCase();
    }
  }

  // Stats
  const statRole = document.getElementById("statRole");
  const statInterestCount = document.getElementById("statInterestCount");
  const statEvents = document.getElementById("statEvents");

  if (statRole) statRole.textContent = profile.role || "—";

  const interests = profile.interests ? tryParseJSON(profile.interests) : [];
  if (statInterestCount) statInterestCount.textContent = interests.length;

  // Render interest tags
  renderInterestTags(interests);

  // Count events created by user
  if (statEvents) {
    apiRequest("/events/my-events", { method: "GET" })
      .then(events => { statEvents.textContent = events.length; })
      .catch(() => { statEvents.textContent = "0"; });
  }
}

function renderInterestTags(interests) {
  const container = document.getElementById("interestTags");
  if (!container) return;
  if (!interests || interests.length === 0) {
    container.innerHTML = '<span class="tag-empty">No interests added yet</span>';
    return;
  }
  container.innerHTML = interests.map(i => `<span class="interest-tag">${i}</span>`).join("");
}

function tryParseJSON(str) {
  try { return JSON.parse(str); } catch { return []; }
}

// ===== Avatar Upload Preview =====
const avatarUpload = document.getElementById("avatarUpload");
if (avatarUpload) {
  avatarUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      localStorage.setItem("profileAvatar", dataUrl);
      const avatarEl = document.getElementById("avatarCircle");
      if (avatarEl) avatarEl.innerHTML = `<img src="${dataUrl}" alt="Avatar">`;
    };
    reader.readAsDataURL(file);
  });
}

// ===== Initialize Profile Page =====
window.onload = () => {
  if (user) {
    loadSidebar(user.role);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  const form = document.getElementById("profileForm");
  if (form) form.addEventListener("submit", updateProfile);
});

async function loadProfile() {
  try {
    const profile = await apiRequest("/users/profile", { method: "GET" });
    document.getElementById("name").value = profile.name;
    document.getElementById("email").value = profile.email;
    document.getElementById("bio").value = profile.bio || "";
    document.getElementById("interests").value = profile.interests
      ? tryParseJSON(profile.interests).join(", ")
      : "";
    const prefs = profile.notification_preferences
      ? tryParseJSON(profile.notification_preferences)
      : {};
    document.getElementById("emailNotifications").checked = prefs.email || false;

    // Merge role/position from localStorage into profile for display
    const fullProfile = { ...profile, role: user?.role, position: user?.position };
    updateHeroUI(fullProfile);
  } catch (error) {
    console.error("Load profile error:", error);
  }
}

async function updateProfile(e) {
  e.preventDefault();
  const btn = document.getElementById("saveProfileBtn");
  if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; btn.disabled = true; }

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const bio = document.getElementById("bio").value;
  const interests = document.getElementById("interests").value
    .split(",").map(i => i.trim()).filter(i => i);
  const emailNotifications = document.getElementById("emailNotifications").checked;

  try {
    await apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify({ name, email, bio, interests, notification_preferences: { email: emailNotifications } }),
    });

    const updatedUser = { ...user, name, email };
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

    // Update the hero live
    const nameEl = document.getElementById("profileName");
    if (nameEl) nameEl.textContent = name;
    renderInterestTags(interests);
    const countEl = document.getElementById("statInterestCount");
    if (countEl) countEl.textContent = interests.length;

    if (btn) { btn.innerHTML = '<i class="fas fa-check"></i> Saved!'; btn.disabled = false; }
    setTimeout(() => { if (btn) btn.innerHTML = '<i class="fas fa-save"></i> Save Changes'; }, 2000);
  } catch (error) {
    console.error("Update profile error:", error);
    if (btn) { btn.innerHTML = '<i class="fas fa-times"></i> Failed'; btn.disabled = false; }
    setTimeout(() => { if (btn) btn.innerHTML = '<i class="fas fa-save"></i> Save Changes'; }, 2000);
  }
}


if (!user) {
  window.location.href = "login.html";
}

// ===== Sidebar Setup by Role =====
function loadSidebar(role) {
  let menuHTML = "";

  if (role === "Admin") {
    menuHTML = `
      <a href="index.html"><i class="fas fa-home"></i> Dashboard</a>
      <a href="rooms.html"><i class="fas fa-door-open"></i> Rooms</a>
      <a href="events.html"><i class="fas fa-calendar-check"></i> Events</a>
      <a href="calendar.html"><i class="fas fa-calendar-days"></i> Calendar</a>
      <a href="users.html"><i class="fas fa-users-gear"></i> Users</a>
      <a href="analytics.html"><i class="fas fa-chart-bar"></i> Analytics</a>
      <a href="profile.html" class="active"><i class="fas fa-user"></i> Profile</a>
    `;
  } else if (role === "Staff") {
    menuHTML = `
      <a href="index.html"><i class="fas fa-home"></i> Dashboard</a>
      <a href="events.html"><i class="fas fa-tasks"></i> Manage Events</a>
      <a href="calendar.html"><i class="fas fa-calendar-days"></i> Calendar</a>
      <a href="rooms.html"><i class="fas fa-building"></i> Check Rooms</a>
      <a href="profile.html" class="active"><i class="fas fa-user"></i> Profile</a>
    `;
  } else if (role === "Student") {
    menuHTML = `
      <a href="index.html"><i class="fas fa-home"></i> Dashboard</a>
      <a href="events.html"><i class="fas fa-list"></i> Events</a>
      <a href="calendar.html"><i class="fas fa-calendar-days"></i> Calendar</a>
      <a href="rooms.html"><i class="fas fa-building"></i> Available Rooms</a>
      <a href="profile.html" class="active"><i class="fas fa-user"></i> Profile</a>
    `;
  }

  sidebarMenu.innerHTML = menuHTML;
}

// ===== Initialize Profile Page =====
window.onload = () => {
  if (user) {
    loadSidebar(user.role);
  }
};

// profile.js
document.addEventListener("DOMContentLoaded", () => {
  loadProfile();

  const form = document.getElementById("profileForm");
  form.addEventListener("submit", updateProfile);
});

async function loadProfile() {
  try {
    const profile = await apiRequest("/users/profile", { method: "GET" });
    document.getElementById("name").value = profile.name;
    document.getElementById("email").value = profile.email;
    document.getElementById("bio").value = profile.bio || "";
    document.getElementById("interests").value = profile.interests
      ? JSON.parse(profile.interests).join(", ")
      : "";
    const prefs = profile.notification_preferences
      ? JSON.parse(profile.notification_preferences)
      : {};
    document.getElementById("emailNotifications").checked =
      prefs.email || false;
  } catch (error) {
    console.error("Load profile error:", error);
    alert("Failed to load profile");
  }
}

async function updateProfile(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const bio = document.getElementById("bio").value;
  const interests = document
    .getElementById("interests")
    .value.split(",")
    .map((i) => i.trim())
    .filter((i) => i);
  const emailNotifications =
    document.getElementById("emailNotifications").checked;

  try {
    await apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify({
        name,
        email,
        bio,
        interests,
        notification_preferences: { email: emailNotifications },
      }),
    });

    // Update localStorage with new user data
    const updatedUser = { ...user, name, email };
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Update profile error:", error);
    alert("Failed to update profile");
  }
}
