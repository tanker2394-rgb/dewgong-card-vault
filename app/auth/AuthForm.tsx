'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { clsx } from 'clsx'

type Mode = 'login' | 'signup'

export function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email for a confirmation link!')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex rounded-xl border border-frost-200 overflow-hidden">
        <button
          type="button"
          onClick={() => { setMode('login'); setError(null); setMessage(null) }}
          className={clsx('flex-1 py-2.5 text-sm font-semibold transition-colors',
            mode === 'login' ? 'bg-ice-600 text-white' : 'text-frost-500 hover:bg-frost-50'
          )}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(null); setMessage(null) }}
          className={clsx('flex-1 py-2.5 text-sm font-semibold transition-colors',
            mode === 'signup' ? 'bg-ice-600 text-white' : 'text-frost-500 hover:bg-frost-50'
          )}
        >
          Create Account
        </button>
      </div>

      {/* Email/password form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-frost-500 uppercase tracking-wide mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-frost-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="ice-input pl-10"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-frost-500 uppercase tracking-wide mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-frost-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="ice-input pl-10 pr-10"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-frost-400 hover:text-frost-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
            {message}
          </div>
        )}

        <button type="submit" disabled={loading} className="ice-button w-full flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}
