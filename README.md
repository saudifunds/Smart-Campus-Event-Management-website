# Smart Campus Event Management System

A web-based event management system for campuses with role-based access control (Admin, Staff, Student).

## Features

- **Role-Based Access Control**: Different permissions for Admin, Staff, and Students
- **Event Management**:
  - **Admin & Staff**: Create, edit, and manage all campus events
  - **Students**: View-only access to all campus events with status and countdown
- **Calendar View**: Visual monthly calendar with event details (All roles)
  - Click dates to see events
  - Color-coded event status
  - Event count badges
- **Event Notifications**: Real-time alerts and reminders
  - New event creation notifications
  - 5-minute before event warning
  - Event started notifications
  - Dismissible toast notifications
- **Room Management**: Track room availability, capacity, and status
- **User Management**: Admin can manage users and their roles
- **Real-time Event Status**: Live status updates (Upcoming/Active/Expired)
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Built-in dark mode styling

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js (Express) with SQLite database
- **Auth**: JWT (JSON Web Tokens) + bcrypt password hashing

> The original version was fully client-side using localStorage; it has now been upgraded with a proper backend API.

## Project Structure

```text
Smart Campus Event Management website/
├── Assets/
│   └── logo.png
├── css/
│   └── style.css
├── js/
│   ├── api.js                    # Shared API helper (fetch wrapper + auth token)
│   ├── auth.js                   # Authentication & access control (role + token)
│   ├── calendar.js               # Calendar view (all roles)
│   ├── events.js                 # Event management (Admin/Staff, create/edit/delete)
│   ├── student-manage-events.js  # Student event view (read-only)
│   ├── forgot.js                 # Password recovery (demo flow)
│   ├── login.js                  # Login (calls /api/auth/login)
│   ├── rooms.js                  # Room management (talks to /api/rooms)
│   ├── script.js                 # Dashboard logic
│   ├── signup.js                 # User registration (calls /api/auth/register)
│   ├── users.js                  # User management (Admin, talks to /api/users)
│   └── chatbot.js                # Chatbot logic
├── backend/
│   ├── package.json
│   ├── database.sqlite  # SQLite database (auto-created)
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── db.js
│       ├── middleware/
│       │   └── auth.js
│       └── routes/
│           ├── auth.js
│           ├── events.js
│           ├── rooms.js
│           └── users.js
├── calendar.html                 # Event calendar view (all roles)
├── events.html
├── student-manage-events.html    # Student event viewing (read-only)
├── forgot.html
├── index.html                    # Dashboard
├── login.html
├── rooms.html
├── signup.html
├── users.html
└── 404.html                      # Error page
```

## Getting Started

### 1. Backend (Node.js API)

#### Prerequisites

- Node.js 18+ installed

#### Install and run

```bash
cd backend
npm install
npm start
```

The API base URL used by the frontend is:

- `http://localhost:4000/api`

Keep this terminal window running while you use the frontend.

### 2. Frontend (HTML/CSS/JS)

For quick local use you can open the HTML files directly in a browser, or serve the folder with a simple static server.

## Basic flow:

1. Open `signup.html` in a browser.
2. Create your first account (choose a **role**: Admin, Staff, or Student).
3. After successful signup you will be redirected to `login.html`.
4. Log in and you will land on `index.html` (dashboard).
5. Based on your role:
   - **Admin/Staff**: Access `events.html` to create, edit, and delete events
   - **Student**: Access `student-manage-events.html` to view all campus events (read-only)

## Role-Based Event Access

### Admin & Staff (Officials)
- **Page**: `events.html`
- **Can**: Create new events, edit any event, delete any event
- **Event Form**: Full event management with add/edit modal

### Student
- **Page**: `student-manage-events.html`
- **Can**: View all campus events with current status
- **Status Display**: Upcoming, Active, or Expired
- **Cannot**: Create, edit, or delete events
- **Auto-refresh**: Event status updates every 30 seconds

## Calendar View & Notifications

### Calendar Feature (`calendar.html`)
- **Available to**: All authenticated users (Admin, Staff, Student)
- **Features**:
  - Visual monthly calendar with all campus events
  - Click any date to see events scheduled that day
  - Event count badges on dates with multiple events
  - Color-coded status dots (Upcoming, Active, Expired)
  - Today's date highlighted
  - Navigation between months
  - Event details sidebar with time, venue, status

### Event Notifications
- **Real-time toast notifications** appear in top-right corner
- **Notification Types**:
  - ✅ Success notifications - Event created/updated/deleted
  - ⚠️ Warning notifications - Event starting soon
  - 🚀 Active notifications - Event now happening
  - ℹ️ Info notifications - General updates
  - ❌ Error notifications - Operation failures

