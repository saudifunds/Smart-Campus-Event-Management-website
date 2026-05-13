# Smart Campus Event Management - AI Agent Instructions

## Architecture Overview

This is a **dual-tier full-stack application** combining frontend (HTML/CSS/JS) with a Node.js/Express backend:

- **Frontend**: Stateless HTML pages using localStorage for session persistence
- **Backend API**: REST API (Express.js) with SQLite database running on `http://localhost:4000/api`
- **Auth Pattern**: JWT tokens stored in localStorage, passed via `Authorization: Bearer <token>` header

### Critical Data Flow

1. Frontend calls `apiRequest()` utility → adds JWT token from localStorage → hits backend REST API
2. Backend validates token via `authMiddleware` + role-based access control
3. Database operations return results to frontend; state managed in JS (not state management library)

## Key Integration Points

### API Layer (`js/api.js`)

- **Central fetch wrapper** with automatic token injection
- All backend calls go through `apiRequest(path, options)` function
- Throws errors on failure; network errors include helpful server-down messages
- **DO NOT** make direct fetch calls; always use `apiRequest()`

### Authentication (`js/auth.js` + `backend/src/middleware/auth.js`)

- **Role-based access control**: defined in `accessRules` object in js/auth.js
- Frontend enforces page-level access; backend enforces via role checks on routes
- **3 roles**: Admin, Staff, Student (hardcoded in register validation)
- Token lifespan: 8 hours (set in `generateToken()`)

### Database Schema (`backend/src/db.js`)

Three main tables:

- `users`: id, name, email, password_hash, role, created_at
- `events`: id, name, date, start_time, end_time, venue, status, created_by (FK), created_at
- `rooms`: id, name, capacity, type, status, created_by (FK), created_at

**Foreign keys** link `created_by` to users.id. No cascading deletes configured.

## Event Management System (Role-Based)

### Admin & Staff (Officials Only)

- **Access**: `events.html` (full management page)
- **Capabilities**: Create, Edit, Delete ALL events
- **API**:
  - `POST /api/events` - Create new event (403 error if not Admin/Staff)
  - `PUT /api/events/:id` - Edit any event
  - `DELETE /api/events/:id` - Delete any event

### Students (Read-Only)

- **Access**: `student-manage-events.html` (view-only page)
- **Capabilities**: View all events, see status (Upcoming/Active/Expired)
- **Cannot**: Create, edit, or delete events
- **API**:
  - `GET /api/events` - View all campus events only

### Key Implementation Details

**Backend (events.js route):**
```javascript
// Create event - Admin and Staff only
if (!["Admin", "Staff"].includes(req.user.role)) {
    return res.status(403).json({ message: "Only administrators can create events" });
}
```

**Frontend Access Control (js/auth.js):**
```javascript
"events.html": ["Admin", "Staff"],          // Manage page
"student-manage-events.html": ["Student"],  // View-only page
"calendar.html": ["Admin", "Staff", "Student"] // Calendar view for all roles
```

## Calendar View & Event Notifications System (New 2026-03-19)

### Calendar Feature

**Access**: `calendar.html` - Available to all authenticated users (Admin, Staff, Student)

**Capabilities**:
- Visual monthly calendar showing all campus events
- Click on a date to see events scheduled for that day
- Color-coded event status (Upcoming/Active/Expired)
- Event count badges on calendar dates
- Real-time status updates every minute
- Event details sidebar showing time, venue, status

**Frontend Files**:
- **calendar.html** - Calendar page layout
- **js/calendar.js** - Calendar rendering and event filtering logic
- **CSS**: Calendar grid styles, event cards, day selection, responsive design

**Features**:
- Navigate between months with previous/next buttons
- Today's date highlighted
- Dates with events show indicator dots
- Select date to view details
- Auto-refresh status every 30 seconds

### Event Notifications System

**Real-time Notifications** appear in the top-right corner with:
- ✅ Success notifications (green) - Event created, updated, deleted
- ⚠️ Warning notifications (yellow) - Event starting soon (5 min warning)
- 🚀 Active notifications (red) - Event just started
- ℹ️ Info notifications (blue) - General updates
- ❌ Error notifications (red) - Failed operations

**Notification Triggers**:
1. **Admin/Staff** (events.html):
   - "New event created! Students will be notified."
   - "Event updated successfully!"
   - "Event deleted successfully!"
   - "⏰ Event starting in 5 minutes at [venue]"
   - "🚀 Event has started!"

2. **Students** (student-manage-events.html, calendar.html):
   - "📅 Events loaded! Check for upcoming events."
   - "📢 Event happening in X minutes!"
   - "🎉 Event is now happening! Join at [venue]"

**Implementation**:
- Uses localStorage to track which notifications have been shown (prevent duplicates)
- Checks event times every 1-30 seconds depending on page
- Auto-dismisses after 6 seconds
- Styled with smooth animations (slideIn/fadeOut)

### Integration Points

**calendar.js Functions**:
- `loadAllEvents()` - Fetch events from `/api/events`
- `renderCalendar()` - Render calendar grid for current month
- `selectDate()` - Show events for selected date
- `getEventsForDate()` - Filter events by date
- `getEventStatus()` - Calculate current status (Upcoming/Active/Expired)
- `showNotification()` - Display notification toasts

**events.js Updates**:
- Added `showNotification()` on event create/update/delete
- Added 5-minute upcoming event warnings
- Added "event started" notifications

**student-manage-events.js Updates**:
- Added upcoming event notifications (30 minutes warning)
- Added "event started" notifications
- Enhanced user engagement

## Development Workflows

### Starting the Application

```bash
# Terminal 1: Backend API
cd backend
npm install  # first time only
npm start    # listens on :4000
```

Frontend opens directly in browser (no build step). Backend must be running for API calls.

### Seeding Test Data

```bash
cd backend
npm run seed-users  # creates default users
```

Check `backend/src/seed-users.js` for credentials.

### Debugging

- **Frontend**: Browser DevTools console shows API errors from `apiRequest()` catch blocks
- **Backend**: `console.error()` statements in route handlers + HTTP status codes
- Check `database.sqlite` file location: `backend/database.sqlite` (auto-created on first run)

## Project-Specific Patterns & Conventions

### Frontend Component Pattern

Each page (events.html, rooms.html, users.html, student-manage-events.html) follows this structure:

```javascript
// 1. Query DOM elements
const table = document.querySelector("#eventTable tbody");
const modal = document.getElementById("eventModal");

// 2. State array
let events = [];

// 3. Load from API
async function load() {
  events = await apiRequest("/events", { method: "GET" });
  render();
}

// 4. Render to DOM
function render() {
  table.innerHTML = ""; // clear
  events.forEach((e) => {
    /* append rows */
  });
}

// 5. Form submission for CREATE/UPDATE (Admin/Staff only)
form.addEventListener("submit", async (e) => {
  await apiRequest("/events", { method: "POST", body: JSON.stringify(data) });
  load(); // refresh
});
```

**Pattern**: Load → Render → Form submit → Reload. **No frameworks (Vue).** DOM state is authoritative source during session.

### API Response Format

Backend returns plain JSON objects (no wrapper):

```javascript
// GET /api/events returns:
[{ id: 1, name: "Orientation", date: "2025-01-15", startTime: "09:00", endTime: "10:00", venue: "Main Hall", status: "Upcoming", created_by: 1 }]

// POST /api/events returns (Admin/Staff only):
{ id: 2, name: "New Event", ... } // Student attempt gets 403

// Errors return HTTP status + message:
{ message: "Only administrators can create events" } // 403
```

### Modal & Form Pattern

Modals are hidden via CSS `display: none`. Toggle via:

```javascript
const modal = document.getElementById("eventModal");
modal.style.display = "block"; // open
modal.style.display = "none"; // close
```

Forms reset via `form.reset()` after submission. Close modals + reload state after API success.

### Event Status Logic

Events have computed status based on current time vs. event date/times:

- Before start_time → "Upcoming"
- Between start_time and end_time → "Active"
- After end_time → "Expired"

Status updates every 30 seconds on student-manage-events.html, in real-time on events.html.

## Common Tasks & Gotchas

### Adding a New Feature

1. **Add backend route** in `backend/src/routes/<resource>.js` with role check
2. **Update frontend page** (`<resource>.html`) with form + table
3. **Add `apiRequest()` calls** in `js/<resource>.js` to call new route
4. **Test role permissions**: Admin/Staff should see everything, Students filtered or read-only

### Extending the Database

- Use `db.serialize()` in `backend/src/db.js` to add new tables
- Use `db.prepare()` for parameterized queries (prevents SQL injection)
- Example: `db.prepare("INSERT INTO users (...) VALUES (?, ?, ?)")`

### Form Validation

- **Backend**: Input validation in route handlers (required fields, role enum, email uniqueness)
- **Frontend**: Basic HTML5 validation only; real validation happens server-side
- Always display error messages from backend in UI (caught in `apiRequest()` error handling)

### Session Loss

- User loses session if:
  - Browser localStorage cleared
  - 8-hour token expiration reached
- Frontend checks for valid token on every page load (`window.DOMContentLoaded`)
- Missing token → redirects to `login.html` automatically

## File Organization

```
Frontend (root):
  js/api.js                    ← Edit first for new API calls
  js/auth.js                   ← Role-based page access + access rules
  js/events.js                 ← Admin/Staff event management (create/edit/delete)
  js/student-manage-events.js  ← Student read-only event view
  js/rooms.js                  ← Room management logic
  js/users.js                  ← User management (Admin only)
  css/style.css                ← Styling (shared across all pages)

HTML Pages:
  index.html                   ← Dashboard (all authenticated users)
  events.html                  ← Event management (Admin/Staff only)
  student-manage-events.html   ← Event view (Students only)
  rooms.html                   ← Room management (all roles)
  users.html                   ← User management (Admin only)
  login.html, signup.html      ← Auth pages

Backend (backend/src):
  middleware/auth.js          ← generateToken(), authMiddleware, role checks
  routes/                      ← One file per resource (auth.js, events.js, rooms.js, users.js)
  db.js                        ← SQLite schema + initialization
  app.js                       ← Express app setup + route mounting
  server.js                    ← Server startup
```

## Testing Against Roles

Create accounts with different roles during signup to test:

### Admin Test Account
- **Access**: All pages (index, events, rooms, users)
- **Event Capabilities**: Create, Edit, Delete any event
- **Other**: Manage users, manage rooms

### Staff Test Account
- **Access**: Dashboard, Events, Rooms
- **Cannot Access**: Users page
- **Event Capabilities**: Create, Edit, Delete events
- **Cannot**: Manage users

### Student Test Account
- **Access**: Dashboard, Student Events (read-only)
- **Cannot Access**: Events (management), Rooms, Users
- **Cannot**: Create, edit, or delete events
- **Can**: View all campus events with status

**Test Flow:**
1. Sign up as Student → Navigate to `student-manage-events.html`
2. Try to create event → Get 403 error (verified in browser console)
3. Login as Admin → Navigate to `events.html` → Can create/edit/delete

Manually test access control by logging in as each role and verifying page availability + API operation success/failure.
