// Role constants
export const ROLES = {
  ADMIN: "Admin",
  STAFF: "Staff",
  STUDENT: "Student",
};

// Route access rules
export const ROUTE_ACCESS_RULES = {
  "/": [ROLES.ADMIN, ROLES.STAFF, ROLES.STUDENT],
  "/dashboard": [ROLES.ADMIN, ROLES.STAFF, ROLES.STUDENT],
  "/events": [ROLES.ADMIN, ROLES.STAFF],
  "/student-events": [ROLES.STUDENT],
  "/rooms": [ROLES.ADMIN, ROLES.STAFF, ROLES.STUDENT],
  "/users": [ROLES.ADMIN],
  "/calendar": [ROLES.ADMIN, ROLES.STAFF, ROLES.STUDENT],
  "/profile": [ROLES.ADMIN, ROLES.STAFF, ROLES.STUDENT],
  "/analytics": [ROLES.ADMIN],
};

// Event statuses
export const EVENT_STATUS = {
  UPCOMING: "Upcoming",
  ACTIVE: "Active",
  EXPIRED: "Expired",
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000/api";
