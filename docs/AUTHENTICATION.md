# Authentication System

This document describes the Supabase authentication system implemented for Shalean Services.

## Overview

The authentication system provides:
- User registration and login
- Role-based access control (Customer, Cleaner, Admin)
- Row Level Security (RLS) policies
- Protected routes and middleware
- User profile management

## Database Schema

### Profiles Table
The `profiles` table extends Supabase's `auth.users` table with additional information:

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Roles
- **CUSTOMER**: Default role for new users, can create bookings
- **CLEANER**: Can view assigned bookings, manage availability
- **ADMIN**: Full access to all data and system management

## Authentication Flow

### 1. User Signup
1. User fills out signup form with email, password, first name, last name
2. Supabase creates user in `auth.users` table
3. Database trigger automatically creates corresponding profile with role 'CUSTOMER'
4. User receives email confirmation (if email confirmation is enabled)

### 2. User Login
1. User enters email and password
2. Supabase validates credentials
3. Session is established and stored in cookies
4. User is redirected to appropriate dashboard based on role

### 3. Session Management
- Middleware handles session refresh on every request
- Session data is available in both server and client components
- Automatic logout on session expiration

## Row Level Security (RLS)

RLS policies ensure users can only access data they're authorized to see:

### Profile Access
- Users can read/update their own profile
- Admins can read/update all profiles
- Public can read cleaner profiles (for booking purposes)

### Booking Access
- Customers can see their own bookings
- Cleaners can see bookings assigned to them
- Admins can see all bookings

### Service Access
- Public read access to active services
- Admin-only write access

## API Endpoints

### Authentication Pages
- `/auth/login` - User login form
- `/auth/signup` - User registration form
- `/account` - User profile management
- `/unauthorized` - Access denied page

### Protected Routes
- `/admin/*` - Admin-only routes
- `/cleaner/*` - Cleaner and admin routes
- `/account` - Authenticated users only

## Components

### Hooks
- `useUser()` - Get current user and profile data
- `useRequireRole(role)` - Require specific role
- `useRequireAuth()` - Require authentication

### Components
- `Header` - Navigation with auth-aware menu
- `LogoutButton` - Sign out functionality
- Login/Signup forms with validation

## Middleware

The middleware (`middleware.ts`) handles:
- Session management and refresh
- Route protection based on authentication status
- Role-based access control for admin and cleaner routes
- Automatic redirects for unauthorized access

## Testing

Run the authentication test script:

```bash
node scripts/test-auth.js
```

This will test:
1. User signup and profile creation
2. User login
3. RLS policy enforcement
4. Data cleanup

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Security Considerations

1. **Password Requirements**: Minimum 6 characters (configurable in Supabase)
2. **Email Verification**: Can be enabled in Supabase dashboard
3. **Session Security**: HttpOnly cookies, secure flag in production
4. **RLS Policies**: Database-level security prevents unauthorized access
5. **Middleware Protection**: Server-side route protection
6. **Role Validation**: Both client and server-side role checking

## Admin Functions

Admins can:
- Elevate user roles (Customer → Cleaner → Admin)
- Manage all user accounts
- Access all system data
- Configure system settings

## Cleaner Functions

Cleaners can:
- View assigned bookings
- Update booking status
- Manage availability schedule
- Update profile information
- View earnings and ratings

## Customer Functions

Customers can:
- Create and manage bookings
- Update profile information
- View booking history
- Rate completed services
