-- Database Verification Queries
-- Run these in Supabase SQL Editor to check your setup

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'designs', 'design_status_history', 'design_comments');

-- 2. Check if you have any users
SELECT count(*) as total_users FROM auth.users;

-- 3. Check if you have any profiles
SELECT count(*) as total_profiles FROM public.profiles;

-- 4. Check if profiles are linked to auth users
SELECT 
    u.email,
    u.id as user_id,
    p.id as profile_id,
    p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- 5. Check if any designs exist
SELECT count(*) as total_designs FROM public.designs;

-- 6. Test inserting a sample design (replace USER_ID with actual user ID)
-- First get a user ID:
SELECT id, email FROM public.profiles LIMIT 1;

-- Then test insert (replace 'YOUR_USER_ID_HERE' with actual ID):
-- INSERT INTO public.designs (user_id, name, type, pages_count, status)
-- VALUES ('YOUR_USER_ID_HERE', 'Test Design', 'website', 1, 'pending');

-- 7. Check RLS policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('designs', 'profiles');

-- 8. Test basic auth context
SELECT auth.uid() as current_user_id;
