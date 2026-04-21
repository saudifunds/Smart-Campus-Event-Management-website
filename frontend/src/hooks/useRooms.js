import { useCallback } from "react";
import { useApi } from "./useApi";

/**
 * Custom hook for managing rooms
 */
export const useRooms = () => {
  const api = useApi();

  const getRooms = useCallback(async () => {
    return await api.get("/rooms");
  }, [api]);

  const createRoom = useCallback(
    async (roomData) => {
      return await api.post("/rooms", roomData);
    },
    [api],
  );

  const updateRoom = useCallback(
    async (roomId, roomData) => {
      return await api.put(`/rooms/${roomId}`, roomData);
    },
    [api],
  );

  const deleteRoom = useCallback(
    async (roomId) => {
      return await api.delete(`/rooms/${roomId}`);
    },
    [api],
  );

  return {
    ...api,
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom,
  };
};
