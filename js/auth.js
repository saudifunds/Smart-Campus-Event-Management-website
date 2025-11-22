// ===== Smart Campus Role-Based Access Control =====

// Pages and roles allowed to access them
const accessRules = {
    "index.html": ["Admin", "Staff", "Student"],
    "rooms.html": ["Admin", "Staff", "Student"],
    "events.html": ["Admin", "Staff", "Student"],
    "users.html": ["Admin"], // Only admin can manage users
    "login.html": [],
    "signup.html": [],
    "forgot.html": []
};

// Run access control when page loads
window.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    // Redirect to login if not logged in
    if (!user && !["login.html", "signup.html", "forgot.html"].includes(currentPage)) {
        window.location.href = "login.html";
        return;
    }

    // Check role permissions
    if (user) {
        const allowedRoles = accessRules[currentPage];
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            showAccessDenied();
            window.location.href = "index.html";
        }
    }
});
function showAccessDenied() {
    const note = document.createElement("div");
    note.textContent = "🚫 Access Denied";
    note.style.position = "fixed";
    note.style.top = "20px";
    note.style.right = "20px";
    note.style.background = "#ef4444";
    note.style.color = "#fff";
    note.style.padding = "12px 18px";
    note.style.borderRadius = "8px";
    note.style.fontWeight = "600";
    note.style.zIndex = "2000";
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 2500);
}
