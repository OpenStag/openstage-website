import { supabase } from './supabase'

// Get all designs for development page (accepted, in_development, completed)
export async function getDevelopmentDesigns() {
  try {
    const { data, error } = await supabase
      .from('designs')
      .select(`
        *,
        user:profiles(first_name, last_name, email, username, role)
      `)
      .in('status', ['accepted', 'in_development', 'completed'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching development designs:', error)
    return { data: null, error: error as Error }
  }
}

// Get designs by specific status
export async function getDesignsByStatus(status: 'accepted' | 'in_development' | 'completed') {
  try {
    const { data, error } = await supabase
      .from('designs')
      .select(`
        *,
        user:profiles(first_name, last_name, email, username, role)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error(`Error fetching ${status} designs:`, error)
    return { data: null, error: error as Error }
  }
}

// Function to join a development team (placeholder for future implementation)
export async function joinDevelopmentTeam(designId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // This is a placeholder - you would implement team joining logic here
    // For example, adding to a team_members table or sending notifications
    
    console.log(`User ${user.id} wants to join development for design ${designId}`)
    
    // For now, just return success
    return { success: true, error: null }
    
  } catch (error) {
    console.error('Error joining development team:', error)
    return { success: false, error: error as Error }
  }
}

// Function to get development statistics
export async function getDevelopmentStats() {
  try {
    const { data, error } = await supabase
      .from('designs')
      .select('status')
      .in('status', ['accepted', 'in_development', 'completed'])

    if (error) throw error

    const stats = {
      accepted: data.filter(d => d.status === 'accepted').length,
      in_development: data.filter(d => d.status === 'in_development').length,
      completed: data.filter(d => d.status === 'completed').length,
      total: data.length
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error fetching development stats:', error)
    return { data: null, error: error as Error }
  }
}

// Admin function to move design to development (for future admin panel)
export async function startDevelopment(designId: string, adminNotes?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if user is admin/mentor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'mentor'].includes(profile.role)) {
      throw new Error('Insufficient permissions')
    }

    const { data, error } = await supabase
      .from('designs')
      .update({ 
        status: 'in_development',
        admin_notes: adminNotes || null
      })
      .eq('id', designId)
      .eq('status', 'accepted') // Only move from accepted to in_development
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error starting development:', error)
    return { data: null, error: error as Error }
  }
}

// Admin function to complete development
export async function completeDevelopment(designId: string, adminNotes?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if user is admin/mentor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'mentor'].includes(profile.role)) {
      throw new Error('Insufficient permissions')
    }

    const { data, error } = await supabase
      .from('designs')
      .update({ 
        status: 'completed',
        admin_notes: adminNotes || null
      })
      .eq('id', designId)
      .eq('status', 'in_development') // Only move from in_development to completed
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error completing development:', error)
    return { data: null, error: error as Error }
  }
}
