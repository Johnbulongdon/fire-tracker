'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(() => {
        window.location.href = '/dashboard'
      })
    }
  }, [])

  return (
    <div style={{ background: '#08080e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8e8f2', fontFamily: 'sans-serif' }}>
      Signing you in...
    </div>
  )
}
