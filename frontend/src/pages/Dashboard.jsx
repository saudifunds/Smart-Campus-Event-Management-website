import React, { useEffect, useState } from "react";
import { Layout } from "../components";
import { useAuth } from "../hooks";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    activeRooms: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    // TODO: Fetch dashboard statistics
    setStats({
      totalEvents: 12,
      upcomingEvents: 5,
      activeRooms: 8,
      totalUsers: 45,
    });
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">Role: {user?.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon="📅"
            color="bg-blue-50"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon="⏰"
            color="bg-green-50"
          />
          <StatCard
            title="Active Rooms"
            value={stats.activeRooms}
            icon="🚪"
            color="bg-purple-50"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color="bg-orange-50"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Events", "Rooms", "Calendar"].map((action) => (
              <div
                key={action}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <p className="font-semibold text-gray-700">{action}</p>
                <p className="text-sm text-gray-500">
                  Manage {action.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="font-semibold text-indigo-900 mb-2">
            Welcome to Smart Campus
          </h3>
          <p className="text-indigo-800 text-sm">
            This is a modern event management system built with React. Navigate
            using the sidebar to access different features.
          </p>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} rounded-lg p-6 border border-gray-200`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-semibold mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
