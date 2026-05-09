import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks";

/**
 * Layout component with Sidebar and main content
 */
const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  const adminMenuItems = [
    { href: "/", label: "📊 Dashboard", roles: ["Admin", "Staff", "Student"] },
    { href: "/events", label: "📅 Manage Events", roles: ["Admin", "Staff"] },
    { href: "/admin-approve-events", label: "✨ Approvals", roles: ["Admin", "Staff"] },
    { href: "/rooms", label: "🚪 Rooms", roles: ["Admin", "Staff", "Student"] },
    { href: "/users", label: "👥 Users", roles: ["Admin"] },
    {
      href: "/calendar",
      label: "📆 Calendar",
      roles: ["Admin", "Staff", "Student"],
    },
    { href: "/analytics", label: "📈 Analytics", roles: ["Admin"] },
    { href: "/profile", label: "👤 Profile", roles: ["Admin", "Staff", "Student"] },
  ];

  const studentMenuItems = [
    { href: "/", label: "📊 Dashboard", roles: ["Student"] },
    { href: "/student-events", label: "📅 Events", roles: ["Student"] },
    ...(user?.position
      ? [{ href: "/student-submit-event", label: "✍️ Submit Event", roles: ["Student"] }]
      : []),
    { href: "/calendar", label: "📆 Calendar", roles: ["Student"] },
    { href: "/profile", label: "👤 Profile", roles: ["Student"] },
  ];

  const menuItems = ["Admin", "Staff"].includes(user?.role)
    ? adminMenuItems
    : studentMenuItems;

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white shadow-lg">
        <div className="p-6 border-b border-indigo-800">
          <h1 className="text-2xl font-bold">SmartCampus</h1>
        </div>

        <nav className="p-6">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="block px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-indigo-800">
          <div className="mb-4">
            <p className="text-sm text-indigo-300">Logged in as</p>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs text-indigo-300">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
export default Layout;
