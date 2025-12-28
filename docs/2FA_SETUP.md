# Two-Factor Authentication (2FA) Setup Guide

> **Note**: MFA/2FA requires Supabase Pro plan. This document provides guidance for future implementation.

## Prerequisites

1. **Supabase Pro Plan** - MFA is a paid feature
2. **Admin Dashboard Access** - For configuring MFA settings

## Implementation Steps

### Step 1: Enable MFA in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Multi-Factor Authentication**, toggle **Enable MFA**
4. Choose MFA factors:
   - **TOTP (Time-based One-Time Password)** - Recommended
   - **Phone SMS** - Requires SMS provider setup

### Step 2: Update Frontend Authentication Flow

After enabling MFA in Supabase, update your auth flow:

```typescript
// In AuthContext.tsx, update the signIn function:

const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;

    // Check if MFA is required
    if (data.session?.user?.factors?.length > 0) {
        // User has MFA enrolled - redirect to MFA verification
        // Store the intermediate state and show MFA input
        return { requiresMFA: true, factors: data.session.user.factors };
    }

    return { requiresMFA: false };
};
```

### Step 3: Create MFA Enrollment Component

For admins to enroll in MFA:

```typescript
// components/auth/MFAEnrollment.tsx
import { supabase } from '@/lib/supabase';

const enrollMFA = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
    });

    if (error) throw error;

    // Display QR code for user to scan
    return data; // Contains qr_code and secret
};

const verifyMFA = async (factorId: string, code: string) => {
    const { data, error } = await supabase.auth.mfa.challenge({
        factorId
    });

    if (error) throw error;

    const verifyResult = await supabase.auth.mfa.verify({
        factorId,
        challengeId: data.id,
        code
    });

    return verifyResult;
};
```

### Step 4: Require MFA for Admin Access

Add MFA requirement check in `Admin.tsx`:

```typescript
// Check if admin has MFA enabled
const checkMFAStatus = async () => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    // AAL1 = password only, AAL2 = password + MFA
    if (data?.currentLevel === 'aal1' && isAdmin) {
        // Redirect to MFA enrollment or show warning
        toast.warning('Please enable 2FA for your admin account');
    }
};
```

## Security Recommendations

1. **Require MFA for all Super Admins**
2. **Recommend MFA for Product/Order Managers**
3. **Allow viewers to skip MFA** (they have read-only access)
4. **Add grace period** - Allow 7 days to set up MFA after becoming admin

## Supabase MFA API Reference

- `supabase.auth.mfa.enroll()` - Start MFA enrollment
- `supabase.auth.mfa.challenge()` - Create MFA challenge
- `supabase.auth.mfa.verify()` - Verify MFA code
- `supabase.auth.mfa.unenroll()` - Remove MFA factor
- `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` - Check MFA status

## Resources

- [Supabase MFA Documentation](https://supabase.com/docs/guides/auth/auth-mfa)
- [TOTP Authenticator Apps](https://en.wikipedia.org/wiki/Comparison_of_OTP_applications)
