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
  }
}

export default function AdminDesignManager() {
  const [designs, setDesigns] = useState<DesignWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | Design['status']>('all')

  useEffect(() => {
    loadDesigns()
  }, [])

  const loadDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('designs')
        .select(`
          *,
          user:profiles(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDesigns(data as DesignWithUser[])
    } catch (error) {
      console.error('Error loading designs:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateDesignStatus = async (designId: string, newStatus: Design['status'], notes?: string) => {
    setUpdating(designId)
    try {
      const { error } = await supabase
        .from('designs')
        .update({ 
          status: newStatus,
          admin_notes: notes || null
        })
        .eq('id', designId)

      if (error) throw error
      
      // Reload designs to get updated data
      await loadDesigns()
    } catch (error) {
      console.error('Error updating design status:', error)
      alert('Failed to update design status')
    } finally {
      setUpdating(null)
    }
  }

  const filteredDesigns = designs.filter(design => 
    filter === 'all' || design.status === filter
  )

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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Design Management</h2>
        
        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-800 border-blue-200' 
                : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
            }`}
          >
            All ({designs.length})
          </button>
          {Object.entries(STATUS_LABELS).map(([status, label]) => {
            const count = designs.filter(d => d.status === status).length
            return (
              <button
                key={status}
                onClick={() => setFilter(status as Design['status'])}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  filter === status 
                    ? STATUS_COLORS[status as keyof typeof STATUS_COLORS]
                    : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Designs List */}
      <div className="space-y-4">
        {filteredDesigns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No designs found for the selected filter.
          </div>
        ) : (
          filteredDesigns.map((design) => (
            <div key={design.id} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{design.name}</h3>
                  <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                    <span>{design.user.first_name} {design.user.last_name}</span>
                    <span>•</span>
                    <span>{design.user.email}</span>
                    <span>•</span>
                    <span>{TYPE_LABELS[design.type]}</span>
                    <span>•</span>
                    <span>{design.pages_count} page{design.pages_count > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="mt-3 lg:mt-0">
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

              {/* Admin Notes */}
              {design.admin_notes && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Admin Notes:</strong> {design.admin_notes}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-xs text-gray-500 mb-4">
                <span>Submitted: {formatDate(design.created_at)}</span>
                {design.updated_at !== design.created_at && (
                  <span> • Updated: {formatDate(design.updated_at)}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {design.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateDesignStatus(design.id, 'accepted')}
                      disabled={updating === design.id}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Reason for rejection (optional):')
                        if (notes !== null) {
                          updateDesignStatus(design.id, 'rejected', notes)
                        }
                      }}
                      disabled={updating === design.id}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {design.status === 'accepted' && (
                  <button
                    onClick={() => updateDesignStatus(design.id, 'in_development')}
                    disabled={updating === design.id}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Start Development
                  </button>
                )}
                
                {design.status === 'in_development' && (
                  <button
                    onClick={() => updateDesignStatus(design.id, 'completed')}
                    disabled={updating === design.id}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    Mark Complete
                  </button>
                )}

                {updating === design.id && (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    Updating...
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
