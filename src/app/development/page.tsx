'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { STATUS_LABELS, STATUS_COLORS, TYPE_LABELS } from '@/lib/designs'
import type { Design } from '@/lib/supabase'

interface DesignWithUser extends Design {
  user: {
    first_name: string
    last_name: string
    email: string
    username?: string
  }
}

export default function DevelopmentPage() {
  const [acceptedDesigns, setAcceptedDesigns] = useState<DesignWithUser[]>([])
  const [ongoingDesigns, setOngoingDesigns] = useState<DesignWithUser[]>([])
  const [completedDesigns, setCompletedDesigns] = useState<DesignWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)

  useEffect(() => {
    loadDesigns()
  }, [])

  const loadDesigns = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Loading development designs...')

      // First, try a simple query without JOIN to test if the table exists
      const { data: simpleData, error: simpleError } = await supabase
        .from('designs')
        .select('*')
        .in('status', ['accepted', 'in_development', 'completed'])
        .order('created_at', { ascending: false })

      console.log('Simple query result:', { data: simpleData, error: simpleError })

      if (simpleError) {
        console.error('Simple query error:', simpleError)
        throw new Error(`Database error: ${simpleError.message} (Code: ${simpleError.code})`)
      }

      if (!simpleData || simpleData.length === 0) {
        console.log('No designs found with development statuses')
        setAcceptedDesigns([])
        setOngoingDesigns([])
        setCompletedDesigns([])
        return
      }

      // Now try to get user information for each design
      const designsWithUsers: DesignWithUser[] = []
      
      for (const design of simpleData) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, username')
            .eq('id', design.user_id)
            .single()

          const designWithUser: DesignWithUser = {
            ...design,
            user: userData || {
              first_name: '',
              last_name: '',
              email: 'Unknown User',
              username: undefined
            }
          }

          designsWithUsers.push(designWithUser)
        } catch (userError) {
          console.warn(`Could not load user for design ${design.id}:`, userError)
          // Still add the design with placeholder user data
          designsWithUsers.push({
            ...design,
            user: {
              first_name: '',
              last_name: '',
              email: 'Unknown User',
              username: undefined
            }
          })
        }
      }

      console.log(`Processed ${designsWithUsers.length} designs with user data`)

      // Separate designs by status
      const accepted = designsWithUsers.filter(d => d.status === 'accepted')
      const ongoing = designsWithUsers.filter(d => d.status === 'in_development')
      const completed = designsWithUsers.filter(d => d.status === 'completed')

      console.log('Design counts:', { 
        accepted: accepted.length, 
        ongoing: ongoing.length, 
        completed: completed.length 
      })

      setAcceptedDesigns(accepted)
      setOngoingDesigns(ongoing)
      setCompletedDesigns(completed)

    } catch (error) {
      console.error('Error loading designs:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load designs. Please check your database connection.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...')
      
      // Test if designs table exists and has any data
      const { data: allDesigns, error: allError } = await supabase
        .from('designs')
        .select('id, name, status')
        .limit(10)

      console.log('All designs test:', { data: allDesigns, error: allError })

      // Test if profiles table exists
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(5)

      console.log('Profiles test:', { data: profiles, error: profileError })

      // Test specific statuses
      const { data: statusTest, error: statusError } = await supabase
        .from('designs')
        .select('status')
        .in('status', ['accepted', 'in_development', 'completed'])

      console.log('Status test:', { data: statusTest, error: statusError })

    } catch (error) {
      console.error('Database test failed:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getUserDisplayName = (user: DesignWithUser['user']) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user.username) {
      return user.username
    }
    return user.email
  }

  const DesignCard = ({ design, showJoinButton = false }: { design: DesignWithUser, showJoinButton?: boolean }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{design.name}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
            <span className="inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {getUserDisplayName(design.user)}
            </span>
            <span>•</span>
            <span>{TYPE_LABELS[design.type]}</span>
            <span>•</span>
            <span>{design.pages_count} page{design.pages_count > 1 ? 's' : ''}</span>
          </div>
          <p className="text-xs text-gray-500">
            Submitted on {formatDate(design.created_at)}
            {design.accepted_at && (
              <span> • Accepted on {formatDate(design.accepted_at)}</span>
            )}
            {design.development_started_at && (
              <span> • Started on {formatDate(design.development_started_at)}</span>
            )}
            {design.completed_at && (
              <span> • Completed on {formatDate(design.completed_at)}</span>
            )}
          </p>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[design.status]}`}>
            {STATUS_LABELS[design.status]}
          </span>
        </div>
      </div>

      {/* Description */}
      {design.description && (
        <p className="text-gray-700 mb-4 text-sm leading-relaxed">{design.description}</p>
      )}

      {/* Figma Link */}
      {design.figma_link && (
        <div className="mb-4">
          <a
            href={design.figma_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 2H8.4c-1.9 0-3.4 1.5-3.4 3.4v13.1c0 1.9 1.5 3.4 3.4 3.4h.9c1.9 0 3.4-1.5 3.4-3.4V16h3.3c3.7 0 6.7-3 6.7-6.7S19.7 2.6 16 2.6L15.5 2zm0 9.3H12v3.4c0 .9-.7 1.7-1.7 1.7h-.9c-.9 0-1.7-.7-1.7-1.7V5.4c0-.9.7-1.7 1.7-1.7h7.1c2.8 0 5 2.2 5 5S18.3 11.3 15.5 11.3z"/>
            </svg>
            View Design in Figma
          </a>
        </div>
      )}

      {/* Admin Notes */}
      {design.admin_notes && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Project Notes:</strong> {design.admin_notes}
          </p>
        </div>
      )}

      {/* Join Button for Accepted Designs */}
      {showJoinButton && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200">
            Join Development Team
          </button>
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
            View Details
          </button>
        </div>
      )}
    </div>
  )

  const SectionHeader = ({ title, count, description, icon }: { 
    title: string, 
    count: number, 
    description: string,
    icon: React.ReactNode 
  }) => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center">
          {icon}
          <h2 className="text-2xl font-bold text-gray-900 ml-2">{title}</h2>
          <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {count}
          </span>
        </div>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading development projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Projects</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDesigns}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Development Hub</h1>
          <p className="mt-2 text-gray-600">
            Join development teams, track ongoing projects, and explore completed work.
          </p>
          
          {/* Debug Section */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              {debugMode ? 'Hide Debug' : 'Show Debug'}
            </button>
            
            {debugMode && (
              <>
                <button
                  onClick={testDatabaseConnection}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Test Database
                </button>
                
                <button
                  onClick={loadDesigns}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Reload Designs
                </button>
              </>
            )}
          </div>
          
          {debugMode && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
              <p className="text-sm text-yellow-700">
                Check the browser console (F12) for detailed logs about the database queries.
              </p>
              <div className="mt-2 text-xs text-yellow-600">
                <div>Accepted: {acceptedDesigns.length}</div>
                <div>Ongoing: {ongoingDesigns.length}</div>
                <div>Completed: {completedDesigns.length}</div>
              </div>
            </div>
          )}
        </div>

        {/* Join Now Section - Accepted Designs */}
        <section className="mb-12">
          <SectionHeader
            title="Join Now"
            count={acceptedDesigns.length}
            description="These designs have been approved and are ready for development. Join a team and start building!"
            icon={
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
            }
          />
          
          {acceptedDesigns.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Available</h3>
              <p className="text-gray-600">There are currently no approved designs ready for development.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {acceptedDesigns.map((design) => (
                <DesignCard key={design.id} design={design} showJoinButton={true} />
              ))}
            </div>
          )}
        </section>

        {/* Ongoing Projects Section */}
        <section className="mb-12">
          <SectionHeader
            title="Ongoing Projects"
            count={ongoingDesigns.length}
            description="These projects are currently under development by our teams."
            icon={
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            }
          />

          {ongoingDesigns.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Ongoing Projects</h3>
              <p className="text-gray-600">There are currently no projects in development.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ongoingDesigns.map((design) => (
                <DesignCard key={design.id} design={design} />
              ))}
            </div>
          )}
        </section>

        {/* Completed Projects Section */}
        <section>
          <SectionHeader
            title="Completed Projects"
            count={completedDesigns.length}
            description="These projects have been successfully completed by our development teams."
            icon={
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            }
          />

          {completedDesigns.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Projects</h3>
              <p className="text-gray-600">No projects have been completed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedDesigns.map((design) => (
                <DesignCard key={design.id} design={design} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
