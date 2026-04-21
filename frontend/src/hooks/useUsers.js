import { useCallback } from "react";
import { useApi } from "./useApi";

/**
 * Custom hook for managing users
 */
export const useUsers = () => {
  const api = useApi();

  const getUsers = useCallback(async () => {
    return await api.get("/users");
  }, [api]);

  const createUser = useCallback(
    async (userData) => {
      return await api.post("/users", userData);
    },
    [api],
  );

  const updateUser = useCallback(
    async (userId, userData) => {
      return await api.put(`/users/${userId}`, userData);
    },
    [api],
  );

  const deleteUser = useCallback(
    async (userId) => {
      return await api.delete(`/users/${userId}`);
    },
    [api],
  );

  return {
    ...api,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};
