# React Frontend Setup Guide

## Project Structure

This is the modern React frontend for the Smart Campus Event Management system.

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Notification.jsx
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/               # Page components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Events.jsx
│   │   ├── StudentEvents.jsx
│   │   ├── Rooms.jsx
│   │   ├── Users.jsx
│   │   ├── Calendar.jsx
│   │   ├── Profile.jsx
│   │   ├── Analytics.jsx
│   │   └── NotFound.jsx
│   ├── hooks/               # Custom hooks
│   │   ├── useApi.js
│   │   ├── useAuth.js
│   │   ├── useEvents.js
│   │   ├── useRooms.js
│   │   └── useUsers.js
│   ├── stores/              # Zustand stores
│   │   ├── authStore.js
│   │   └── notificationStore.js
│   ├── utils/               # Utility functions
│   │   ├── axiosConfig.js
│   │   └── constants.js
│   ├── App.jsx              # Main app component
│   └── index.js             # Entry point
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

After CRA finishes setting up the project:

```bash
cd frontend
npm install
npm install react-router-dom zustand axios date-fns lucide-react
npm install --save-dev tailwindcss postcss autoprefixer
npm install -D @radix-ui/react-dialog @radix-ui/react-toast
npm install clsx tailwind-merge class-variance-authority
```

Or use the pre-configured package manager command:

```bash
npm install react-router-dom zustand axios date-fns lucide-react tailwindcss postcss autoprefixer
```

### 2. Start the Development Server

```bash
npm start
```

The frontend will run on `http://localhost:3000`

### 3. Backend Setup

Make sure the backend is running:

```bash
cd backend
npm start
```

The backend API should be running on `http://localhost:4000/api`

## Key Features

### Authentication

- JWT-based authentication
- Role-based access control (Admin, Staff, Student)
- Persistent login via localStorage
- Protected routes

### State Management

- Zustand for auth and notifications
- No complex Redux setup
- Lightweight and performant

### API Integration

- Axios with interceptors
- Custom `useApi` hook for easy API calls
- Automatic token injection
- Error handling and retry logic

### Components

- Reusable React components
- Button, Modal, Notification system
- Layout with sidebar navigation
- Protected routes

## Migration from Vanilla JS

The vanilla JavaScript version is still available in the root directory:

- Old HTML files: `*.html`
- Old JS files: `js/*.js`
- Old CSS: `css/style.css`

The React version provides:

- ✅ Modern component architecture
- ✅ Better state management
- ✅ Improved code organization
- ✅ Type-safe with JSX
- ✅ Easier to maintain and scale
- ✅ Better developer experience

## Environment Variables

Create a `.env` file in the `frontend` directory:

```
REACT_APP_API_BASE_URL=http://localhost:4000/api
REACT_APP_SOCKET_URL=http://localhost:4000
```

## Testing

### Test Admin/Staff Flow

1. Login with admin@campus.edu / password123
2. Access Events, Rooms, Users pages
3. Create, Edit, Delete events

### Test Student Flow

1. Login with student@campus.edu / password123
2. View events (read-only)
3. Access Calendar
4. View profile

## Troubleshooting

### Backend API not responding

- Check if backend is running on port 4000
- Verify API_BASE_URL in .env file
- Check browser console for CORS errors

### Token expired errors

- Clear localStorage in browser DevTools
- Login again
- Token expires after 8 hours

### Module not found errors

- Run `npm install` again
- Delete node_modules and package-lock.json, then reinstall
- Restart dev server

## Next Steps

1. **Complete Rooms and Users pages** - Use Events.jsx as template
2. **Implement Calendar** - Add monthly calendar view
3. **Add Analytics** - Create dashboard charts
4. **Profile Management** - Add user profile editing
5. **Tests** - Add Jest tests for components
6. **Optimization** - Code splitting and lazy loading

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

### Deploy to Hosting

Use any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps

Make sure to:

1. Update API_BASE_URL to production API
2. Build the app: `npm run build`
3. Deploy the `build/` directory

---

**Last Updated**: April 20, 2026
