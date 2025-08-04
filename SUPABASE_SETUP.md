# Supabase Setup Guide for OpenStage

## Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a project name (e.g., "openstage-website")
4. Set a database password (save this!)
5. Wait for project initialization (2-3 minutes)

### 2. Get Your Project Credentials
1. Go to your project dashboard
2. Click on **Settings** (gear icon in sidebar)
3. Go to **API** section
4. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Update Environment Variables
1. Open `.env.local` file in your project root
2. Replace the placeholder values:

```env
# Replace with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-anon-key
```

### 4. Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `database/user_schema.sql`
4. Click **Run** to execute the schema
5. (Optional) Run `database/user_seed.sql` to add sample skills

### 5. Configure Authentication
1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Under **Site URL**, add: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`

### 6. Enable Google OAuth (Optional)
1. Go to **Authentication** > **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

### 7. Test the Setup
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/signup`
3. Try creating an account
4. Check your Supabase dashboard **Authentication** > **Users** to see new users

## Verification Checklist

- [ ] Supabase project created
- [ ] Environment variables updated in `.env.local`
- [ ] Database schema created (`user_schema.sql` executed)
- [ ] Authentication settings configured
- [ ] Site URL and redirect URLs set
- [ ] Test signup works (user appears in Supabase dashboard)
- [ ] Test login works
- [ ] (Optional) Google OAuth configured and tested

## Common Issues

### 1. "Invalid API key" error
- Check that your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Make sure there are no extra spaces or quotes

### 2. "Cross-origin request blocked"
- Verify your Site URL is set to `http://localhost:3000` in Supabase Auth settings

### 3. OAuth redirect error
- Check redirect URLs in Supabase Auth settings
- Make sure auth callback page exists at `/auth/callback`

### 4. Database errors
- Ensure the schema was executed successfully
- Check the **Logs** section in Supabase for detailed error messages

## What's Included

### Authentication Features:
- ✅ Email/password signup and login
- ✅ Google OAuth integration
- ✅ Automatic profile creation
- ✅ Email verification
- ✅ Password reset (built into Supabase)

### Database Tables:
- ✅ **profiles** - User profiles linked to Supabase auth
- ✅ **skills** - Available skills (programming, design, etc.)
- ✅ **user_skills** - User skill relationships with proficiency levels
- ✅ **contact_messages** - Contact form submissions

### Security:
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only edit their own profiles
- ✅ Public data properly exposed
- ✅ Admin-only operations protected

## Next Steps

After setup, you can:
1. Add more authentication providers (GitHub, Facebook, etc.)
2. Create user profile pages
3. Build skill management features
4. Add project management (using full schema)
5. Implement admin dashboard

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Auth Guide**: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- **OpenStage Issues**: Create an issue in the repository if you need help
