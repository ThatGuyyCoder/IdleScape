# AFK Skills Game

## Overview

AFK Skills Game is a modern idle progression web application where players train various skills (mining, fishing, woodcutting, cooking) that continue progressing even when offline. The game features a React-based frontend with a Node.js Express backend, implementing real-time skill training, inventory management, equipment systems, and offline progress calculation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling for accessibility and consistency

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using ESM modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Authentication**: Replit's OpenID Connect (OIDC) authentication system with session management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints with JSON responses and error handling middleware

### Database Design
- **Primary Database**: PostgreSQL with the following core tables:
  - `users`: Stores user authentication data from Replit OIDC
  - `players`: Game characters with name and timestamps
  - `skills`: Individual skill progression (mining, fishing, woodcutting, cooking)
  - `inventory`: Player item storage with quantities
  - `equipment`: Equipped items with stat bonuses
  - `sessions`: Authentication session storage
- **Schema Management**: Drizzle migrations for version-controlled database changes

### Game Engine Architecture
- **Skill System**: Level-based progression with exponential experience curves
- **Resource System**: Different resources unlock at specific skill levels
- **Equipment System**: Stat bonuses for efficiency and experience gains
- **Offline Progress**: Server-side calculation of progress made while away
- **Real-time Updates**: Automatic skill progression tracking with timestamps

### Authentication & Authorization
- **Primary Auth**: Replit OIDC for authenticated users with email-based identification
- **Guest Mode**: Default player system for unauthenticated users
- **Session Management**: Secure HTTP-only cookies with PostgreSQL persistence
- **User Migration**: Automatic player creation for new authenticated users

## External Dependencies

### Database Services
- **Neon Database**: PostgreSQL hosting service via `@neondatabase/serverless`
- **Connection Pooling**: WebSocket-based connections for serverless environments

### Authentication Services
- **Replit OIDC**: Primary authentication provider
- **OpenID Client**: `openid-client` library for OIDC protocol implementation
- **Passport.js**: Authentication middleware with OIDC strategy

### Frontend Libraries
- **UI Framework**: React with TypeScript support
- **Component Library**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Date Utilities**: date-fns for time formatting and calculations

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Database Tools**: Drizzle Kit for migrations and schema management
- **Code Quality**: TypeScript for type safety and ESM module system
- **Development Environment**: Replit-specific plugins for development experience