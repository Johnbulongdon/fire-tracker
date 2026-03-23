'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [redirectUrl, setRedirectUrl] = useState(
  typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'https://untilfire.com/auth/callback'
)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/auth/callback`
console.log('redirectTo URL:', url)
setRedirectUrl(url)
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔥 FIRE Dashboard
            </h1>
            <p className="text-gray-600">
              Sign in to track your journey to Financial Independence
            </p>
          </div>
         <Auth
  supabaseClient={supabase}
  appearance={{ 
    theme: ThemeSupa,
    variables: {
      default: {
        colors: {
          brand: '#2563eb',
          brandAccent: '#1d4ed8',
        },
      },
    },
  }}
  providers={['github', 'google']}
  redirectTo={redirectUrl}
/>
)}
        </div>
      </div>
    </div>
  )
}
