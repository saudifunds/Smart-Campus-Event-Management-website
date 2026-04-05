// analytics.js
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loadAnalytics();

  document.getElementById("logout").addEventListener("click", logout);
});

async function loadAnalytics() {
  try {
    const data = await apiRequest("/events/analytics", { method: "GET" });

    document.getElementById("totalEvents").textContent = data.totalEvents;

    // Events by Status
    const statusCtx = document
      .getElementById("eventsByStatusChart")
      .getContext("2d");
    new Chart(statusCtx, {
      type: "pie",
      data: {
        labels: data.eventsByStatus.map((s) => s.status),
        datasets: [
          {
            data: data.eventsByStatus.map((s) => s.count),
            backgroundColor: ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56"],
          },
        ],
      },
    });

    // Room Usage
    const roomCtx = document.getElementById("roomUsageChart").getContext("2d");
    new Chart(roomCtx, {
      type: "bar",
      data: {
        labels: data.roomUsage.map((r) => r.venue),
        datasets: [
          {
            label: "Events",
            data: data.roomUsage.map((r) => r.count),
            backgroundColor: "#36a2eb",
          },
        ],
      },
    });

    // Users by Role
    const roleCtx = document
      .getElementById("usersByRoleChart")
      .getContext("2d");
    new Chart(roleCtx, {
      type: "doughnut",
      data: {
        labels: data.usersByRole.map((r) => r.role),
        datasets: [
          {
            data: data.usersByRole.map((r) => r.count),
            backgroundColor: ["#ff6384", "#36a2eb", "#cc65fe"],
          },
        ],
      },
    });

    // Top Event Creators
    const creatorCtx = document
      .getElementById("topCreatorsChart")
      .getContext("2d");
    new Chart(creatorCtx, {
      type: "horizontalBar",
      data: {
        labels: data.topEventCreators.map((c) => c.name),
        datasets: [
          {
            label: "Events Created",
            data: data.topEventCreators.map((c) => c.eventsCreated),
            backgroundColor: "#ffce56",
          },
        ],
      },
      options: {
        scales: {
          xAxes: [{ ticks: { beginAtZero: true } }],
        },
      },
    });
  } catch (error) {
    console.error("Load analytics error:", error);
    alert("Failed to load analytics");
  }
}
