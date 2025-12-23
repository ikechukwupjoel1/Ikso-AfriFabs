# Supabase Setup Guide

## ✅ Already Configured

Your project is now connected to Supabase! The following files have been created:

- **`.env`** - Contains your Supabase credentials
- **`src/lib/supabase.ts`** - Supabase client instance
- **`src/hooks/useSupabase.ts`** - Example hooks for using Supabase
- **`.gitignore`** - Updated to protect your credentials

## 🚀 Next Steps

### 1. Install Dependencies

Run the following command to install the Supabase client library:

```bash
npm install
```

### 2. Using Supabase in Your Components

#### Basic Data Fetching

```tsx
import { useSupabase } from '@/hooks/useSupabase';

function MyComponent() {
  const { data, loading, error } = useSupabase('your_table_name');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

#### Authentication

```tsx
import { useSupabaseAuth } from '@/hooks/useSupabase';

function LoginComponent() {
  const { user, signIn, signOut } = useSupabaseAuth();

  const handleLogin = async () => {
    const { error } = await signIn('user@example.com', 'password');
    if (error) console.error('Login error:', error);
  };

  return (
    <div>
      {user ? (
        <>
          <p>Logged in as: {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={handleLogin}>Sign In</button>
      )}
    </div>
  );
}
```

#### Direct Supabase Client Usage

```tsx
import { supabase } from '@/lib/supabase';

// Insert data
const { data, error } = await supabase
  .from('your_table')
  .insert({ name: 'New Item' });

// Query with filters
const { data, error } = await supabase
  .from('your_table')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });

// Update data
const { data, error } = await supabase
  .from('your_table')
  .update({ status: 'completed' })
  .eq('id', itemId);

// Delete data
const { data, error } = await supabase
  .from('your_table')
  .delete()
  .eq('id', itemId);
```

## 📊 Your Supabase Project

- **Project URL**: https://majjawvqcceuekfcqfrm.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/majjawvqcceuekfcqfrm

## 🔒 Security Notes

- Your `.env` file contains sensitive credentials and is already added to `.gitignore`
- Never commit the `.env` file to version control
- The anon key is safe to use in client-side code (it's public)
- For sensitive operations, use Row Level Security (RLS) policies in Supabase

## 📚 Next Steps in Supabase Dashboard

1. **Create Tables**: Go to Table Editor to create your database tables
2. **Set Up Authentication**: Configure auth providers in Authentication settings
3. **Enable RLS**: Set up Row Level Security policies for data security
4. **Storage**: Configure storage buckets for file uploads

## 🔗 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Auth Helpers](https://supabase.com/docs/guides/auth)
