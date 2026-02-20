<<<<<<< Updated upstream
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import type { Tables } from './types/database.types'

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [communities, setCommunities] = useState<Tables<'communities'>[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Test the connection by fetching communities
        const { data, error: fetchError } = await supabase
          .from('communities')
          .select('*')
          .limit(5)
        
        if (fetchError) {
          throw fetchError
        }
        
        setCommunities(data || [])
        setConnectionStatus('connected')
      } catch (err) {
        console.error('Error connecting to Supabase:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setConnectionStatus('error')
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])
=======
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);
>>>>>>> Stashed changes

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          Supabase Connection Test
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Connection Status</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'checking' ? 'bg-yellow-500' :
              connectionStatus === 'connected' ? 'bg-green-500' :
              'bg-red-500'
            }`} />
            <span className="text-gray-700 capitalize">{connectionStatus}</span>
          </div>
        </div>

        {loading && (
          <div className="text-center text-gray-600">
            <p>Testing Supabase connection...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              Make sure you have created a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Communities ({communities.length})
            </h2>
            {communities.length === 0 ? (
              <p className="text-gray-600">No communities found. Create one to get started!</p>
            ) : (
              <div className="space-y-3">
                {communities.map((community) => (
                  <div 
                    key={community.id} 
                    className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition"
                  >
                    <h3 className="font-semibold text-lg text-gray-900">{community.name}</h3>
                    <p className="text-sm text-gray-600">/{community.slug}</p>
                    {community.description && (
                      <p className="text-gray-700 mt-2">{community.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">✅ Type Safety Demo</h3>
          <p className="text-blue-700 text-sm">
            IntelliSense is now working! Try typing <code className="bg-blue-100 px-1 rounded">supabase.from('communities').select('</code> in your code editor 
            and see autocomplete for table columns like <code className="bg-blue-100 px-1 rounded">name</code>, 
            <code className="bg-blue-100 px-1 rounded">slug</code>, <code className="bg-blue-100 px-1 rounded">description</code>, etc.
          </p>
        </div>
      </div>
<<<<<<< Updated upstream
    </div>
  )
=======
      <h1 className="text-4xl font-bold text-center mt-4">Vite + React</h1>
      <div className="card bg-gray-100 p-6 rounded-lg shadow-md text-center mt-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
        <p className="mt-4 text-gray-600">
          Edit <code className="bg-gray-200 px-1 rounded">src/App.tsx</code> and
          save to test HMR
        </p>
      </div>
      <p className="read-the-docs text-center text-gray-500 mt-4">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
>>>>>>> Stashed changes
}

export default App;
