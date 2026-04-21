import { useCallback, useState } from "react";
import axiosInstance from "../utils/axiosConfig";

/**
 * Custom hook for making API requests
 * Handles loading, error, and success states
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance({
        method,
        url,
        data,
        ...config,
      });

      setLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const get = useCallback(
    (url, config = {}) => request("GET", url, null, config),
    [request],
  );
  const post = useCallback(
    (url, data, config = {}) => request("POST", url, data, config),
    [request],
  );
  const put = useCallback(
    (url, data, config = {}) => request("PUT", url, data, config),
    [request],
  );
  const patch = useCallback(
    (url, data, config = {}) => request("PATCH", url, data, config),
    [request],
  );
  const del = useCallback(
    (url, config = {}) => request("DELETE", url, null, config),
    [request],
  );

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
  };
};
