# Complete Database Setup Guide

## Prerequisites
You need to run the database schemas in the correct order for the design feature to work properly.

## Step 1: Run User Schema First

Execute this file in your Supabase SQL editor:
```
database/user_schema.sql
```

This creates the foundational tables:
- `profiles` (extends Supabase auth.users)
- `skills` 
- `user_skills`
- `contact_messages`

## Step 2: Run Design Schema

After the user schema is successfully created, execute:
```
database/design_schema.sql
```

This creates the design management tables:
- `designs`
- `design_status_history` 
- `design_comments`

## Quick Setup Commands

### Option 1: Run in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the content of `user_schema.sql`
5. Click "Run"
6. Create another new query
7. Copy and paste the content of `design_schema.sql`
8. Click "Run"

### Option 2: Using Supabase CLI (if installed)
```bash
# First, run user schema
supabase db reset
supabase db push

# Then run design schema
psql -h your-supabase-host -p 5432 -U postgres -d postgres -f database/design_schema.sql
```

## Verification

After running both schemas, verify the tables exist by running this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'designs', 'design_status_history', 'design_comments');
```

You should see all 4 tables listed.

## Common Issues

### "relation does not exist" errors
- Make sure you run `user_schema.sql` first
- Check that all tables were created successfully
- Verify you're running the commands in the correct database

### Permission errors
- Make sure you're connected as a superuser or database owner
- Check that RLS policies are not blocking your operations

### UUID extension errors
- The user schema includes the necessary extensions
- If you get UUID errors, manually run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## Next Steps

After both schemas are created:
1. Test the authentication system (signup/login)
2. Navigate to `/design` page
3. Submit a test design
4. Verify data appears in your Supabase dashboard

## Environment Setup

Make sure your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
