import { supabase } from './supabase'

// Create or get user profile
export async function ensureUserProfile() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    console.log('Checking profile for user:', user.id, user.email)

    // Check if profile exists
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile query error:', profileError)
      throw new Error(`Profile query failed: ${profileError.message}`)
    }

    // If profile exists, return it
    if (profiles && profiles.length > 0) {
      console.log('Profile exists:', profiles[0])
      return { data: profiles[0], error: null }
    }

    // If no profile, create one
    console.log('No profile found, creating one...')
    
    const newProfile = {
      id: user.id,
      email: user.email || '',
      role: 'student' as const,
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single()

    if (createError) {
      console.error('Profile creation error:', createError)
      throw new Error(`Failed to create profile: ${createError.message}`)
    }

    console.log('Profile created successfully:', createdProfile)
    return { data: createdProfile, error: null }

  } catch (error) {
    console.error('ensureUserProfile error:', error)
    return { data: null, error: error as Error }
  }
}

// Updated createDesign function that auto-creates profile if needed
export async function createDesignWithProfile(designData: {
  name: string
  type: 'website' | 'landing_page'
  pages_count: number
  figma_link?: string
  description?: string
}) {
  try {
    console.log('Starting createDesignWithProfile...')
    
    // Ensure user has a profile
    const { data: profile, error: profileError } = await ensureUserProfile()
    
    if (profileError || !profile) {
      throw new Error(profileError?.message || 'Failed to get or create user profile')
    }

    console.log('Profile ready:', profile.id)

    const insertData = {
      ...designData,
      user_id: profile.id,
      status: 'pending' as const
    }

    console.log('Inserting design data:', insertData)

    const { data, error } = await supabase
      .from('designs')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }

    console.log('Design created successfully:', data)
    return { data, error: null }

  } catch (error) {
    console.error('createDesignWithProfile error:', error)
    return { data: null, error: error as Error }
  }
}
