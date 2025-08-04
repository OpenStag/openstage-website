import { supabase } from './supabase'
import type { Design, DesignStatusHistory } from './supabase'

export interface CreateDesignData {
  name: string
  type: 'web_application' | 'website'
  pages_count: number
  figma_link?: string
  description?: string
}

export interface DesignWithHistory extends Design {
  status_history: DesignStatusHistory[]
}

// Create a new design
export async function createDesign(designData: CreateDesignData) {
  try {
    console.log('Starting createDesign with data:', designData)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
      throw new Error(`Authentication error: ${authError.message}`)
    }
    
    if (!user) {
      console.error('No user found')
      throw new Error('User not authenticated. Please log in again.')
    }

    console.log('User authenticated:', user.id, user.email)

    // Check if user profile exists
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile query error:', profileError)
      throw new Error(`Profile query failed: ${profileError.message}. Please contact support.`)
    }

    if (!profiles || profiles.length === 0) {
      console.error('No profile found for user:', user.id)
      throw new Error('User profile not found. Please contact support to create your profile.')
    }

    if (profiles.length > 1) {
      console.error('Multiple profiles found for user:', user.id, profiles)
      throw new Error('Multiple profiles found. Please contact support to resolve this issue.')
    }

    const profile = profiles[0]
    console.log('Profile found:', profile)

    const insertData = {
      ...designData,
      user_id: user.id,
      status: 'pending' as const
    }

    console.log('Inserting data:', insertData)

    const { data, error } = await supabase
      .from('designs')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }

    console.log('Insert successful:', data)
    return { data, error: null }
  } catch (error) {
    console.error('createDesign error:', error)
    return { data: null, error: error as Error }
  }
}

// Get user's designs with status history
export async function getUserDesigns() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('designs')
      .select(`
        *,
        status_history:design_status_history(
          id,
          status,
          changed_by,
          notes,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data as DesignWithHistory[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// Get a specific design with full details
export async function getDesignById(designId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('designs')
      .select(`
        *,
        status_history:design_status_history(
          id,
          status,
          changed_by,
          notes,
          created_at
        ),
        comments:design_comments(
          id,
          comment,
          is_admin_comment,
          created_at,
          user:profiles(first_name, last_name, role)
        )
      `)
      .eq('id', designId)
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// Update design (only when status is pending)
export async function updateDesign(designId: string, updates: Partial<CreateDesignData>) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('designs')
      .update(updates)
      .eq('id', designId)
      .eq('user_id', user.id)
      .eq('status', 'pending') // Only allow updates when pending
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// Delete design (only when status is pending)
export async function deleteDesign(designId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('designs')
      .delete()
      .eq('id', designId)
      .eq('user_id', user.id)
      .eq('status', 'pending') // Only allow deletion when pending

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

// Add comment to design
export async function addDesignComment(designId: string, comment: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('design_comments')
      .insert({
        design_id: designId,
        user_id: user.id,
        comment,
        is_admin_comment: false
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// Status display helpers
export const STATUS_LABELS = {
  pending: 'Pending Review',
  accepted: 'Accepted',
  in_development: 'In Development',
  completed: 'Completed',
  rejected: 'Rejected'
} as const

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  in_development: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-purple-100 text-purple-800 border-purple-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
} as const

export const TYPE_LABELS = {
  web_application: 'Web Application',
  website: 'Website'
} as const
