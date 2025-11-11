# FitPro - Online Gym Management System

## Project Overview
Comprehensive online gym management system with separate admin and client dashboards, featuring three subscription tiers (Basic, Premium, Elite), video workout libraries, diet management, live training sessions, and progress tracking.

## Current State
- **Design System**: Fitness-focused Material Design with blue/orange/green color scheme, Inter/Montserrat fonts
- **Authentication**: Ready for integration (Replit Auth placeholder in place)
- **Payment**: Ready for Stripe integration
- **Database**: PostgreSQL setup with Drizzle ORM ready
- **Phase**: Design-first prototype with full dummy data

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS
- **Routing**: Wouter

### Directory Structure
```
client/
  src/
    components/        - Reusable UI components
    pages/            - Route pages
      landing.tsx     - Public landing with Client/Admin buttons
      admin-*.tsx     - Admin dashboard pages
      client-*.tsx    - Client dashboard pages
    lib/              - Utilities and configurations
server/
  routes.ts           - API endpoints (stubbed)
  storage.ts          - Data layer interface
shared/
  schema.ts           - Shared types and validation
```

## Features Implemented

### Landing Page
- Hero section with gym background
- Two main access buttons: Client Dashboard & Admin Dashboard
- Dark/light theme toggle

### Admin Dashboard (`/admin/*`)

#### 1. Dashboard (`/admin`)
- 4 key metrics: Total Clients, Active Users, Revenue, Growth Rate
- Recent clients list with package badges
- Quick action buttons
- Collapsible sidebar navigation

#### 2. Clients Management (`/admin/clients`)
- Complete client list (8 sample clients)
- Real-time search by name/email
- Client detail modal with 4 tabs:
  - **Info**: Contact details, action buttons
  - **Progress**: Workout stats, weekly progress charts
  - **Diet**: Assigned diet plan
  - **Sessions**: Live session attendance history
- Add Client modal with full form

#### 3. Video Library (`/admin/videos`)
- 9 workout videos with thumbnails
- Search functionality
- Upload video modal with category/difficulty selection
- Video management interface

#### 4. Diet Plans (`/admin/diet`)
- 5 diet plans (Low Carb, High Protein, Keto, Vegan, Balanced)
- Full details: calories, meals per day, assigned clients
- Edit and assign functionality

#### 5. Live Sessions (`/admin/sessions`)
- Session management (upcoming, live, completed)
- Trainer info, participants, capacity tracking
- Schedule new session button

#### 6. Analytics (`/admin/analytics`)
- Package distribution chart with percentages
- Monthly client growth visualization
- Recent activity feed
- 4 key performance metrics

#### 7. Revenue & Payments (`/admin/revenue`)
- Monthly revenue trending
- Revenue by package breakdown
- Recent payments list
- Export report functionality

### Client Dashboard (`/client/*`)

#### 1. Dashboard (`/client`)
- Welcome message with package badge
- 4 personal stats: Streak, Sessions Completed, Calories, Next Session
- **Continue Watching** section (3 videos)
- **Upcoming Live Sessions** (2 cards)
- **Progress Tracker Widget**:
  - Weekly workout calendar
  - Visual goal tracking (Weight & Workouts)
  - Update goals button
- **Achievements Widget**:
  - 6 unlockable achievements
  - Progress indicator (3/6 unlocked)
  - Visual badge system
- Video player modal with completion tracking

#### 2. Workouts (`/client/workouts`)
- Full video library (9 videos)
- **Working category filter** (All, Strength, Cardio, Yoga, HIIT)
- Dynamic count updates
- Video player modal with "Mark as Complete" feature

#### 3. Diet Plan (`/client/diet`)
- Nutrition goals dashboard (Calories, Protein, Carbs, Fats)
- 3-day detailed meal plans:
  - 4 meals per day with times
  - Complete macro breakdown
  - Total calories per day

#### 4. Live Sessions (`/client/sessions`)
- 3 sections: Live Now, Upcoming, Completed
- Full session details (trainer, time, participants)
- Join/Reserve buttons