- **Notification Triggers**:
  - Admin/Staff: "New event created! Students will be notified."
  - 5 minutes before: "Event starting in 5 minutes"
  - When event starts: "Event now happening!"
  - Students: Get reminders 30 min before event

## Deployment

> The frontend can still be hosted as static files, but the backend now requires a Node.js environment (or container) to run.

### Option 1: Frontend + Backend on a Node-capable host

- Deploy the `backend/` folder as a Node.js app (Render, Railway, VPS, etc.).
- Deploy the static frontend (`*.html`, `css/`, `js/`, `Assets/`) on the same domain or another domain.
- Update `API_BASE_URL` in `js/api.js` to point to your deployed backend.

### Option 2: Frontend on Static Hosting, Backend elsewhere

The frontend can be deployed to any static hosting service:

#### **Netlify**
1. Push code to GitHub/GitLab
2. Connect repository to Netlify
3. Set build command: (leave empty)
4. Set publish directory: `/` (root)
5. Deploy!

#### **Vercel**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root
3. Follow prompts

#### **GitHub Pages**
1. Push code to GitHub repository
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your site will be live at `username.github.io/repository-name`

#### **Traditional Web Server (Apache/Nginx)**
1. Upload all files to your web server
2. Ensure `index.html` is in the root directory
3. Configure server to serve index.html for all routes (see `.htaccess` for Apache)
4. Access via your domain name

### Option 3: Docker (Optional)

Example backend Dockerfile (inside `backend/`):

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

You can then host the frontend separately via Nginx/Netlify/etc.

## Configuration

### Backend environment

The backend uses the following environment variables (optional):

- `PORT` – port for the backend server (default: `4000`).
- `JWT_SECRET` – secret key for signing JWTs (default is a dev value; set a strong one in production).

### Frontend API base URL

- `js/api.js` contains `API_BASE_URL`, which defaults to `http://localhost:4000/api`.
- For production, change this to your deployed backend URL.

### Event Creation Restrictions

- Only **Admin** and **Staff** users can create new events via `POST /api/events`.
- **Students** attempting to create events will receive a **403 Forbidden** error.
- This is enforced both on the frontend (page access) and backend (role check).

### Other Notes

1. **Case Sensitivity**: Ensure folder names match exactly (especially `Assets` vs `assets` on Linux servers).
2. **HTTPS**: For production, always use HTTPS. Most hosting providers offer free SSL certificates.

## Security Considerations

- Passwords are now stored as **bcrypt hashes** in SQLite (not in browser localStorage).
- Protected API endpoints require a valid **JWT** in the header `Authorization: Bearer <token>`.
- The frontend still uses localStorage to store `loggedInUser` and the `authToken` (JWT).

### Recommended Security Enhancements for Production

1. **Backend hardening**:
   - Add rate limiting.
   - Add input validation and sanitization on all endpoints.
   - Add request and audit logging.
2. **Transport security**:
   - Enforce HTTPS.
   - Add security headers (CSP, HSTS, etc.) via reverse proxy or middleware.
3. **Secrets management**:
   - Store `JWT_SECRET` and other secrets in environment variables or a secrets manager.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure Notes

- All paths are relative, so the site works in subdirectories
- Ensure all file references use correct case (important for Linux servers)
- Keep the folder structure intact

## Troubleshooting

### Images Not Loading
- Check that `Assets/logo.png` exists (case-sensitive on Linux)
- Verify file paths in HTML files

### localStorage / Auth Issues
- Ensure cookies/localStorage are enabled in browser.
- Make sure the backend is running (`npm start` in the `backend/` folder).
- Check the browser console and Network tab for failed API calls.

## Development Roadmap

Potential improvements for production:
- [x] Backend API integration
- [x] Database storage
- [x] Password encryption (bcrypt)
- [ ] Email notifications
- [ ] Session management (refresh tokens, revocation)
- [ ] Audit logging
- [ ] Export/Import functionality
- [ ] API documentation (OpenAPI/Swagger)

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check the browser console for error messages and ensure all files are properly uploaded to your server.

---

**Ready for Deployment Checklist (Frontend + Backend):**
- ✅ All HTML files have proper meta tags
- ✅ Asset paths are correct
- ✅ Error page (404.html) created
- ✅ robots.txt configured
- ✅ .htaccess for Apache servers (if using Apache)
- ✅ Backend Node.js server running and reachable from the frontend
- ✅ `API_BASE_URL` in `js/api.js` points to the correct backend URL
