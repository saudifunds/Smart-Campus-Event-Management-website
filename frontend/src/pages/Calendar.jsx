import React, { useState, useEffect } from "react";
import { Layout } from "../components";
import { useApi, useNotification } from "../hooks";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from "date-fns";

export default function CalendarPage() {
  const { request: callApi, loading } = useApi();
  const { showError } = useNotification();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchEvents = async () => {
    try {
      const data = await callApi({ url: "/events" });
      setEvents(data || []);
    } catch (err) {
      showError("Failed to fetch events for calendar");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getEventsForDay = (day) => {
    return events.filter((event) => isSameDay(parseISO(event.date), day));
  };

  const selectedDayEvents = getEventsForDay(selectedDate);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Calendar Column */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
            <h2 className="text-2xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-indigo-500 rounded-lg transition-colors">
                ◀️
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-sm font-semibold transition-colors">
                Today
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-indigo-500 rounded-lg transition-colors">
                ▶️
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[100px] p-2 border-b border-r border-gray-100 cursor-pointer transition-all hover:bg-indigo-50 relative ${
                    !isCurrentMonth ? "bg-gray-50 opacity-40" : ""
                  } ${isSelected ? "bg-indigo-50" : ""}`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${
                    isToday ? "bg-indigo-600 text-white" : isSelected ? "bg-indigo-200 text-indigo-800" : "text-gray-700"
                  }`}>
                    {format(day, "d")}
                  </span>
                  
                  <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div 
                        key={event.id} 
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate ${
                          event.status === 'Active' ? 'bg-green-100 text-green-700 font-bold' :
                          event.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {event.startTime} {event.name}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-400 pl-1">
                        + {dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="w-full md:w-80 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Events for {format(selectedDate, "MMM d, yyyy")}
            </h3>
            
            {selectedDayEvents.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No events scheduled for this day.</p>
            ) : (
              <div className="space-y-4">
                {selectedDayEvents.map((event) => (
                  <div key={event.id} className="p-4 rounded-xl border border-gray-50 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-100 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        event.status === 'Active' ? 'bg-green-600 text-white' :
                        event.status === 'Upcoming' ? 'bg-blue-600 text-white' :
                        'bg-gray-400 text-white'
                      }`}>
                        {event.status}
                      </span>
                      <span className="text-xs font-bold text-indigo-600">{event.startTime}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 leading-tight mb-1">{event.name}</h4>
                    <p className="text-xs text-gray-500">📍 {event.venue}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-indigo-900 rounded-2xl shadow-sm p-6 text-white">
            <h3 className="font-bold mb-2">Did you know?</h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Events automatically transition from 'Upcoming' to 'Active' based on their start time. Check back regularly for real-time status updates!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
