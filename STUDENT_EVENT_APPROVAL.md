# Student Event Submission & Admin Approval System

## Overview

This feature allows students with a special position (e.g., student leaders, club officers) to submit events for administrative approval before they become visible to all students.

## How It Works

### 1. **Student Submission Flow**

- Students with a `position` field (e.g., "Club President", "Event Coordinator") can access **"Submit Event"** page
- They fill out event details: name, date, time, venue, and optional image
- Event is created with status **"Pending"**
- Organizer can view and delete pending events
- Organizer receives email notification about the status

### 2. **Admin/Staff Approval Flow**

- Admins and Staff see a new **"Approvals"** menu item in sidebar
- They access **"Event Approvals"** page showing all pending events
- Can **Approve** → Event becomes "Upcoming" and visible to all students
- Can **Deny** → Event is marked "Denied" with a reason sent to organizer
- Students are notified via email when their event is approved

### 3. **Event Status**

- **Pending**: Awaiting admin review (only creator and admins can see)
- **Upcoming**: Approved and visible to all students
- **Active**: Event is currently happening
- **Expired**: Event has ended
- **Denied**: Rejected by admin (visible to creator only)

## Database Schema

### Users Table

```sql
-- NEW COLUMN
position TEXT          -- e.g., "Club President", "Event Coordinator", NULL for regular students
```

### Events Table

```sql
-- Existing columns with new status options
status TEXT            -- 'Upcoming', 'Active', 'Expired', 'Pending', 'Denied'
```

## API Endpoints

### Student Event Submission

```bash
# Create event (Students with position or Admin/Staff)
POST /api/events
Body: {
  "name": "Tech Summit",
  "date": "2025-05-15",
  "startTime": "10:00",
  "endTime": "12:00",
  "venue": "Main Hall",
  "image": <File> (optional)
}
Response: { id, name, date, startTime, endTime, venue, status: "Pending", imageUrl }

# Get my events (show organizer's own events regardless of status)
GET /api/events/my-events

# Delete my pending event
DELETE /api/events/:id
```

### Admin/Staff Approval

```bash
# Get all pending events (Admin/Staff only)
GET /api/events/pending/list
Response: [
  {
    id, name, date, startTime, endTime, venue,
    createdByName, createdByEmail, position,
    imageUrl, status: "Pending"
  }
]

# Approve pending event (Admin/Staff only)
PUT /api/events/:id/approve
Response: { message: "Event approved successfully" }

# Deny pending event (Admin/Staff only)
PUT /api/events/:id/deny
Body: { "reason": "Event conflicts with scheduled maintenance" }
Response: { message: "Event denied successfully" }
```

### Student Event Viewing

```bash
# Get all events (Students see only Upcoming/Active/Expired, not Pending/Denied)
GET /api/events
```

## Frontend Pages

### 1. Student Submit Event (`student-submit-event.html`)

**Access**: Students with a `position` field only

**Features**:

- Form to create new event request
- Image upload capability
- View all submitted events with status badges
- Delete pending events
- Animated form and smooth interactions

**Components**:

- `js/student-submit-event.js` - Form handling and event list management

### 2. Admin Approve Events (`admin-approve-events.html`)

**Access**: Admin and Staff only

**Features**:

- View all pending event requests
- Organizer information (name, email, position)
- Event details with organized layout
- Approve or Deny buttons
- Modal dialog for denial reason
- Email notifications upon decision

**Components**:

- `js/admin-approve-events.js` - Approval logic and notifications

## Authentication & Authorization

### Role-Based Access Control

```javascript
accessRules = {
  "student-submit-event.html": ["Student-Organizer"], // Student with position
  "admin-approve-events.html": ["Admin", "Staff"], // Admins and Staff
};
```

### Frontend Checks

- JavaScript verifies `user.position` for student submission access
- Redirects to home page if access denied

### Backend Checks