#### 5. Workout History (`/client/history`)
- Total stats: Workouts, Calories, Duration
- Weekly progress charts with trending
- Recent workouts list with completion badges

#### 6. Profile & Settings (`/client/profile`)
- 3 tabs: Personal Info, Subscription, Preferences
- **Personal Info**: Contact details form
- **Subscription**: Current plan, billing date, payment method
- **Preferences**: Notification settings, fitness goals

### Interactive Features

#### Notification System
- Notification center with badge count
- 4 notification types: Sessions, Achievements, Videos, Diet
- Mark as read functionality
- Unread count indicator

#### Modals & Dialogs
- Video player with completion tracking
- Client detail with 4-tab interface
- Add client form
- Upload video form
- All forms functional with console logging

#### Data Visualization
- Progress bars for goals and metrics
- Monthly trend charts
- Package distribution charts
- Weekly activity calendars

## Interactive Elements (All Working)

### Client Side
- ✅ Video playback modal
- ✅ Mark workout as complete
- ✅ Category filtering with live updates
- ✅ Search functionality
- ✅ Progress tracking visualization
- ✅ Achievements display
- ✅ Notification center
- ✅ Profile settings forms
- ✅ Theme toggle (light/dark)
- ✅ Navigation between pages

### Admin Side
- ✅ Client search (real-time filtering)
- ✅ Client detail modal (4 tabs)
- ✅ Add client form
- ✅ Upload video form
- ✅ Revenue charts
- ✅ Analytics visualizations
- ✅ Package management
- ✅ Session scheduling interface
- ✅ Theme toggle (light/dark)
- ✅ Sidebar navigation

## Routes

### Public
- `/` - Landing page

### Client
- `/client` - Dashboard
- `/client/workouts` - Video library
- `/client/diet` - Diet plan
- `/client/sessions` - Live sessions
- `/client/history` - Workout history
- `/client/profile` - Settings & profile

### Admin
- `/admin` - Dashboard
- `/admin/clients` - Client management
- `/admin/videos` - Video library
- `/admin/diet` - Diet plans
- `/admin/sessions` - Live sessions
- `/admin/analytics` - Analytics & reports
- `/admin/revenue` - Revenue & payments

## Components

### Shared
- `stat-card` - Metric display cards
- `video-card` - Video thumbnails with play
- `live-session-card` - Session info cards
- `diet-plan-card` - Meal plan display
- `theme-toggle` - Dark/light mode switch

### Client-Specific
- `progress-tracker` - Goals and calendar
- `achievements-widget` - Badge system
- `notification-center` - Alerts dropdown
- `video-player-modal` - Video playback

### Admin-Specific
- `admin-sidebar` - Navigation sidebar
- `client-detail-modal` - Client details (4 tabs)
- `add-client-modal` - New client form
- `upload-video-modal` - Video upload form

## Data Structure (Dummy Data)

### Clients
- 8 sample clients across 3 packages
- Contact info, package, status, join date
- Progress tracking, workout history
- Diet assignments, session attendance

### Videos
- 9 workout videos across 4 categories
- Thumbnails, duration, category
- View counts, completion tracking

### Diet Plans
- 5 different plans (Basic to Elite)
- Daily calories, meal counts
- Macro breakdowns, assigned clients

### Live Sessions
- 6 sessions (upcoming, live, completed)
- Trainer info, timing, participants
- Capacity tracking

## Next Steps for Production

### Authentication
1. Integrate Replit Auth
2. Set up role-based access (admin/client)
3. Add protected routes

### Payments
1. Integrate Stripe
2. Set up subscription management
3. Implement payment tracking

### Backend
1. Implement actual API endpoints
2. Connect to PostgreSQL database
3. Add real-time features for live sessions

### Testing
1. E2E tests with Playwright
2. Unit tests for components
3. API endpoint testing

## Development Notes

- All interactive elements log to console for demonstration
- Mock data marked with comments for easy removal
- Design system fully implemented in `design_guidelines.md`
- Forms are controlled components with validation ready
- Responsive design works on all screen sizes
- Dark mode fully functional across all pages
