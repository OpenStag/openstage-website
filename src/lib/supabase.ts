import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (based on our schema)
export interface Profile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  username?: string
  avatar_url?: string
  bio?: string
  role: 'student' | 'mentor' | 'admin' | 'volunteer'
  phone?: string
  location?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  years_of_experience: number
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  category: string
  description?: string
  icon_url?: string
  created_at: string
}

export interface UserSkill {
  id: string
  user_id: string
  skill_id: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  years_experience: number
  is_primary: boolean
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  type: 'general' | 'partnership' | 'support' | 'mentorship'
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
}
