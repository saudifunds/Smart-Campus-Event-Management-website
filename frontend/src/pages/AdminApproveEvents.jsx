import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "../components";
import { useApi, useNotification } from "../hooks";
import { format } from "date-fns";

export default function AdminApproveEvents() {
  const { request: callApi, loading } = useApi();
  const { showSuccess, showError } = useNotification();
  const [pendingEvents, setPendingEvents] = useState([]);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [denyReason, setDenyReason] = useState("");

  const fetchPendingEvents = useCallback(async () => {
    try {
      const data = await callApi({ url: "/events/pending/list" });
      setPendingEvents(data || []);
    } catch (err) {
      showError("Failed to fetch pending events");
    }
  }, [callApi, showError]);

  useEffect(() => {
    fetchPendingEvents();
  }, [fetchPendingEvents]);

  const handleApprove = async (id) => {
    try {
      await callApi({
        url: `/events/${id}/approve`,
        method: "PUT"
      });
      showSuccess("Event approved successfully");
      fetchPendingEvents();
    } catch (err) {
      showError("Failed to approve event");
    }
  };

  const handleDeny = async () => {
    if (!denyReason.trim()) {
      showError("Please provide a reason for denial");
      return;
    }

    try {
      await callApi({
        url: `/events/${selectedEventId}/deny`,
        method: "PUT",
        data: { reason: denyReason }
      });
      showSuccess("Event denied successfully");
      setShowDenyModal(false);
      setDenyReason("");
      fetchPendingEvents();
    } catch (err) {
      showError("Failed to deny event");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Event Approvals</h1>
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
          {pendingEvents.length} Pending
        </span>
      </div>

      {loading && pendingEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : pendingEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-gray-500 text-lg">No pending events to review.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md">
              <div className="p-6 md:flex gap-6">
                {event.imageUrl && (
                  <div className="md:w-48 h-32 mb-4 md:mb-0">
                    <img 
                      src={`http://localhost:4000${event.imageUrl}`} 
                      alt={event.name} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-800">{event.name}</h2>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold uppercase">
                      Pending
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
                    <p>📅 {format(new Date(event.date), "PPP")}</p>
                    <p>🕒 {event.startTime} - {event.endTime}</p>
                    <p>📍 {event.venue}</p>
                    <p>👤 {event.createdByName} ({event.position})</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(event.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex-1 md:flex-none"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEventId(event.id);
                        setShowDenyModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex-1 md:flex-none"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deny Modal */}
      {showDenyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Deny Event Request</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for denying this request. This will be sent to the organizer.</p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              rows="4"
              placeholder="e.g., Venue already booked for another event."
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
            ></textarea>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDenyModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeny}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Confirm Denial
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
