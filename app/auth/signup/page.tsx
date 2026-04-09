'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-sm text-center animate-slide-up">
        <div className="text-5xl mb-6">✉️</div>
        <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
        <p className="text-white/40 text-sm leading-relaxed">
          We sent a confirmation link to <strong className="text-white/70">{email}</strong>.
          Click it to activate your account and start tracking your Bitcoin net worth.
        </p>
        <Link
          href="/auth/login"
          className="inline-block mt-8 text-[#F7931A] text-sm hover:underline"
        >
          ← Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm animate-slide-up">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-white/40 text-sm">Start tracking your wealth in Bitcoin</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
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
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
            Confirm password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-white/30 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-[#F7931A] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
