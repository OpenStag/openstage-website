import { supabase } from './supabase'

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface SignInData {
  email: string
  password: string
}

// Sign up a new user
export async function signUp(data: SignUpData) {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        }
      }
    })

    if (error) {
      throw error
    }

    return { user: authData.user, session: authData.session, error: null }
  } catch (error: any) {
    return { user: null, session: null, error: error.message }
  }
}

// Sign in an existing user
export async function signIn(data: SignInData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      throw error
    }

    return { user: authData.user, session: authData.session, error: null }
  } catch (error: any) {
    return { user: null, session: null, error: error.message }
  }
}

// Sign out the current user
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Get the current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      throw error
    }
    return { user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Get user profile from database
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw error
    }

    return { profile: data, error: null }
  } catch (error: any) {
    return { profile: null, error: error.message }
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<{
  first_name: string
  last_name: string
  username: string
  bio: string
  phone: string
  location: string
  linkedin_url: string
  github_url: string
  portfolio_url: string
  years_of_experience: number
}>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { profile: data, error: null }
  } catch (error: any) {
    return { profile: null, error: error.message }
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Sign in with GitHub
export async function signInWithGitHub() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}
