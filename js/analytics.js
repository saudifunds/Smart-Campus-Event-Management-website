// analytics.js — Premium Analytics Dashboard

document.addEventListener("DOMContentLoaded", () => {
  console.log("📊 Analytics page loaded");
  checkAuth();
  renderSidebar();
  loadAnalytics();
});

// Chart.js global defaults for matching theme
Chart.defaults.color = "#111827";
Chart.defaults.borderColor = "rgba(0, 0, 0, 0.08)";
Chart.defaults.font.family = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

// Theme-matched color palette
const chartColors = {
  accent: "#c41e3a",
  secondary: "#374151",
  success: "#16a34a",
  danger: "#dc2626",
  warning: "#d97706",
  blue: "#2563eb",
  purple: "#7c3aed",
  cyan: "#0891b2",
  pink: "#db2777",
  orange: "#ea580c",
};

const gradientPalette = [
  chartColors.accent,
  chartColors.blue,
  chartColors.success,
  chartColors.warning,
  chartColors.purple,
  chartColors.cyan,
  chartColors.pink,
  chartColors.orange,
  chartColors.danger,
  chartColors.secondary,
];

let currentAnalyticsData = null;

async function loadAnalytics() {
  const contentEl = document.getElementById("analyticsContent");
  const loadingEl = document.getElementById("analyticsLoading");

  try {
    const data = await apiRequest("/events/analytics", { method: "GET" });
    currentAnalyticsData = data;
    console.log("✅ Analytics data loaded:", data);

    // Calculate additional stats
    const totalUsers = data.usersByRole
      ? data.usersByRole.reduce((sum, r) => sum + r.count, 0)
      : 0;
    const totalVenues = data.roomUsage ? data.roomUsage.length : 0;
    const pendingCount = data.eventsByStatus
      ? data.eventsByStatus.find((s) => s.status === "Pending")?.count || 0
      : 0;

    // Build the dashboard HTML
    contentEl.innerHTML = `
      <!-- Stats Cards -->
      <div class="analytics-stats">
        <div class="stat-card">
          <div class="stat-icon events">
            <i class="fas fa-calendar-check"></i>
          </div>
          <h3>Total Events</h3>
          <div class="stat-value" id="animTotalEvents">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon users">
            <i class="fas fa-users"></i>
          </div>
          <h3>Total Users</h3>
          <div class="stat-value" id="animTotalUsers">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rooms">
            <i class="fas fa-door-open"></i>
          </div>
          <h3>Venues Used</h3>
          <div class="stat-value" id="animTotalVenues">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pending">
            <i class="fas fa-clock"></i>
          </div>
          <h3>Pending Review</h3>
          <div class="stat-value" id="animPending">0</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <div class="chart-card">
          <h3><i class="fas fa-chart-pie" style="color: var(--accent); margin-right: 8px;"></i>Events by Status</h3>
          <p class="chart-subtitle">Distribution of all event statuses</p>
          <div class="chart-wrapper">
            <canvas id="eventsByStatusChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <h3><i class="fas fa-chart-donut" style="color: #3b82f6; margin-right: 8px;"></i>Users by Role</h3>
          <p class="chart-subtitle">Breakdown of user roles on the platform</p>
          <div class="chart-wrapper">
            <canvas id="usersByRoleChart"></canvas>
          </div>
        </div>

        <div class="chart-card full-width">
          <h3><i class="fas fa-building" style="color: #22c55e; margin-right: 8px;"></i>Room / Venue Usage</h3>
          <p class="chart-subtitle">Number of events held at each venue</p>
          <div class="chart-wrapper">
            <canvas id="roomUsageChart"></canvas>
          </div>
        </div>

        <div class="chart-card full-width">
          <h3><i class="fas fa-trophy" style="color: #f9a825; margin-right: 8px;"></i>Top Event Creators</h3>
          <p class="chart-subtitle">Users who have created the most events</p>
          <div id="topCreatorsContainer"></div>
        </div>
      </div>
    `;

    // Animate stat counters
    animateCounter("animTotalEvents", data.totalEvents || 0);
    animateCounter("animTotalUsers", totalUsers);
    animateCounter("animTotalVenues", totalVenues);
    animateCounter("animPending", pendingCount);

    // Render charts
    renderStatusChart(data.eventsByStatus || []);
    renderRoleChart(data.usersByRole || []);
    renderRoomChart(data.roomUsage || []);
    renderTopCreators(data.topEventCreators || []);
  } catch (error) {
    console.error("❌ Load analytics error:", error);
    contentEl.innerHTML = `
      <div class="analytics-error">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Failed to Load Analytics</h3>
        <p>${error.message || "Could not connect to the server."}</p>
        <button class="btn primary" onclick="loadAnalytics()">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
}

// ===== Counter Animation =====
function animateCounter(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const duration = 1200;
  const start = performance.now();
  const from = 0;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// ===== Events by Status (Doughnut) =====
function renderStatusChart(statusData) {
  const ctx = document.getElementById("eventsByStatusChart");
  if (!ctx || statusData.length === 0) return;

  const statusColors = {
    Upcoming: chartColors.blue,
    Active: chartColors.success,
    Expired: chartColors.secondary,
    Pending: chartColors.warning,
    Denied: chartColors.danger,
  };

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: statusData.map((s) => s.status),
      datasets: [
        {
          data: statusData.map((s) => s.count),
          backgroundColor: statusData.map(
            (s) => statusColors[s.status] || chartColors.accent,
          ),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10,
            font: { size: 12, weight: 500 },
          },
        },
      },
    },
  });
}

// ===== Users by Role (Doughnut) =====
function renderRoleChart(roleData) {
  const ctx = document.getElementById("usersByRoleChart");
  if (!ctx || roleData.length === 0) return;

  const roleColors = {
    Admin: chartColors.accent,
    Staff: chartColors.blue,
    Student: chartColors.success,
  };

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: roleData.map((r) => r.role),
      datasets: [
        {
          data: roleData.map((r) => r.count),
          backgroundColor: roleData.map(
            (r) => roleColors[r.role] || chartColors.purple,
          ),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10,
            font: { size: 12, weight: 500 },
          },
        },
      },
    },
  });
}

// ===== Room Usage (Bar) =====
function renderRoomChart(roomData) {
  const ctx = document.getElementById("roomUsageChart");
  if (!ctx || roomData.length === 0) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: roomData.map((r) => r.venue),
      datasets: [
        {
          label: "Events",
          data: roomData.map((r) => r.count),
          backgroundColor: roomData.map(
            (_, i) => gradientPalette[i % gradientPalette.length],
          ),
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 50,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: "x",
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: 500 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(196, 181, 160, 0.1)" },
          ticks: {
            stepSize: 1,
            font: { size: 12 },
          },
        },
      },
    },
  });
}

// ===== Top Event Creators (Table with bars) =====
function renderTopCreators(creators) {
  const container = document.getElementById("topCreatorsContainer");
  if (!container) return;

  // Filter out users with 0 events
  const activeCreators = creators.filter((c) => c.eventsCreated > 0);
  const maxEvents = Math.max(...activeCreators.map((c) => c.eventsCreated), 1);

  if (activeCreators.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--muted);">
        <i class="fas fa-users" style="font-size: 32px; opacity: 0.4; margin-bottom: 12px;"></i>
        <p>No event creators found yet.</p>
      </div>
    `;
    return;
  }

  let tableHTML = `
    <table class="creators-table">
      <thead>
        <tr>
          <th style="width: 50px;">Rank</th>
          <th>Name</th>
          <th>Events Created</th>
        </tr>
      </thead>
      <tbody>
  `;

  activeCreators.forEach((creator, index) => {
    const rankClass =
      index === 0
        ? "gold"
        : index === 1
          ? "silver"
          : index === 2
            ? "bronze"
            : "default";
    const barWidth = (creator.eventsCreated / maxEvents) * 100;

    tableHTML += `
      <tr>
        <td><span class="creator-rank ${rankClass}">${index + 1}</span></td>
        <td><strong>${creator.name}</strong></td>
        <td>
          <div class="event-count-bar">
            <div class="bar">
              <div class="bar-fill" style="width: ${barWidth}%;"></div>
            </div>
            <span>${creator.eventsCreated}</span>
          </div>
        </td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  container.innerHTML = tableHTML;
}

// ===== Report Functions =====
window.openReportModal = function() {
  const modal = document.getElementById("reportModal");
  if (!modal || !currentAnalyticsData) return;

  const data = currentAnalyticsData;
  const dateStr = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  document.getElementById("reportDate").textContent = `Generated on ${dateStr}`;
  
  // Totals
  const totalEvents = data.eventsByStatus ? data.eventsByStatus.reduce((sum, s) => sum + s.count, 0) : 0;
  const totalUsers = data.usersByRole ? data.usersByRole.reduce((sum, r) => sum + r.count, 0) : 0;
  const totalRooms = data.roomUsage ? data.roomUsage.length : 0;
  const pending = data.eventsByStatus ? (data.eventsByStatus.find(s => s.status === 'Pending')?.count || 0) : 0;

  document.getElementById("reportEvents").textContent = totalEvents;
  document.getElementById("reportUsers").textContent = totalUsers;
  document.getElementById("reportRooms").textContent = totalRooms;
  document.getElementById("reportPending").textContent = pending;

  // Executive Summary Logic
  const busiestRoom = data.roomUsage && data.roomUsage.length > 0 
    ? [...data.roomUsage].sort((a,b) => b.count - a.count)[0].room 
    : "None";
  
  const mostActiveRole = data.usersByRole && data.usersByRole.length > 0
    ? [...data.usersByRole].sort((a,b) => b.count - a.count)[0].role
    : "None";

  let summary = `As of ${dateStr}, the Smart Campus system has managed a total of ${totalEvents} events across ${totalRooms} active venues. `;
  summary += `The user base of ${totalUsers} is primarily comprised of ${mostActiveRole} members. `;
  summary += `Currently, the most utilized venue is ${busiestRoom}. `;
  
  if (pending > 5) {
    summary += `There is a high volume of pending approvals (${pending}), suggesting an urgent need for administrative review. `;
  } else if (pending > 0) {
    summary += `There are ${pending} events awaiting approval. `;
  } else {
    summary += `All event requests have been processed, and the system is currently up-to-date. `;
  }

  document.getElementById("reportSummary").textContent = summary;
  modal.style.display = "flex";
};

window.closeReportModal = function() {
  const modal = document.getElementById("reportModal");
  if (modal) modal.style.display = "none";
};
