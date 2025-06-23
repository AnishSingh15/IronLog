'use client';

export default function DebugPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">🔍 Environment Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <strong>NEXT_PUBLIC_API_URL:</strong>{' '}
            <code className="bg-white p-1 rounded">
              {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}
            </code>
          </div>
          <div>
            <strong>NODE_ENV:</strong>{' '}
            <code className="bg-white p-1 rounded">
              {process.env.NODE_ENV || 'NOT SET'}
            </code>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Expected Values:</h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <strong>NEXT_PUBLIC_API_URL should be:</strong>{' '}
            <code className="bg-white p-1 rounded">
              https://ironlog.onrender.com/api/v1
            </code>
          </div>
          <div>
            <strong>NODE_ENV should be:</strong>{' '}
            <code className="bg-white p-1 rounded">
              production
            </code>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => {
            console.log('🔗 Current API Base URL:', process.env.NEXT_PUBLIC_API_URL);
            console.log('🌍 Current Environment:', process.env.NODE_ENV);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Log Environment to Console
        </button>
      </div>
    </div>
  );
}
