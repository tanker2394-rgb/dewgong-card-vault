'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { LayoutDashboard, Library, PlusCircle, LogOut, User, Snowflake } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navLinks = [
  { href: '/',       label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cards',  label: 'Collection', icon: Library },
  { href: '/add',    label: 'Add Card',   icon: PlusCircle },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-ice-800/60 shadow-ice-lg"
      style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 60%, #0ea5e9 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden group-hover:scale-110 group-hover:bg-white/25 transition-all duration-200">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
                alt="Dewgong"
                className="w-9 h-9 object-contain"
              />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-bold text-white tracking-tight">Card Vault</span>
              <div className="flex items-center gap-1 -mt-0.5">
                <Snowflake className="w-2.5 h-2.5 text-ice-200" />
                <span className="text-[10px] text-ice-200 font-medium tracking-widest uppercase">by Dewgong</span>
              </div>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                    active
                      ? 'bg-white/20 text-white shadow-sm border border-white/25'
                      : 'text-ice-100 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User + logout */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-ice-100 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5">
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-ice-100 hover:bg-red-500/20 hover:text-red-200 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
