'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  createDesign, 
  getUserDesigns, 
  STATUS_LABELS, 
  STATUS_COLORS, 
  TYPE_LABELS,
  type CreateDesignData,
  type DesignWithHistory 
} from '@/lib/designs'
import { createDesignWithProfile } from '@/lib/profile'

export default function DesignPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [designs, setDesigns] = useState<DesignWithHistory[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateDesignData>({
    name: '',
    type: 'website',
    pages_count: 1,
    figma_link: '',
    description: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserDesigns()
    }
  }, [user])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?message=Please log in to access the design page')
        return
      }
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadUserDesigns = async () => {
    const { data, error } = await getUserDesigns()
    if (error) {
      console.error('Error loading designs:', error)
      setMessage({ type: 'error', text: 'Failed to load your designs' })
    } else {
      setDesigns(data || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Design name is required')
      }

      if (formData.pages_count < 1) {
        throw new Error('Number of pages must be at least 1')
      }

      // Validate Figma link if provided
      if (formData.figma_link && !isValidFigmaLink(formData.figma_link)) {
        throw new Error('Please provide a valid Figma link')
      }

      const { data, error } = await createDesignWithProfile(formData)

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Design submitted successfully!' })
      
      // Reset form
      setFormData({
        name: '',
        type: 'website',
        pages_count: 1,
        figma_link: '',
        description: ''
      })

      // Reload designs
      await loadUserDesigns()

    } catch (error) {
      console.error('Error creating design:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to submit design' 
      })
    } finally {
      setSubmitting(false)
    }
  }

  const isValidFigmaLink = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname === 'www.figma.com' || urlObj.hostname === 'figma.com'
    } catch {
      return false
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
          <h1 className="text-3xl font-bold text-gray-900">Submit Your Design</h1>
          <p className="mt-2 text-gray-600">
            Upload your design details and track their progress through our review process.
          </p>
        </div>

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

        {/* Design Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">New Design Submission</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Design Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Design Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your design name"
                required
              />
            </div>

            {/* Type Selection */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Project Type *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'web_application' | 'website' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="website">Website</option>
                <option value="web_application">Web Application</option>
              </select>
            </div>

            {/* Pages Count */}
            <div>
              <label htmlFor="pages_count" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Pages *
              </label>
              <input
                type="number"
                id="pages_count"
                min="1"
                value={formData.pages_count}
                onChange={(e) => setFormData({ ...formData, pages_count: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Figma Link */}
            <div>
              <label htmlFor="figma_link" className="block text-sm font-medium text-gray-700 mb-2">
                Figma Link
              </label>
              <input
                type="url"
                id="figma_link"
                value={formData.figma_link}
                onChange={(e) => setFormData({ ...formData, figma_link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.figma.com/file/..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Provide a shareable Figma link to your design
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your design, its purpose, target audience, or any special requirements..."
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {submitting ? 'Submitting...' : 'Submit Design'}
              </button>
            </div>
          </form>
        </div>

        {/* User's Designs Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Design Submissions</h2>
          
          {designs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-gray-500">You haven't submitted any designs yet.</p>
              <p className="text-sm text-gray-400 mt-1">Submit your first design using the form above!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {designs.map((design) => (
                <div key={design.id} className="border border-gray-200 rounded-lg p-6">
                  {/* Design Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{design.name}</h3>
                      <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                        <span>{TYPE_LABELS[design.type]}</span>
                        <span>•</span>
                        <span>{design.pages_count} page{design.pages_count > 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>Submitted {formatDate(design.created_at)}</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[design.status]}`}>
                        {STATUS_LABELS[design.status]}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {design.description && (
                    <p className="text-gray-600 mb-4">{design.description}</p>
                  )}

                  {/* Figma Link */}
                  {design.figma_link && (
                    <div className="mb-4">
                      <a
                        href={design.figma_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15.5 2H8.4c-1.9 0-3.4 1.5-3.4 3.4v13.1c0 1.9 1.5 3.4 3.4 3.4h.9c1.9 0 3.4-1.5 3.4-3.4V16h3.3c3.7 0 6.7-3 6.7-6.7S19.7 2.6 16 2.6L15.5 2zm0 9.3H12v3.4c0 .9-.7 1.7-1.7 1.7h-.9c-.9 0-1.7-.7-1.7-1.7V5.4c0-.9.7-1.7 1.7-1.7h7.1c2.8 0 5 2.2 5 5S18.3 11.3 15.5 11.3z"/>
                        </svg>
                        View Figma Design
                      </a>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Progress Timeline</h4>
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {/* Initial submission */}
                        <li>
                          <div className="relative pb-8">
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5">
                                <div>
                                  <p className="text-sm text-gray-900">Design submitted</p>
                                  <p className="text-xs text-gray-500">{formatDate(design.created_at)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>

                        {/* Status history */}
                        {design.status_history?.map((history, index) => {
                          const isLast = index === design.status_history!.length - 1
                          return (
                            <li key={history.id}>
                              <div className={`relative ${!isLast ? 'pb-8' : ''}`}>
                                {!isLast && (
                                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                )}
                                <div className="relative flex space-x-3">
                                  <div>
                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                      history.status === 'accepted' ? 'bg-green-500' :
                                      history.status === 'in_development' ? 'bg-blue-500' :
                                      history.status === 'completed' ? 'bg-purple-500' :
                                      history.status === 'rejected' ? 'bg-red-500' :
                                      'bg-yellow-500'
                                    }`}>
                                      {history.status === 'completed' ? (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      ) : history.status === 'rejected' ? (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      ) : (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1 pt-1.5">
                                    <div>
                                      <p className="text-sm text-gray-900">{STATUS_LABELS[history.status as keyof typeof STATUS_LABELS]}</p>
                                      <p className="text-xs text-gray-500">{formatDate(history.created_at)}</p>
                                      {history.notes && (
                                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
