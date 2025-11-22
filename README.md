# Smart Campus Event Management System

A web-based event management system for campuses with role-based access control (Admin, Staff, Student).

## Features

- **Role-Based Access Control**: Different permissions for Admin, Staff, and Students
- **Event Management**: Create, view, and manage campus events and class sessions
- **Room Management**: Track room availability, capacity, and status
- **User Management**: Admin can manage users and their roles
- **Real-time Countdown**: Live countdown timers for upcoming events
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Built-in dark mode styling

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: localStorage (client-side data persistence)
- **No Backend Required**: Fully client-side application

## Project Structure

```
Smart Campus Event Management website/
├── Assets/
│   └── logo.png
├── css/
│   └── style.css
├── js/
│   ├── auth.js          # Authentication & access control
│   ├── events.js        # Event management logic
│   ├── forgot.js        # Password recovery
│   ├── login.js         # Login functionality
│   ├── rooms.js         # Room management
│   ├── script.js        # Dashboard logic
│   ├── signup.js        # User registration
│   └── users.js         # User management
├── events.html
├── forgot.html
├── index.html           # Dashboard
├── login.html
├── rooms.html
├── signup.html
├── users.html
└── 404.html             # Error page
```

## Getting Started

### Local Development

1. Clone or download this repository
2. Open `index.html` in a web browser
3. Register a new account (Admin role recommended for full access)
4. Start managing events, rooms, and users

### Initial Setup

1. Navigate to `signup.html` to create your first admin account
2. Select "Admin" role during registration
3. Log in with your credentials
4. Begin using the system

## Deployment

### Option 1: Static Web Hosting (Recommended)

The application is a static website and can be deployed to any static hosting service:

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

### Option 2: Docker (Optional)

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Configuration

### Important Notes

1. **localStorage**: All data is stored in browser localStorage. This means:
   - Data is per-browser/per-device
   - Data will be lost if localStorage is cleared
   - For production, consider migrating to a backend database

2. **Case Sensitivity**: Ensure folder names match exactly (especially `Assets` vs `assets` on Linux servers)

3. **HTTPS**: For production, always use HTTPS. Most hosting providers offer free SSL certificates.

## Security Considerations

⚠️ **Current Implementation Notes**:
- Passwords are stored in plain text in localStorage (NOT secure for production)
- No server-side validation
- No HTTPS enforcement in code (configure on server)

### Recommended Security Enhancements for Production:

1. **Implement Backend API**:
   - Hash passwords (bcrypt, Argon2)
   - Implement JWT tokens
   - Add rate limiting
   - Server-side validation

2. **Use HTTPS**: Configure SSL/TLS certificates

3. **Add CSP Headers**: Content Security Policy (configure in server)

4. **Environment Variables**: For API endpoints, use environment variables

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

### localStorage Issues
- Ensure cookies/localStorage are enabled in browser
- Check browser console for errors

### Authentication Not Working
- Clear browser localStorage
- Register a new account
- Check browser console for JavaScript errors

## Development Roadmap

Potential improvements for production:
- [ ] Backend API integration
- [ ] Database storage
- [ ] Email notifications
- [ ] Password encryption
- [ ] Session management
- [ ] Audit logging
- [ ] Export/Import functionality
- [ ] API documentation

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check the browser console for error messages and ensure all files are properly uploaded to your server.

---

**Ready for Deployment Checklist:**
- ✅ All HTML files have proper meta tags
- ✅ Asset paths are correct
- ✅ Error page (404.html) created
- ✅ robots.txt configured
- ✅ .htaccess for Apache servers
- ⚠️ Remember: Passwords are in plain text - implement backend for production!

