# React Migration Plan - Smart Campus Event Management

## Overview

Migrating vanilla JavaScript frontend to React for improved maintainability, scalability, and modern development experience.

**Tech Stack:**

- Frontend: React 18 with Create React App
- Styling: Tailwind CSS + shadcn/ui components
- State Management: Zustand
- Routing: React Router v6
- Backend: Express.js (unchanged)

## Migration Strategy

### Phase 1: Project Setup ✓

- [x] Create React project with CRA
- [ ] Install dependencies (Zustand, React Router, shadcn/ui, Tailwind)
- [ ] Set up folder structure
- [ ] Configure environment variables

### Phase 2: Core Infrastructure

- [ ] Create API utility hook (`useApi`)
- [ ] Create Auth store (Zustand)
- [ ] Create Auth context/hook
- [ ] Set up axios or fetch wrapper with interceptors
- [ ] Configure React Router navigation

### Phase 3: Component Migration

- [ ] Create reusable components:
  - Sidebar navigation
  - Topbar/header
  - Table component
  - Modal dialog
  - Notification/Toast system
  - Form components
- [ ] Create hooks:
  - `useAuth()` - authentication state
  - `useEvents()` - event management
  - `useRooms()` - room management
  - `useUsers()` - user management

### Phase 4: Page Migration (by priority)

1. **Authentication Pages**
   - Login → `<LoginPage />`
   - Signup → `<SignupPage />`
   - Forgot Password → `<ForgotPage />`

2. **Core Pages (Admin/Staff)**
   - Dashboard → `<DashboardPage />`
   - Events Management → `<EventsPage />`
   - Rooms Management → `<RoomsPage />`
   - Users Management → `<UsersPage />`
   - Analytics → `<AnalyticsPage />`

3. **Student Pages**
   - Student Dashboard → `<StudentDashboardPage />`
   - Student Event View → `<StudentEventsPage />`
   - Calendar → `<CalendarPage />`

4. **Common Pages**
   - Profile → `<ProfilePage />`
   - Not Found → `<NotFoundPage />`

### Phase 5: Testing & Refinement

- [ ] Test all CRUD operations
- [ ] Verify role-based access control
- [ ] Test notifications and alerts
- [ ] Performance optimization
- [ ] Browser compatibility

## Folder Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── Table.jsx
│   │   ├── Modal.jsx
│   │   ├── Notification.jsx
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Events.jsx
│   │   ├── Rooms.jsx
│   │   ├── Users.jsx
│   │   └── ...
│   ├── hooks/               # Custom hooks
│   │   ├── useApi.js
│   │   ├── useAuth.js
│   │   ├── useEvents.js
│   │   └── ...
│   ├── stores/              # Zustand stores
│   │   ├── authStore.js
│   │   ├── notificationStore.js
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── api.js
│   │   ├── constants.js
│   │   └── ...
│   ├── App.jsx
│   ├── App.css
│   └── index.js
├── .env
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Key Integration Points

### 1. API Layer (`useApi` Hook)

- Replaces `apiRequest()` from vanilla JS
- Handles JWT token injection
- Error handling and retry logic
- Loading states

### 2. Authentication (Zustand Store)

- User state management
- Token persistence in localStorage
- Role-based access control
- Login/logout/signup logic

### 3. Routing

- Replace HTML page navigation with React Router
- Protected routes for role-based access
- Redirect unauthorized users

### 4. State Management

- Zustand stores for:
  - User auth state
  - Notifications
  - App settings
  - Events cache

## Migration Checklist

### Backend Compatibility

- [x] API endpoints unchanged
- [x] JWT authentication flow same
- [x] Database schema same

### Frontend Features to Preserve

- [x] Role-based access control
- [x] Notification system
- [x] Event countdown timers
- [x] Calendar view
- [x] Real-time status updates
- [x] Event image uploads

### Performance Targets

- [ ] Lighthouse score > 85
- [ ] Page load time < 2s
- [ ] Bundle size < 500KB (gzipped)

## Environment Variables

Create `.env` file:

```
REACT_APP_API_BASE_URL=http://localhost:4000/api
REACT_APP_SOCKET_URL=http://localhost:4000
```

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm start

# Backend (in separate terminal)
cd backend
npm start

# Production build
npm run build
```

## Migration Timeline

- **Week 1**: Project setup + core infrastructure
- **Week 2**: Component library + hooks
- **Week 3**: Page migration (auth + dashboard)
- **Week 4**: Feature migration (events, rooms, users)
- **Week 5**: Testing, optimization, deployment

## Rollback Plan

- Keep original `js/` files untouched
- Version control all changes
- Test thoroughly before removing vanilla JS version
- Deploy React version alongside old version initially

## Notes

- Backend remains unchanged
- All API calls through `useApi` hook
- State managed with Zustand (no Redux complexity)
- UI components from shadcn/ui for consistency
- Tailwind CSS for styling (utility-first approach)

---

**Last Updated**: April 20, 2026
**Status**: Planning Phase
