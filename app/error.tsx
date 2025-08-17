'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="space-y-2">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900">Something went wrong!</h1>
          <p className="text-gray-600">
            An unexpected error occurred. Don't worry, this has been logged and we're looking into it.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
          
          <div className="text-sm text-gray-500">
            <p>If the problem persists, please contact support</p>
            {error.digest && (
              <p className="mt-2 font-mono text-xs">Error ID: {error.digest}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
