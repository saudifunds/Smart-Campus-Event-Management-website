import { useCallback } from "react";
import { useApi } from "./useApi";

/**
 * Custom hook for managing events
 */
export const useEvents = () => {
  const api = useApi();

  const getEvents = useCallback(async () => {
    return await api.get("/events");
  }, [api]);

  const createEvent = useCallback(
    async (eventData) => {
      return await api.post("/events", eventData);
    },
    [api],
  );

  const updateEvent = useCallback(
    async (eventId, eventData) => {
      return await api.put(`/events/${eventId}`, eventData);
    },
    [api],
  );

  const deleteEvent = useCallback(
    async (eventId) => {
      return await api.delete(`/events/${eventId}`);
    },
    [api],
  );

  const getEventStatus = useCallback((event) => {
    const now = new Date();
    const start = new Date(`${event.date}T${event.startTime}`);
    const end = new Date(`${event.date}T${event.endTime}`);

    if (now < start) return "Upcoming";
    if (now >= start && now <= end) return "Active";
    return "Expired";
  }, []);

  return {
    ...api,
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventStatus,
  };
};
