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
  const [formError, setFormError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    type: 'website' | 'landing_page';
    pages_count: number;
    figma_link?: string;
    description?: string;
  }>({
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
    setFormError(null)

    // Validation logic
    if (formData.type === 'website' && formData.pages_count < 3) {
      setFormError('A website must have at least 3 pages.')
      setSubmitting(false)
      return
    }
    if (formData.type === 'landing_page' && formData.pages_count !== 1) {
      setFormError('A landing page must have exactly 1 page.')
      setSubmitting(false)
      return
    }

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit Your Design</h1>
          <p className="mt-2">
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
        <div className="bg-white dark:bg-slate-800  rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">New Design Submission</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Design Name & Project Type */}
            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="flex-1 mb-4 md:mb-0">
                <label htmlFor="name" className="block text-sm font-medium mb-2">Design Name *</label>
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
              <div className="flex-1">
                <label htmlFor="type" className="block text-sm font-medium  mb-2">Project Type *</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'website' | 'landing_page' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="website">Website</option>
                  <option value="landing_page">Landing Page</option>
                </select>
              </div>
            </div>

            {/* Row 2: Number of Pages & Figma Link */}
            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="flex-1 mb-4 md:mb-0">
                <label htmlFor="pages_count" className="block text-sm font-medium mb-2">Number of Pages *</label>
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
              <div className="flex-1">
                <label htmlFor="figma_link" className="block text-sm font-medium mb-2">Figma Link</label>
                <input
                  type="url"
                  id="figma_link"
                  value={formData.figma_link}
                  onChange={(e) => setFormData({ ...formData, figma_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.figma.com/file/..."
                />
                <p className="mt-1 text-sm text-gray-500">Provide a shareable Figma link to your design</p>
              </div>
            </div>

            {/* Row 3: Description (spans both columns) */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your design, its purpose, target audience, or any special requirements..."
              />
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mb-4 text-red-600 font-semibold">{formError}</div>
            )}

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
      </div>
    </div>
  )
}
