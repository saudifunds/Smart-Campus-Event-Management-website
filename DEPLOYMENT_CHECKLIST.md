# 🚀 Deployment Checklist for Smart Campus Event Management System

Use this checklist to ensure your site is ready for production deployment.

## ✅ Pre-Deployment Checks

### File Structure

- [x] All HTML files have proper meta tags (description, viewport)
- [x] All HTML files have favicon links
- [x] Asset paths are correct (case-sensitive on Linux servers)
- [x] All required CSS files exist (`css/style.css`, `css/chatbot.css`)
- [x] All required JS files exist (in `js/` folder)
- [x] Logo image exists in `Assets/logo.png`

### Code Quality

- [ ] `API_BASE_URL` in `js/api.js` updated for production backend URL
- [x] No console.log statements (or removed for production)
- [x] No TODO/FIXME comments in production code
- [x] HTML structure is valid (all tags properly closed)

### Security & Configuration

- [x] `.gitignore` file created
- [x] `.htaccess` file created (for Apache servers)
- [x] `robots.txt` file created
- [x] `404.html` error page created
- [x] `README.md` with deployment instructions

### Features

- [x] Chatbot functionality on all pages
- [x] Role-based access control working (Admin, Staff, Student)
- [x] Authentication system functional (JWT + bcrypt)
- [x] Event management: Admin/Staff can create, edit, delete events
- [x] Event viewing: Students can view events (read-only)
- [x] Calendar view: All roles can view monthly calendar
- [x] Event notifications: Toast alerts for create/update/delete/reminders
- [x] All pages accessible and working

## 📋 Deployment Steps

### 1. Choose Your Hosting Platform

#### Option A: Netlify (Recommended for beginners)

1. Push code to GitHub/GitLab/Bitbucket
2. Sign up at [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect your repository
5. Build settings:
   - Build command: (leave empty)
   - Publish directory: `/` (root)
6. Click "Deploy site"
7. Your site will be live with HTTPS automatically!

#### Option B: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root
3. Follow prompts
4. Site deployed with HTTPS!

#### Option C: GitHub Pages

1. Push code to GitHub repository
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your site will be at `username.github.io/repository-name`

5. Update `API_BASE_URL` in `frontend/src/utils/constants.js`
6. Run `npm run build` in `frontend/`
7. Deploy the `frontend/build` folder to your static host (Netlify, Vercel, etc.)

#### Legacy Deployment (Vanilla)

1. Update `API_BASE_URL` in `js/api.js`
2. Upload root HTML/CSS/JS files to your host.

### 2. Post-Deployment Tasks

- [ ] Test login/signup functionality with different roles
- [ ] **Test Admin/Staff**: Create, edit, and delete events via `events.html`
- [ ] **Test Student**: View events as read-only via `student-manage-events.html`
- [ ] **Test Calendar**: All roles can access `calendar.html`
  - [ ] Click dates to see events
  - [ ] Check event status indicators (dots/badges)
  - [ ] Navigate between months
  - [ ] Verify today's date is highlighted
- [ ] **Test Notifications**:
  - [ ] Admin creates event → "✅ Event created" notification appears
  - [ ] Admin updates event → "✏️ Event updated" notification
  - [ ] Admin deletes event → "🗑️ Event deleted" notification
  - [ ] Student sees 30-min before warning when near event time
  - [ ] Student sees "🎉 Event started!" when event begins
  - [ ] Notifications auto-dismiss after 6 seconds
  - [ ] Check notifications appear in top-right corner
- [ ] Verify students cannot access event management page (`events.html`)
- [ ] Verify students get 403 error when trying to POST/PUT/DELETE events (check console)
- [ ] Test all role-based permissions (users, events, rooms)
- [ ] Verify chatbot works on all pages
- [ ] Check mobile responsiveness (test calendar on mobile)
- [ ] Test 404 error page (visit a non-existent URL)
- [ ] Verify HTTPS is working (if applicable)
- [ ] Check browser console for errors
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices

### 3. Domain Configuration (Optional)

If using a custom domain:

- [ ] Configure DNS records
- [ ] Set up SSL certificate (Let's Encrypt, Cloudflare, etc.)
- [ ] Enable HTTPS redirect (in `.htaccess` or hosting settings)
- [ ] Update `robots.txt` with your sitemap URL

### 4. Monitoring & Maintenance

- [ ] Set up error tracking (optional: Sentry, Google Analytics)
- [ ] Monitor site performance
- [ ] Regular backups of user data (if using backend)
- [ ] Update dependencies regularly

## ⚠️ Important Notes

### Security Warnings

- Backend now uses **bcrypt** password hashing and **JWT** auth.
- For production use, ensure:
  - Strong `JWT_SECRET` set via environment variable
  - HTTPS enforcement
  - Rate limiting
  - Server-side validation

### Browser Compatibility

- Modern browsers only (no IE11 support)
- localStorage required
- ES6+ JavaScript features used

### Data Storage

- Data is stored in a SQLite database (`backend/database.sqlite`) on the server.
- Frontend still stores a small auth session (JWT + user) in localStorage.

## 🔧 Troubleshooting

### Images Not Loading

- Check case sensitivity: `Assets/` vs `assets/`
- Verify file paths are correct
- Check file permissions on server

### JavaScript Errors

- Check browser console for errors
- Ensure all JS files are loaded
- Verify no CORS issues

### 404 Errors

- Ensure `.htaccess` is configured correctly
- Check that `404.html` exists
- Verify error document directive in server config

### Authentication Issues

- Clear browser localStorage
- Check browser console for errors
- Verify all JS files are loaded in correct order
- Test role-based access: Admin can create events, Students cannot

### Event Access Issues

- **Admin/Staff should see**: `events.html` with create/edit/delete buttons
- **Students should see**: `student-manage-events.html` with read-only table
- **Students should NOT see**: Event management page or create buttons
- Check backend response for 403 errors when students try to create events

### Calendar & Notification Issues

- **Calendar not loading**: Check backend API at `http://localhost:4000/api/events`
- **No events showing**: Verify events exist in database and have correct date format (YYYY-MM-DD)
- **Notifications not appearing**: Check browser console for JS errors
- **Notifications duplicate**: Clear localStorage with `localStorage.clear()` and reload
- **Calendar dates wrong**: Verify browser timezone is correct
- **Mobile calendar broken**: Check CSS responsiveness rules (at bottom of style.css)
- **Notifications disappear too fast**: Set longer timeout in js/events.js (currently 6 seconds)

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify all files uploaded correctly
3. Check server logs (if available)
4. Test locally first to isolate issues

---

**Current Status**: ✅ Ready for deployment!
**Last Updated**: Check all items above before deploying to production.
