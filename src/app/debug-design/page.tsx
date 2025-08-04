'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DebugDesignPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'website' as 'web_application' | 'website',
    pages_count: 1,
    figma_link: '',
    description: ''
  })

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
    console.log('DEBUG:', info)
  }

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      addDebugInfo('Checking user authentication...')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        addDebugInfo(`User error: ${userError.message}`)
        throw userError
      }
      
      if (!user) {
        addDebugInfo('No user found, redirecting to login')
        router.push('/login?message=Please log in to access the design page')
        return
      }
      
      addDebugInfo(`User found: ${user.email} (ID: ${user.id})`)
      setUser(user)

      // Check if profile exists
      addDebugInfo('Checking user profile...')
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        addDebugInfo(`Profile error: ${profileError.message}`)
        if (profileError.code === 'PGRST116') {
          addDebugInfo('Profile not found - this might be the issue!')
          setMessage({ 
            type: 'error', 
            text: 'User profile not found. Please contact support.' 
          })
        }
      } else {
        addDebugInfo(`Profile found: ${JSON.stringify(profileData)}`)
        setProfile(profileData)
      }

    } catch (error) {
      addDebugInfo(`Auth error: ${error}`)
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    try {
      addDebugInfo('Testing database connection...')
      
      // Test if we can query the designs table
      const { data, error } = await supabase
        .from('designs')
        .select('count(*)')
        .limit(1)

      if (error) {
        addDebugInfo(`Database error: ${error.message}`)
      } else {
        addDebugInfo('Database connection successful')
      }

      // Test if we can query profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1)

      if (profilesError) {
        addDebugInfo(`Profiles table error: ${profilesError.message}`)
      } else {
        addDebugInfo('Profiles table accessible')
      }

    } catch (error) {
      addDebugInfo(`Connection test failed: ${error}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    addDebugInfo('Starting form submission...')

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Design name is required')
      }

      if (formData.pages_count < 1) {
        throw new Error('Number of pages must be at least 1')
      }

      if (!user) {
        throw new Error('User not authenticated')
      }

      addDebugInfo('Form validation passed')
      addDebugInfo(`Submitting: ${JSON.stringify(formData)}`)

      // Prepare data for insertion
      const insertData = {
        ...formData,
        user_id: user.id,
        status: 'pending'
      }

      addDebugInfo(`Insert data: ${JSON.stringify(insertData)}`)

      const { data, error } = await supabase
        .from('designs')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        addDebugInfo(`Insert error: ${error.message} (Code: ${error.code})`)
        throw error
      }

      addDebugInfo(`Insert successful: ${JSON.stringify(data)}`)
      setMessage({ type: 'success', text: 'Design submitted successfully!' })
      
      // Reset form
      setFormData({
        name: '',
        type: 'website',
        pages_count: 1,
        figma_link: '',
        description: ''
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit design'
      addDebugInfo(`Submission failed: ${errorMessage}`)
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Debug Design Upload</h1>
          <p className="mt-2 text-gray-600">
            This debug version will help identify upload issues.
          </p>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index} className="font-mono text-xs">{info}</div>
            ))}
          </div>
          <button
            onClick={testDatabaseConnection}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Test Database Connection
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">User Status:</h3>
            <p className="text-sm text-green-700">Email: {user.email}</p>
            <p className="text-sm text-green-700">ID: {user.id}</p>
            <p className="text-sm text-green-700">Profile: {profile ? 'Found' : 'Missing'}</p>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p>{message.text}</p>
          </div>
        )}

        {/* Simple Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Test Design Upload</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Design Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Test Design"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'web_application' | 'website' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="website">Website</option>
                <option value="web_application">Web Application</option>
              </select>
            </div>

            <div>
              <label htmlFor="pages_count" className="block text-sm font-medium text-gray-700 mb-2">
                Pages *
              </label>
              <input
                type="number"
                id="pages_count"
                min="1"
                value={formData.pages_count}
                onChange={(e) => setFormData({ ...formData, pages_count: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-200"
            >
              {submitting ? 'Submitting...' : 'Test Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
