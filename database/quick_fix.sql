-- Quick Fix for Design Upload Issues
-- Run this in Supabase SQL Editor

-- 1. First, let's see what users exist but don't have profiles
SELECT 
    u.id,
    u.email,
    u.created_at,
    CASE WHEN p.id IS NULL THEN 'MISSING PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- 2. Create profiles for users who don't have them
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    'student',
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. Verify all users now have profiles
SELECT 
    COUNT(*) as total_users,
    COUNT(p.id) as users_with_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- 4. Test if we can insert a design (replace YOUR_USER_ID with actual user ID)
-- First get your user ID:
SELECT id, email FROM public.profiles WHERE email = 'your-email@example.com';

-- Then test insert (uncomment and replace the ID):
-- INSERT INTO public.designs (user_id, name, type, pages_count, status)
-- VALUES ('YOUR_USER_ID_HERE', 'Test Design', 'website', 1, 'pending')
-- RETURNING *;

-- 5. If insert fails, check RLS policies:
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'designs';

-- 6. Test auth context
SELECT 
    auth.uid() as current_user,
    auth.jwt() ->> 'email' as current_email;