- API validates `req.user.role` and `req.user.position`
- Returns 403 Forbidden if insufficient permissions

## Navigation

### Admin/Staff Sidebar

```
Dashboard
├─ Manage Events
├─ Approvals ✨ NEW
├─ Calendar
└─ ...
```

### Student Leader Sidebar

```
Leader Dashboard
├─ Submit Event ✨ NEW
├─ Create Event
├─ Manage Events
├─ Calendar
└─ ...
```

## Email Notifications

### Event Submitted

Email sent to: Admin inbox (configurable)
Subject: `New Event Submission: [Event Name]`

### Event Approved

Email sent to: Event organizer
Subject: `Your Event "[Event Name]" Has Been Approved`

### Event Denied

Email sent to: Event organizer
Subject: `Event "[Event Name]" - Request Denied`
Body: Includes denial reason provided by admin

## Workflow Diagram

```
Student Leader
    ↓
[Submit Event Form]
    ↓
Event Created (Status: PENDING)
    ↓
[Notification to Admin]
    ↓
Admin Reviews
    ├─ APPROVE → Status: UPCOMING → Notify Students
    └─ DENY    → Status: DENIED   → Notify Organizer
    ↓
Event Visible/Hidden Based on Status
```

## Setup Instructions

### 1. Assign Position to Student (Admin)

- Edit user profile to add `position` field
- Value examples: "Club President", "Event Coordinator", "Student Lead"
- User now has access to "Submit Event" page

### 2. Test Workflow

```
1. Login as Student with position
2. Click "Submit Event" in sidebar
3. Fill form and submit
4. Login as Admin
5. Click "Approvals" in sidebar
6. Review and Approve/Deny
7. Check email notifications
```

### 3. Monitor Submissions

- Check `/admin-approve-events.html` regularly for pending events
- Monitor email for submission notifications
- Review analytics for event submission patterns

## Styling

All new pages use the gray and beige theme with warm accents:

- Primary accent: `#c97856` (coral/rust)
- Success: `#7cb342` (soft green)
- Danger: `#d84315` (warm red)
- Warning: `#f9a825` (warm amber)

Animations include:

- Slide-in entrance animations
- Smooth hover effects
- Status badge transitions
- Modal dialogs with spring easing

## Future Enhancements

1. **Event Comments**: Admin can add comments before approving
2. **Revision Requests**: Deny with revision suggestions instead of just denial
3. **Scheduling**: Auto-schedule approvals (e.g., only 2 events per week)
4. **Templates**: Pre-approved event templates for repeated events
5. **Student Voting**: Let students vote on pending events
6. **Analytics Dashboard**: Track event submission rates and approval rates
7. **Bulk Actions**: Approve/Deny multiple events at once

## Troubleshooting

### Student can't see "Submit Event" page

- Check user profile has a `position` value set
- Verify token includes position in JWT payload
- Check browser console for access denied errors

### Admin doesn't see pending events

- Verify user role is "Admin" or "Staff"
- Check events table has records with status="Pending"
- Verify backend `/events/pending/list` endpoint is working

### Emails not sending

- Check `backend/src/utils/mailer.js` configuration
- Verify SMTP credentials are correct
- Check server console for mailer errors

### Image upload not working

- Ensure `/uploads` directory exists and is writable
- Verify file size is under 5MB
- Check multer configuration in `events.js`

## Files Modified/Created

**New Files:**

- `admin-approve-events.html` - Admin approval interface
- `student-submit-event.html` - Student submission form
- `js/admin-approve-events.js` - Approval logic
- `js/student-submit-event.js` - Submission logic
- `backend/src/routes/events.js` - New endpoints (deny, pending list)

**Modified Files:**

- `backend/src/db.js` - Already has position column
- `js/auth.js` - Added access rules
- `js/script.js` - Added sidebar rendering functions
- `backend/src/routes/events.js` - Enhanced create endpoint
