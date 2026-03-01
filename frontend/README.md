# EdgeLearn AI - Next-Generation Learning Platform

An innovative learning platform that combines personalized education with AI-powered insights, gamification, and progress tracking.

## Features

### Core Learning System
- **Interactive Courses** - Browse and enroll in expertly-curated courses across multiple categories
- **Smart Lessons** - Comprehensive lesson content with integrated practice exercises
- **Practice System** - Multiple-choice and short-answer quizzes with instant feedback and detailed explanations
- **Progress Tracking** - Real-time monitoring of learning progress and course completion

### Gamification & Engagement
- **XP System** - Earn experience points with every completed practice session
- **Level Progression** - Advance through levels as you accumulate XP
- **Streaks** - Build daily learning streaks and compete with other learners
- **Achievements** - Unlock achievements for exceptional performance milestones

### Analytics & Insights
- **Weekly Activity Dashboard** - Visualize hours studied and XP earned over time
- **Course Performance Metrics** - Track progress, completion rates, and quiz scores per course
- **Learning Insights** - AI-generated recommendations for your best learning times and challenging topics
- **Performance Analytics** - Detailed statistics on learning velocity and course performance

### Social & Competition
- **Global Leaderboard** - Compete with learners worldwide and climb the rankings
- **Top Rankings** - See the top 3 performers with a podium display
- **Student Profiles** - View peer achievements and learning progress
- **Weekly/Monthly Timeframes** - Filter leaderboard by different time periods

### User Management
- **Secure Authentication** - Sign up and log in with email and password
- **User Profiles** - Personalized profiles showing name, level, XP, and progress statistics
- **Progress History** - Complete history of learning activities and achievements

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API
- **Storage**: Browser localStorage (for demo purposes)
- **Fonts**: Geist, Geist Mono

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── page.tsx              # Home/Dashboard page
│   ├── practice/page.tsx      # Practice session demo
│   ├── analytics/page.tsx     # Analytics dashboard page
│   ├── layout.tsx             # Root layout with AuthProvider
│   └── globals.css            # Global styles
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   ├── pages/
│   │   ├── landing-page.tsx
│   │   └── dashboard.tsx
│   ├── dashboard/
│   │   ├── dashboard-nav.tsx
│   │   └── dashboard-home.tsx
│   ├── lessons/
│   │   └── lesson-view.tsx
│   ├── practice/
│   │   ├── practice-session.tsx
│   │   └── practice-results.tsx
│   ├── courses/
│   │   └── courses-grid.tsx
│   ├── leaderboard/
│   │   └── leaderboard.tsx
│   ├── analytics/
│   │   └── analytics-dashboard.tsx
│   └── ui/                    # shadcn/ui components
├── contexts/
│   └── auth-context.tsx       # Authentication context
├── types/
│   └── index.ts               # TypeScript type definitions
└── hooks/                     # Custom React hooks
```

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd v0-project
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials

The app uses mock authentication for demonstration. You can sign up with any email and password to test the platform.

## Key Components

### AuthProvider (`contexts/auth-context.tsx`)
Manages user authentication state and provides login/signup/logout functions throughout the app.

### Landing Page (`components/pages/landing-page.tsx`)
Showcases platform features and provides entry points for authentication.

### Dashboard (`components/pages/dashboard.tsx`)
Main hub for authenticated users with navigation to courses, analytics, leaderboard, and profile.

### Practice System (`components/practice/`)
Interactive quiz system with instant feedback, scoring, and XP calculation.

### Analytics Dashboard (`components/analytics/analytics-dashboard.tsx`)
Comprehensive learning analytics with charts, performance metrics, and AI-driven insights.

### Leaderboard (`components/leaderboard/leaderboard.tsx`)
Global rankings with time-based filtering and streak tracking.

## Color Scheme

- **Primary**: Blue (#2563EB) to Indigo (#4F46E5)
- **Neutral**: Slate grays (#0F172A to #F1F5F9)
- **Accent**: Green (success), Yellow (warning), Red (error)

## Features for Future Development

- Backend API integration with real database
- Real-time notifications for achievements and milestones
- Social features (following, messaging, group studies)
- Advanced course recommendations using ML
- Video content support
- AI-powered content generation
- Mobile app version
- Dark mode support
- Internationalization (i18n)
- Advanced search and filtering
- Course creation tools for educators

## Deployment

### Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Select your repository
5. Click "Deploy"

### Environment Variables

Currently, the app uses localStorage and doesn't require environment variables. When integrating with a backend, add:

```
NEXT_PUBLIC_API_URL=your_api_url
DATABASE_URL=your_database_url
```

## Performance Optimization

- Component-level code splitting with Next.js
- Optimized images with next/image
- CSS-in-JS with Tailwind for minimal bundle size
- Lazy loading of routes and components
- Efficient state management with Context API

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on the repository or contact the development team.

---

Built with Next.js, React, and Tailwind CSS. Designed for modern learners.
