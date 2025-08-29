# Overview

SparkNest is a full-stack note-taking application built with React and Express. The application allows users to create accounts via email verification, securely authenticate, and manage personal notes with a clean, modern interface. It features user authentication with OTP email verification, JWT-based sessions, and full CRUD operations for notes.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with Tailwind CSS for styling using the shadcn/ui component system
- **State Management**: TanStack Query for server state management and React Context for authentication state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Email Service**: Nodemailer for OTP email verification
- **API Design**: RESTful API with structured error handling and request logging middleware

## Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Structure**:
  - `users` table: Core user information with email verification status
  - `notes` table: User notes with title, content, and timestamps
  - `otp_codes` table: Temporary OTP codes for email verification
- **Relationships**: One-to-many relationship between users and notes with cascade deletion

## Authentication & Security
- **Authentication Flow**: Email/password registration with OTP verification
- **Session Management**: JWT tokens stored in localStorage with 7-day expiration
- **Password Security**: bcrypt hashing with salt rounds of 12
- **Route Protection**: Middleware-based authentication for protected endpoints

## Project Structure
- **Monorepo Layout**: Shared schema and types between client and server
- **Client Directory**: React application with organized component structure
- **Server Directory**: Express API with modular service architecture
- **Shared Directory**: Common TypeScript types and Zod schemas

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle Kit**: Database migration and schema management

## UI & Styling
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast development server and build tool with HMR
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

## Email Services
- **Nodemailer**: Email delivery service for OTP verification
- **SMTP Configuration**: Configurable email provider (Gmail by default)

## Authentication Libraries
- **jsonwebtoken**: JWT token generation and verification
- **bcryptjs**: Password hashing and verification

## State Management
- **TanStack Query**: Server state caching and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition