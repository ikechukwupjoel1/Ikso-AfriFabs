# 🚀 Vercel Environment Variables Setup

## Step-by-Step Instructions

### 1. Navigate to Environment Variables Settings

Go to: [https://vercel.com/joel-prince-a-ikechukwus-projects/ikso-afri-fabs/settings/environment-variables](https://vercel.com/joel-prince-a-ikechukwus-projects/ikso-afri-fabs/settings/environment-variables)

### 2. Add Your Supabase Credentials

Click "Add New" and add these two variables:

#### Variable 1: VITE_SUPABASE_URL

```
Name: VITE_SUPABASE_URL
Value: https://majjawvqcceuekfcqfrm.supabase.co
Environment: ✅ Production ✅ Preview ✅ Development
```

#### Variable 2: VITE_SUPABASE_ANON_KEY

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hamphd3ZxY2NldWVrZmNxZnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NDIxMTksImV4cCI6MjA4MjAxODExOX0.Vty8TdfTdf-bzC26YUieIjQh4x5n6FfnWjtJMeNw_KM
Environment: ✅ Production ✅ Preview ✅ Development
```

### 3. Save and Redeploy

After adding both variables:
1. Click **Save** on each variable
2. Go to [Deployments](https://vercel.com/joel-prince-a-ikechukwus-projects/ikso-afri-fabs/deployments)
3. Find your latest deployment
4. Click the three dots (•••) menu
5. Select **Redeploy**
6. Click **Redeploy** to confirm

### 4. Wait for Deployment to Complete

Your app will rebuild with the environment variables. This takes 1-2 minutes.

---

## ✅ Verification

Once deployment is complete:

1. Visit your production URL (should be something like `https://ikso-afri-fabs.vercel.app`)
2. Open Gallery page
3. Once you run the SQL seed script, fabrics should load from Supabase

---

## 🔗 Quick Links

- **Env Variables**: https://vercel.com/joel-prince-a-ikechukwus-projects/ikso-afri-fabs/settings/environment-variables
- **Deployments**: https://vercel.com/joel-prince-a-ikechukwus-projects/ikso-afri-fabs/deployments
- **Project Dashboard**: https://vercel.com/joel-prince-a-ikechukwus-projects/ikso-afri-fabs
