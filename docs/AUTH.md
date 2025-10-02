# Authentication Documentation

## Overview

ScrumKit uses Supabase Auth for user authentication with email/password and email verification.

## User Flows

### Sign Up Flow

1. User navigates to `/auth`
2. Clicks "Sign Up" tab
3. Enters full name, email, and password (minimum 6 characters)
4. Submits form
5. Profile is created immediately via database trigger
6. Receives email with verification link
7. User can login immediately (verification not required for sign-in)
8. Verification banner shows on dashboard/protected pages until email is verified

### Sign In Flow

1. User navigates to `/auth`
2. Enters email and password
3. Submits form
4. Authenticated and redirected to intended destination (works for both verified and unverified users)
5. If unverified, user sees verification banner on protected pages

### Email Verification

- **Recommended but not required** for login
- Verification link sent via email after signup
- Users can resend verification email from the banner on dashboard/boards pages
- Profile is created immediately after signup (not after verification)
- Verification status tracked via `auth.users.email_confirmed_at`
- Unverified users see a prominent orange banner reminding them to verify
- Banner is dismissible but reappears on page refresh

**Confirmation Feedback Flow:**
1. User clicks email verification link
2. Redirected to `/auth/confirm` with token parameters
3. Token is verified via Supabase Auth
4. On success:
   - If user is authenticated → redirect to `/dashboard?confirmed=true`
   - If user is not authenticated → redirect to `/auth?confirmed=true`
5. Toast notification shows: "Email confirmed successfully!"
   - Auth page: "You can now sign in to your account."
   - Dashboard: "You can now access all features."
6. URL parameter is cleared after toast is displayed

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

- **Email Verification**: Recommended for all accounts (soft requirement, not blocking)
- **Password Requirements**: Minimum 6 characters
- **Database Trigger**: Profiles created immediately after signup for all users
- **Row Level Security**: All database operations protected by RLS policies
- **Minimal Permissions**: Anonymous and authenticated users have SELECT-only access to most tables
- **Verification Tracking**: Email verification status tracked via `auth.users.email_confirmed_at`
- **User Experience**: Prominent reminders for unverified users to complete email verification

## Development

### Testing Authentication Locally

1. Ensure Supabase is configured with email auth enabled
2. Set up SMTP or use Supabase's built-in email service
3. Test signup and verify email is sent
4. Use Supabase Dashboard to view auth logs

### Database Trigger

Profile creation is automated via database trigger in `supabase/migrations/20251002000000_allow_unverified_login.sql`:

- Trigger fires after INSERT on `auth.users` for all new users
- Creates profile immediately regardless of email verification status
- Prevents duplicate profiles with `ON CONFLICT DO NOTHING`
- Uses SECURITY DEFINER for proper permissions
- Email verification status tracked separately via `auth.users.email_confirmed_at`

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
- Check database trigger exists and is enabled (`handle_new_user` function)
- Review Supabase logs for trigger errors
- Verify migration `20251002000000_allow_unverified_login.sql` has been applied
- Profile should be created immediately after signup, even for unverified users

**Verification banner not showing:**
- Ensure user is logged in but email is not verified
- Check that `user.email_confirmed_at` is null
- Verify EmailVerificationBanner component is imported on the page
- Check browser console for React errors

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
- **auth-email-confirmation.cy.ts**: Email confirmation toast notifications, redirect behavior
- **auth-unverified-login.cy.ts**: Unverified user login, verification banner display, resend functionality

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

1. **Encourage email verification**: While not required for login, prompt users to verify with banners
2. **Use strong passwords**: Enforce minimum 6 characters (consider increasing)
3. **Handle errors gracefully**: Show clear, helpful error messages
4. **Test auth flows**: Use Cypress tests to prevent regressions
5. **Monitor logs**: Check Supabase dashboard for auth issues
6. **Secure sessions**: Use HTTP-only cookies, refresh tokens properly
7. **Follow least privilege**: Grant minimal database permissions
8. **Track verification status**: Use `user.email_confirmed_at` to differentiate verified/unverified users
9. **Provide easy resend**: Make it simple for users to resend verification emails

## Future Enhancements

Potential improvements:
- OAuth providers (Google, GitHub, etc.)
- Two-factor authentication (2FA)
- Password strength requirements
- Account recovery options
- Session timeout configuration
- Audit log for auth events