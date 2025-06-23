'use client';

export default function DebugPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">🔍 Environment Debug</h1>
      
      <div className={`p-4 rounded-lg ${
        process.env.NEXT_PUBLIC_API_URL === 'https://ironlog.onrender.com/api/v1' 
          ? 'bg-green-100 border-2 border-green-500' 
          : 'bg-red-100 border-2 border-red-500'
      }`}>
        <h2 className="text-lg font-semibold mb-2">
          {process.env.NEXT_PUBLIC_API_URL === 'https://ironlog.onrender.com/api/v1' 
            ? '✅ Environment Variables (CORRECT)' 
            : '❌ Environment Variables (INCORRECT)'}
        </h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <strong>NEXT_PUBLIC_API_URL:</strong>{' '}
            <code className={`p-1 rounded ${
              process.env.NEXT_PUBLIC_API_URL === 'https://ironlog.onrender.com/api/v1'
                ? 'bg-green-200'
                : 'bg-red-200'
            }`}>
              {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}
            </code>
            {!process.env.NEXT_PUBLIC_API_URL && (
              <span className="text-red-600 font-bold ml-2">← THIS IS THE PROBLEM!</span>
            )}
          </div>
          <div>
            <strong>NODE_ENV:</strong>{' '}
            <code className="bg-white p-1 rounded">
              {process.env.NODE_ENV || 'NOT SET'}
            </code>
          </div>
        </div>
        
        {!process.env.NEXT_PUBLIC_API_URL && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <h3 className="font-bold text-red-800">🚨 IMMEDIATE ACTION REQUIRED:</h3>
            <ol className="list-decimal list-inside text-sm text-red-700 mt-2 space-y-1">
              <li>Go to <a href="https://vercel.com/dashboard" className="underline">Vercel Dashboard</a></li>
              <li>Find your project → Settings → Environment Variables</li>
              <li>Add: NEXT_PUBLIC_API_URL = https://ironlog.onrender.com/api/v1</li>
              <li>Redeploy (Deployments → Redeploy, uncheck "Use existing Build Cache")</li>
            </ol>
          </div>
        )}
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
            console.log('🚨 Status:', process.env.NEXT_PUBLIC_API_URL === 'https://ironlog.onrender.com/api/v1' ? 'CORRECT' : 'NEEDS FIXING');
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Log Environment to Console
        </button>
        
        {process.env.NEXT_PUBLIC_API_URL === 'https://ironlog.onrender.com/api/v1' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <h3 className="font-bold text-green-800">🎉 SUCCESS!</h3>
            <p className="text-sm text-green-700 mt-1">
              Environment variables are correctly configured. Your app should now work properly!
            </p>
            <a 
              href="/login" 
              className="inline-block mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Test Login →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
