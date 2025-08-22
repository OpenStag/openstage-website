'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDesignPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setResults(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  const clearResults = () => {
    setResults([])
  }

  const testAuth = async () => {
    setLoading(true)
    addResult('Testing authentication...')
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        addResult(`❌ Auth error: ${error.message}`)
        return
      }
      
      if (!user) {
        addResult('❌ No user found - please log in first')
        return
      }
      
      addResult(`✅ User authenticated: ${user.email} (ID: ${user.id})`)
      
      // Test profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        addResult(`❌ Profile error: ${profileError.message}`)
        return
      }
      
      addResult(`✅ Profile found: Role=${profile.role}`)
      
    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testDatabase = async () => {
    setLoading(true)
    addResult('Testing database tables...')
    
    try {
      // Test designs table
      const { data: designsData, error: designsError } = await supabase
        .from('designs')
        .select('count(*)')
        .limit(1)
      
      if (designsError) {
        addResult(`❌ Designs table error: ${designsError.message}`)
      } else {
        addResult('✅ Designs table accessible')
      }
      
      // Test profiles table  
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1)
      
      if (profilesError) {
        addResult(`❌ Profiles table error: ${profilesError.message}`)
      } else {
        addResult('✅ Profiles table accessible')
      }
      
    } catch (error) {
      addResult(`❌ Database test failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testInsert = async () => {
    setLoading(true)
    addResult('Testing design insertion...')
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        addResult('❌ No user for insert test')
        return
      }
      
      const testData = {
        name: 'Test Design ' + Date.now(),
        type: 'website' as const,
        pages_count: 1,
        figma_link: '',
        description: 'Test description',
        user_id: user.id,
        status: 'pending' as const
      }
      
      addResult(`Testing insert with: ${JSON.stringify(testData)}`)
      
      const { data, error } = await supabase
        .from('designs')
        .insert(testData)
        .select()
        .single()
      
      if (error) {
        addResult(`❌ Insert failed: ${error.message} (Code: ${error.code})`)
        addResult(`Error details: ${JSON.stringify(error)}`)
      } else {
        addResult(`✅ Insert successful! ID: ${data.id}`)
        
        // Try to read it back
        const { data: readData, error: readError } = await supabase
          .from('designs')
          .select('*')
          .eq('id', data.id)
          .single()
        
        if (readError) {
          addResult(`❌ Read back failed: ${readError.message}`)
        } else {
          addResult(`✅ Read back successful: ${readData.name}`)
        }
      }
      
    } catch (error) {
      addResult(`❌ Insert test failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testRLS = async () => {
    setLoading(true)
    addResult('Testing Row Level Security...')
    
    try {
      // Test if we can read designs
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .limit(5)
      
      if (error) {
        addResult(`❌ RLS read test failed: ${error.message}`)
      } else {
        addResult(`✅ RLS read test passed. Found ${data.length} designs`)
      }
      
    } catch (error) {
      addResult(`❌ RLS test failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Design Upload Diagnostics</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Run Tests</h2>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={testAuth}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Test Authentication
            </button>
            
            <button
              onClick={testDatabase}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Test Database
            </button>
            
            <button
              onClick={testRLS}
              disabled={loading}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              Test RLS
            </button>
            
            <button
              onClick={testInsert}
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Test Insert
            </button>
            
            <button
              onClick={clearResults}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Clear Results
            </button>
          </div>
          
          {loading && (
            <div className="flex items-center mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span>Running test...</span>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="bg-gray-100 rounded p-4 h-64 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click a test button above.</p>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Make sure you&apos;re logged in to your account</li>
            <li>2. Run &apos;&apos;Test Authentication&apos;&apos; first</li>
            <li>3. Then run &apos;&apos;Test Database&apos;&apos; to check table access</li>
            <li>4. Run &apos;&apos;Test RLS&apos;&apos; to check security policies</li>
            <li>5. Finally run &apos;&apos;Test Insert&apos;&apos; to see the actual error</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
