-- ============================================
-- ADMIN ROLE SETUP FOR RAZZAQ LUXE
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Replace 'YOUR_EMAIL_HERE' with your actual email address
-- ============================================

-- Set a user as admin by their email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'sultanshah101004@gmail.com';

-- Verify the change
SELECT id, email, full_name, role
FROM public.profiles
WHERE email = 'sultanshah101004@gmail.com';

-- ============================================
-- OPTIONAL: Add is_active column to products table if missing
-- ============================================
-- The schema already has this, but run this if you encounter issues:
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
