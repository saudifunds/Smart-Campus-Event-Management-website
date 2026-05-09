import React, { useState, useEffect } from "react";
import { Layout } from "../components";
import { useApi, useNotification } from "../hooks";

export default function AnalyticsPage() {
  const { request: callApi, loading } = useApi();
  const { showError } = useNotification();
  const [stats, setStats] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const data = await callApi({ url: "/events/analytics" });
      setStats(data);
    } catch (err) {
      showError("Failed to fetch analytics data");
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !stats) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!stats) return <Layout>No data available.</Layout>;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-600">Overview of campus event activity and user engagement</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Events</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalEvents}</p>
          <div className="mt-2 text-xs text-green-600 font-bold">↑ 12% from last month</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Active Now</p>
          <p className="text-3xl font-bold text-indigo-600">
            {stats.eventsByStatus.find(s => s.status === 'Active')?.count || 0}
          </p>
          <div className="mt-2 text-xs text-gray-400">Currently happening</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-800">
            {stats.usersByRole.reduce((acc, curr) => acc + curr.count, 0)}
          </p>
          <div className="mt-2 text-xs text-gray-400">Registered accounts</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Upcoming</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.eventsByStatus.find(s => s.status === 'Upcoming')?.count || 0}
          </p>
          <div className="mt-2 text-xs text-gray-400">Scheduled events</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Events by Status (CSS Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Events by Status</h3>
          <div className="space-y-4">
            {stats.eventsByStatus.map((status) => {
              const percentage = (status.count / stats.totalEvents) * 100;
              const color = status.status === 'Upcoming' ? 'bg-blue-500' : 
                            status.status === 'Active' ? 'bg-green-500' :
                            status.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-400';
              return (
                <div key={status.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{status.status}</span>
                    <span className="text-gray-500">{status.count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Venues */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Top Venues</h3>
          <div className="space-y-4">
            {stats.roomUsage.slice(0, 5).map((venue) => {
              const maxUsage = stats.roomUsage[0]?.count || 1;
              const percentage = (venue.count / maxUsage) * 100;
              return (
                <div key={venue.venue}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{venue.venue}</span>
                    <span className="text-gray-500">{venue.count} events</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-indigo-400 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Top Event Organizers</h3>
          <div className="grid md:grid-cols-5 gap-4">
            {stats.topEventCreators.map((creator, i) => (
              <div key={creator.name} className="bg-gray-50 p-4 rounded-xl text-center">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                  {i + 1}
                </div>
                <div className="font-bold text-gray-800 text-sm truncate" title={creator.name}>{creator.name}</div>
                <div className="text-xs text-gray-500">{creator.eventsCreated} events</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
