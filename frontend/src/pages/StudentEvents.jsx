import React, { useEffect, useState } from "react";
import { Layout } from "../components";
import { useEvents } from "../hooks";

export default function StudentEventsPage() {
  const { getEvents, loading } = useEvents();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Campus Events</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full text-center text-gray-600 py-12">
              <p className="text-lg">No events available at the moment.</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {event.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📅 {event.date}</p>
                  <p>
                    🕐 {event.startTime} - {event.endTime}
                  </p>
                  <p>📍 {event.venue}</p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {event.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
