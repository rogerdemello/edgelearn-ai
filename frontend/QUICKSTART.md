# EdgeLearn AI Quick Start Guide

Get up and running with EdgeLearn AI in minutes!

## Prerequisites

- Node.js 18+ installed
- pnpm package manager (or npm/yarn)

## Installation Steps

### 1. Clone or Download the Project

```bash
cd path/to/v0-project
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## First Time Usage

### Sign Up

1. Click "Get Started" on the landing page
2. Enter your name, email, and password
3. Click "Sign Up"
4. You'll be redirected to the dashboard

### Explore the Dashboard

Once logged in, you'll see:
- **Dashboard Home**: Overview of your progress with stats and recommended courses
- **Courses**: Browse and enroll in available courses
- **Analytics**: Track your learning metrics and performance
- **Leaderboard**: See how you rank against other learners
- **Profile**: View your personal statistics and progress

## Demo Features to Try

### 1. Practice System
1. Go to `/practice` to try a sample practice session
2. Answer 5 JavaScript questions
3. See your score and detailed explanations for each answer
4. Earn XP based on your performance

### 2. Analytics
1. Navigate to `/analytics` to view your learning dashboard
2. Check weekly activity charts
3. Review course performance metrics
4. See personalized learning insights

### 3. Leaderboard
1. Go to the Leaderboard section
2. Filter by different timeframes (This Week, This Month, All Time)
3. See your rank among learners

## Project Structure Quick Reference

```
Key Files:
- app/page.tsx              - Main entry point (routing logic)
- contexts/auth-context.tsx - User authentication state
- components/pages/        - Full page components
- components/dashboard/    - Dashboard sections
- components/practice/     - Practice system
- components/analytics/    - Analytics dashboard
- types/index.ts          - TypeScript definitions
```

## Customization

### Change Branding
- Update the logo and name in `components/pages/landing-page.tsx`
- Modify the gradient colors in `globals.css`

### Add New Courses
Edit the course data in `components/courses/courses-grid.tsx`

### Modify Practice Questions
Update the questions array in `app/practice/page.tsx`

## Building for Production

```bash
pnpm build
pnpm start
```

## Deployment Options

### Vercel (Recommended)
```bash
pnpm vercel
```

### Docker
Create a Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## Troubleshooting

### Port Already in Use
```bash
pnpm dev -- -p 3001
```

### Dependencies Not Installing
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### localStorage Issues
Open DevTools > Application > Clear Storage to reset app data

## Next Steps

1. **Customize the branding** - Update colors, fonts, and logo
2. **Add real courses** - Replace mock course data with your content
3. **Connect a backend** - Integrate with a real API and database
4. **Deploy** - Push to Vercel or your preferred hosting
5. **Add features** - Implement OAuth, dark mode, notifications, etc.

## Useful Commands

```bash
pnpm dev         # Start development server
pnpm build       # Build for production
pnpm start       # Start production server
pnpm lint        # Run linter
pnpm type-check  # Check TypeScript types
```

## Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [shadcn/ui Docs](https://ui.shadcn.com)

## Need Help?

- Check the README.md for detailed feature documentation
- Review component comments for implementation details
- Test the demo features to understand the system

Happy learning! 🚀
