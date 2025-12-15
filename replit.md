# Anime/Manga/Manhwa Streaming Platform

## Overview
Advanced streaming platform for anime, manga, and manhwa content with HLS adaptive streaming, AI-powered recommendations, comprehensive notification system, and advanced video player features.

## Recent Changes
- **December 2025**: Added advanced streaming features
  - HLS adaptive streaming with automatic quality switching
  - AI-powered recommendations using OpenAI GPT-5
  - Notification system for new episodes
  - Activity timeline with privacy controls
  - Advanced video player with PiP, keyboard shortcuts, mobile gestures

## Architecture

### Backend (Node.js/Express)
- **server/index.ts** - Main server entry point
- **server/routes.ts** - API routes for content, users, notifications, recommendations
- **server/storage.ts** - Database storage layer with Drizzle ORM
- **server/recommendations.ts** - AI-powered recommendation engine

### Frontend (React/Vite)
- **client/src/App.tsx** - Main application entry
- **client/src/pages/** - Page components (Home, Watch, Anime, etc.)
- **client/src/components/** - Reusable UI components

### Database (PostgreSQL)
Main tables:
- `users` - User accounts
- `content` - Anime/manga/manhwa content
- `episodes` - Episode data with HLS URLs
- `chapters` - Manga/manhwa chapters
- `favorites` - User favorites
- `watch_history` - Watch progress tracking
- `ratings` - User ratings
- `comments` - User comments
- `notifications` - User notifications
- `user_preferences` - Privacy and notification settings
- `activity_timeline` - User activity with privacy mode
- `recommendations` - AI recommendations cache
- `anime_sources` - HLS streaming sources

## Key Features

### HLS Video Player
- Adaptive bitrate streaming via hls.js
- Automatic quality switching based on bandwidth
- Picture-in-Picture support
- Keyboard shortcuts (Space/K, M, F, arrows, 0-9)
- Mobile gesture controls (double-tap, swipe)
- Skip intro/outro buttons
- Episode navigation

### AI Recommendations
- OpenAI GPT-5 integration for personalized suggestions
- Fallback scoring based on genres and viewing history
- Graceful handling when API key is not configured

### Notification System
- New episode alerts
- Series completion notifications
- Recommendation notifications
- Mark as read/delete functionality

### Privacy Controls
- Hidden mode for activity timeline
- Private activity tracking
- User preference management

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - Optional, for AI recommendations
- `SESSION_SECRET` - Session encryption key

## Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema to database
- `npm run build` - Build for production

## User Preferences
- Russian language interface
- Dark mode support
- Responsive design for mobile/desktop
