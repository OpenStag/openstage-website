-- Manual Profile Creation Fix
-- Run this in Supabase SQL Editor if you're still having profile issues

-- Step 1: Check what users exist in auth
SELECT id, email, created_at FROM auth.users;

-- Step 2: Check what profiles exist
SELECT id, email, role, created_at FROM public.profiles;

-- Step 3: Create missing profiles
-- Replace 'your-email@example.com' with your actual email
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    'student',
    u.created_at,
    NOW()
FROM auth.users u
WHERE u.email = 'your-email@example.com'  -- Change this to your email
AND u.id NOT IN (SELECT id FROM public.profiles);

-- Step 4: Verify the profile was created
SELECT * FROM public.profiles WHERE email = 'your-email@example.com';  -- Change this to your email

-- Step 5: Test design insertion (replace the user_id with your actual user ID)
-- Get your user ID first:
SELECT id FROM public.profiles WHERE email = 'your-email@example.com';  -- Change this to your email

-- Then test insert (uncomment and replace YOUR_USER_ID):
-- INSERT INTO public.designs (user_id, name, type, pages_count, status)
-- VALUES ('YOUR_USER_ID_HERE', 'Test Design', 'website', 1, 'pending')
-- RETURNING *;

-- Alternative: Create profile for ALL users who don't have one
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
