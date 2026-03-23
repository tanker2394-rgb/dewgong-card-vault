'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { LayoutDashboard, Library, PlusCircle } from 'lucide-react'

const navLinks = [
  { href: '/',       label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cards',  label: 'Collection', icon: Library },
  { href: '/add',    label: 'Add Card',   icon: PlusCircle },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-ice-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-ice-100 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-200">
              {/* Dewgong official sprite */}
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
                alt="Dewgong"
                className="w-9 h-9 object-contain"
              />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-bold text-gradient-ice tracking-tight">
                Dewgong
              </span>
              <span className="block text-[10px] text-frost-400 font-medium tracking-widest uppercase -mt-0.5">
                Card Vault
              </span>
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
                      ? 'bg-ice-100 text-ice-700 shadow-sm'
                      : 'text-frost-500 hover:bg-frost-100 hover:text-frost-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
