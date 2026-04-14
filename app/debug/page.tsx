'use client'

export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Supabase Environment Variables</h2>
          <pre className="text-sm">
NEXT_PUBLIC_SUPABASE_URL = "{process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT FOUND'}"
          </pre>
          <pre className="text-sm">
NEXT_PUBLIC_SUPABASE_ANON_KEY = "{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length - 10) : 'NOT FOUND'}"
          </pre>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Test in Console</h2>
          <p className="text-sm mb-2">Open browser console (F12) and paste:</p>
          <pre className="bg-black text-white p-2 rounded text-xs">
{`// Check if env vars are in the page
const scripts = document.querySelectorAll('script');
let found = false;
scripts.forEach(script => {
  if (script.textContent?.includes('boqzhdfdetixnwnohtho')) {
    console.log('✅ Supabase URL found in script');
    found = true;
  }
});
if (!found) console.log('❌ Supabase URL not found in any script');`}
          </pre>
        </div>
      </div>
    </div>
  )
}