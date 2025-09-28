# Authentication Documentation

## Overview

ScrumKit uses Supabase Auth for user authentication with email/password and email verification.

## User Flows

### Sign Up Flow

1. User navigates to `/auth`
2. Clicks "Sign Up" tab
3. Enters full name, email, and password (minimum 6 characters)
4. Submits form
5. Receives email with verification link
6. Clicks verification link
7. Account is activated and profile created automatically via database trigger
8. User is redirected to `/retro`

### Sign In Flow

1. User navigates to `/auth`
2. Enters email and password
3. Submits form
4. Authenticated and redirected to intended destination

### Email Verification

- Required for all new accounts
- Verification link sent via email
- Users can resend verification email from `/auth/verify-email`
- Profile is created automatically after verification via database trigger

### Password Reset

- Users can request password reset via "Forgot password" link
- Reset link sent via email
- User creates new password
- Automatically signed in after successful reset

## Protected Routes

The following routes require authentication:
- `/profile` - User profile management
- `/settings` - Application settings
- `/team` - Team management
- `/organization` - Organization settings

Unauthenticated users are redirected to `/auth` with a `redirectTo` parameter.

## Session Management

- Sessions are managed by Supabase Auth
- Tokens are stored in HTTP-only cookies
- Middleware refreshes sessions on each request
- Sessions persist across page reloads
- Users can sign out at any time

## Security Features

- **Email Verification**: Required for all new accounts
- **Password Requirements**: Minimum 6 characters
- **Database Trigger**: Profiles created only after email confirmation
- **Row Level Security**: All database operations protected by RLS policies
- **Minimal Permissions**: Anonymous and authenticated users have SELECT-only access to most tables

## Development

### Testing Authentication Locally

1. Ensure Supabase is configured with email auth enabled
2. Set up SMTP or use Supabase's built-in email service
3. Test signup and verify email is sent
4. Use Supabase Dashboard to view auth logs

### Database Trigger

Profile creation is automated via database trigger in `supabase/migrations/20250928000000_create_profile_trigger.sql`:

- Trigger fires after INSERT or UPDATE on `auth.users`
- Only creates profile when `email_confirmed_at` is NOT NULL
- Prevents duplicate profiles with `ON CONFLICT DO NOTHING`
- Uses SECURITY DEFINER for proper permissions

### Troubleshooting

**Signup not working:**
- Check Supabase email settings
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check browser console for errors
- Ensure database trigger is installed

**Email not received:**
- Check spam folder
- Verify SMTP configuration in Supabase
- Check Supabase auth logs
- Ensure email service is enabled

**Session not persisting:**
- Clear cookies and try again
- Check middleware is configured correctly
- Verify Supabase URL and anon key are set
- Check browser console for auth errors

**Profile not created:**
- Verify email has been confirmed
- Check database trigger exists and is enabled
- Review Supabase logs for trigger errors
- Ensure user has confirmed their email

## API Reference

### Auth Functions (`src/lib/supabase/auth.ts`)

- `signUp(email, password, metadata)` - Create new user account
- `signIn(email, password)` - Sign in existing user
- `signOut()` - Sign out current user
- `getSession()` - Get current session
- `getCurrentUser()` - Get current user
- `getCurrentProfile()` - Get current user profile
- `updateProfile(userId, updates)` - Update user profile
- `requestPasswordReset(email)` - Request password reset
- `updatePassword(newPassword)` - Update user password

### Server Functions

- `getUserFromServer()` - Get user from server-side cookies
- `getProfileFromServer()` - Get profile from server-side

## Testing

### E2E Tests

Comprehensive Cypress tests are available:

```bash
# Run all auth tests
npm run cypress -- --spec "cypress/e2e/auth-*.cy.ts"

# Run specific test suite
npm run cypress -- --spec "cypress/e2e/auth-signin.cy.ts"
```

Test coverage:
- **auth-signup.cy.ts**: Signup validation, error handling, success flow
- **auth-signin.cy.ts**: Signin form, validation, loading states
- **auth-verification.cy.ts**: Email verification flow, error handling
- **auth-session.cy.ts**: Session management, guest access, redirects

### Test Users

Test users are defined in `cypress/fixtures/test-users.json`:
- `validUser`: Standard verified user
- `adminUser`: Administrative user
- `unverifiedUser`: User without email confirmation

## Migration Guide

### From Magic Link to Password Auth

The authentication system was simplified to remove magic link authentication:

**Removed:**
- Magic link tab in AuthForm
- `signInWithMagicLink()` function
- `verifyOtp()` function

**Retained:**
- Password-based authentication
- Email verification
- Password reset functionality

**Migration steps:**
1. Users with existing accounts continue to work normally
2. New users must use password authentication
3. No data migration required

## Best Practices

1. **Always verify email**: Don't trust unverified users
2. **Use strong passwords**: Enforce minimum 6 characters (consider increasing)
3. **Handle errors gracefully**: Show clear, helpful error messages
4. **Test auth flows**: Use Cypress tests to prevent regressions
5. **Monitor logs**: Check Supabase dashboard for auth issues
6. **Secure sessions**: Use HTTP-only cookies, refresh tokens properly
7. **Follow least privilege**: Grant minimal database permissions

## Future Enhancements

Potential improvements:
- OAuth providers (Google, GitHub, etc.)
- Two-factor authentication (2FA)
- Password strength requirements
- Account recovery options
- Session timeout configuration
- Audit log for auth events