# Authentication Setup Guide

## Overview

This FIRE Dashboard uses Supabase for authentication with complete user ownership and Row Level Security (RLS).

## Features Implemented

✅ **Centralized Supabase Client** (`lib/supabase.ts`)
- Singleton client with auth persistence
- Auto-refresh tokens
- Session storage in localStorage
- Helper functions for user management

✅ **Auth Context Provider** (`lib/auth-context.tsx`)
- Global authentication state
- React hooks for easy access (`useAuth`)
- Automatic session monitoring
- Sign out functionality

✅ **Protected Routes Middleware** (`middleware.ts`)
- Protects `/dashboard`, `/profile`, `/settings` routes
- Redirects unauthenticated users to login
- Redirects authenticated users away from login page

✅ **User Ownership**
- All database operations include `user_id`
- Users can only see/edit their own data
- Enforced by Row Level Security policies

✅ **Toast Notifications**
- Success/error feedback for all operations
- Using `react-hot-toast` library

## Architecture

### Authentication Flow

1. **User visits protected route** → Middleware checks session
2. **No session** → Redirect to `/login`
3. **Login successful** → Redirect to `/dashboard`
4. **Auth state changes** → Context updates all components
5. **Database operations** → Automatic `user_id` filtering via RLS

### File Structure

```
lib/
├── supabase.ts          # Centralized Supabase client
└── auth-context.tsx     # Auth state management

app/
├── layout.tsx           # Wraps app with AuthProvider
├── login/page.tsx       # Login page with Auth UI
└── dashboard/page.tsx   # Protected dashboard

components/
├── CalculatorForm.tsx   # Saves plans with user_id
└── PlanList.tsx         # Fetches user's plans only

middleware.ts            # Route protection
```

## Database Schema

The `user_plans` table includes:

```sql
CREATE TABLE user_plans (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,  -- Links to auth.users
  plan_name TEXT,
  current_age INTEGER,
  monthly_income DECIMAL,
  monthly_invest DECIMAL,
  monthly_spend DECIMAL,
  current_stash DECIMAL,
  fire_number DECIMAL,
  expected_return DECIMAL,
  withdrawal_rate DECIMAL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Setup Instructions

### 1. Configure Supabase (Already Done)

Environment variables are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://boqzhdfdetixnwnohtho.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Run Database Migration

Execute the SQL in `supabase-setup.sql` in your Supabase SQL Editor:
- Creates `user_plans` table with `user_id` column
- Enables Row Level Security (RLS)
- Creates policies for user ownership
- Adds indexes for performance

### 3. Enable Auth Providers (Optional)

In Supabase Dashboard → Authentication → Providers:
- ✅ Email (enabled by default)
- Optional: Enable Google, GitHub, etc.

### 4. Configure Auth Settings

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-domain.com`
- Redirect URLs: Add your deployed URL

## Usage

### Using Auth in Components

```tsx
'use client'
import { useAuth } from '../lib/auth-context'

export default function MyComponent() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>

  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Saving Data with user_id

```tsx
const { user } = useAuth()

const saveData = async () => {
  const { data, error } = await supabase
    .from('user_plans')
    .insert({
      user_id: user.id,  // Always include user_id
      plan_name: 'My Plan',
      // ... other fields
    })
}
```

### Fetching User's Data

```tsx
const fetchData = async () => {
  const { data, error } = await supabase
    .from('user_plans')
    .select('*')
    .eq('user_id', user.id)  // Filter by user_id
    .order('created_at', { ascending: false })
}
```

## Security Features

### Row Level Security (RLS)

All database policies enforce user ownership:

- **SELECT**: Users can only view their own records
- **INSERT**: Users can only create records with their user_id
- **UPDATE**: Users can only update their own records
- **DELETE**: Users can only delete their own records

### Session Management

- Sessions persist in localStorage
- Auto-refresh before expiration
- Automatic cleanup on sign out

### Protected Routes

Middleware automatically:
- Blocks unauthenticated access to protected pages
- Redirects to login with return URL
- Prevents authenticated users from accessing login

## Troubleshooting

### "User not authenticated" errors
- Check if AuthProvider wraps the app in `layout.tsx`
- Verify middleware.ts is in the root directory
- Check browser console for Supabase errors

### Data not saving
- Verify user_id is included in insert operations
- Check Supabase logs for RLS policy violations
- Ensure table exists with correct schema

### Middleware not working
- Check `middleware.ts` is in project root (not `/app`)
- Verify matcher config includes your routes
- Clear browser cache and restart dev server

## Testing

1. **Sign up**: Go to `/login` and create an account
2. **Create plan**: Save a FIRE plan from the calculator
3. **Sign out**: Click sign out button
4. **Sign in again**: Your plans should be visible
5. **New user**: Create another account - should see no plans

## Next Steps

- [ ] Add email verification requirement
- [ ] Implement password reset flow
- [ ] Add user profile page
- [ ] Enable additional OAuth providers
- [ ] Add plan sharing features (optional)
