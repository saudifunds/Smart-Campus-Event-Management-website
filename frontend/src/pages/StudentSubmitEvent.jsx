import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "../components";
import { useApi, useNotification, useAuth } from "../hooks";
import { format } from "date-fns";

export default function StudentSubmitEvent() {
  const { user } = useAuth();
  const { request: callApi, loading } = useApi();
  const { showSuccess, showError } = useNotification();
  const [mySubmissions, setMySubmissions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    image: null
  });

  const fetchMySubmissions = useCallback(async () => {
    try {
      const data = await callApi({ url: "/events/my-events" });
      setMySubmissions(data || []);
    } catch (err) {
      showError("Failed to fetch your submissions");
    }
  }, [callApi, showError]);

  useEffect(() => {
    fetchMySubmissions();
  }, [fetchMySubmissions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append("name", formData.name);
    data.append("date", formData.date);
    data.append("startTime", formData.startTime);
    data.append("endTime", formData.endTime);
    data.append("venue", formData.venue);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      await callApi({
        url: "/events",
        method: "POST",
        data,
        headers: { "Content-Type": "multipart/form-data" }
      });
      showSuccess("Event request submitted for approval!");
      setFormData({
        name: "",
        date: "",
        startTime: "",
        endTime: "",
        venue: "",
        image: null
      });
      fetchMySubmissions();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to submit event request");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    
    try {
      await callApi({
        url: `/events/${id}`,
        method: "DELETE"
      });
      showSuccess("Request cancelled");
      fetchMySubmissions();
    } catch (err) {
      showError("Failed to cancel request");
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Submit New Event</h1>
        <p className="text-gray-600">As a {user?.position}, you can propose events for campus-wide visibility.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Submission Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Event Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.startTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.endTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  name="venue"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.venue}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Banner (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={handleFileChange}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit for Approval"}
              </button>
            </form>
          </div>
        </div>

        {/* My Submissions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">My Requests</h2>
          {mySubmissions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <p className="text-gray-500">You haven't submitted any event requests yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {mySubmissions.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">{event.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                      <span>📅 {format(new Date(event.date), "MMM d, yyyy")}</span>
                      <span>📍 {event.venue}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      event.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      event.status === 'Denied' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {event.status}
                    </span>
                    {event.status === 'Pending' && (
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Cancel Request"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
