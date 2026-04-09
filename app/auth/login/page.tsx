'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-sm animate-slide-up">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-white/40 text-sm">Sign in to your Bitworth account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#F7931A] text-black font-bold py-3 rounded-lg hover:bg-[#e07a05] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-white/30 text-sm mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-[#F7931A] hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  )
}
