'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, CheckCircle2, Loader2, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import type { TcgCard } from '@/lib/pokemon-tcg'
import type { Condition, CardInsert } from '@/types/database'
import { CONDITIONS, CONDITION_LABELS } from '@/components/ConditionBadge'

interface FormState {
  name: string
  set_name: string
  set_number: string
  image_url: string
  condition: Condition
  price_paid: string
  market_price: string
  date_purchased: string
  quantity: string
  notes: string
}

const EMPTY_FORM: FormState = {
  name: '',
  set_name: '',
  set_number: '',
  image_url: '',
  condition: 'NM',
  price_paid: '',
  market_price: '',
  date_purchased: new Date().toISOString().split('T')[0],
  quantity: '1',
  notes: '',
}

export function AddCardForm() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSet, setSearchSet] = useState('')
  const [searchResults, setSearchResults] = useState<TcgCard[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedCard, setSelectedCard] = useState<TcgCard | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout>()

  const triggerSearch = useCallback((q: string, set: string) => {
    clearTimeout(searchTimeout.current)
    if (q.trim().length < 2) {
      setSearchResults([])
      return
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      try {
        const params = new URLSearchParams({ q })
        if (set.trim()) params.set('set', set.trim())
        const res = await fetch(`/api/tcg-search?${params}`)
        const data = await res.json()
        setSearchResults(Array.isArray(data) ? data : [])
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }, [])

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    triggerSearch(q, searchSet)
  }, [searchSet, triggerSearch])

  const handleSearchSet = useCallback((s: string) => {
    setSearchSet(s)
    triggerSearch(searchQuery, s)
  }, [searchQuery, triggerSearch])

  const handleSelectCard = (card: TcgCard) => {
    setSelectedCard(card)
    setSearchResults([])
    setSearchQuery('')
    setForm(prev => ({
      ...prev,
      name: card.name,
      set_name: card.set.name,
      set_number: card.number,
      image_url: card.images.large ?? card.images.small ?? '',
      market_price:
        card.tcgplayer?.prices?.holofoil?.market?.toFixed(2) ??
        card.tcgplayer?.prices?.normal?.market?.toFixed(2) ??
        '',
    }))
  }

  const clearCard = () => {
    setSelectedCard(null)
    setForm(EMPTY_FORM)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const payload: CardInsert = {
      name: form.name.trim(),
      set_name: form.set_name.trim(),
      set_number: form.set_number.trim() || null,
      image_url: form.image_url.trim() || null,
      condition: form.condition,
      price_paid: parseFloat(form.price_paid),
      market_price: form.market_price ? parseFloat(form.market_price) : null,
      date_purchased: form.date_purchased,
      quantity: parseInt(form.quantity, 10),
      notes: form.notes.trim() || null,
    }

    if (!payload.name || !payload.set_name || isNaN(payload.price_paid) || payload.price_paid < 0) {
      setError('Please fill in name, set, and a valid price paid.')
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'Failed to save card')
      }

      const saved = await res.json()
      setSuccess(true)
      setTimeout(() => router.push(`/cards/${saved.id}`), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (k: keyof FormState) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value })),
  })

  return (
    <div className="space-y-5">
      {/* TCG Search */}
      {!selectedCard ? (
        <div className="card-surface p-5 space-y-3">
          <h2 className="font-semibold text-frost-700 text-sm uppercase tracking-wide">Search Pokémon TCG</h2>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-frost-400" />
              <input
                type="text"
                placeholder="Card name e.g. Charizard"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="ice-input pl-10"
                autoFocus
              />
              {searching && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-400 animate-spin" />
              )}
            </div>
            <input
              type="text"
              placeholder="Set name (optional)"
              value={searchSet}
              onChange={e => handleSearchSet(e.target.value)}
              className="ice-input sm:w-48"
            />
          </div>

          {/* Results dropdown */}
          {searchResults.length > 0 && (
            <div className="border border-ice-200 rounded-xl overflow-hidden shadow-ice max-h-72 overflow-y-auto">
              {searchResults.map(card => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectCard(card)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-ice-50 transition-colors text-left border-b border-ice-100 last:border-0"
                >
                  {card.images.small && (
                    <div className="w-10 h-14 relative flex-shrink-0">
                      <Image
                        src={card.images.small}
                        alt={card.name}
                        fill
                        className="object-contain"
                        sizes="40px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-frost-800 truncate">{card.name}</div>
                    <div className="text-xs text-frost-400 truncate">{card.set.name} · #{card.number}</div>
                    {card.rarity && (
                      <div className="text-xs text-ice-500">{card.rarity}</div>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-frost-300 rotate-[-90deg]" />
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-sm text-frost-400 text-center py-2">No cards found. Try a different name.</p>
          )}

          <p className="text-xs text-frost-400 text-center">Or fill in the details manually below ↓</p>
        </div>
      ) : (
        /* Selected card preview */
        <div className="card-surface p-5 flex items-center gap-4">
          <div className="w-20 h-28 relative flex-shrink-0 bg-ice-50 rounded-xl overflow-hidden">
            <Image
              src={selectedCard.images.large}
              alt={selectedCard.name}
              fill
              className="object-contain"
              sizes="80px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-frost-800 text-lg truncate">{selectedCard.name}</div>
            <div className="text-frost-400 text-sm">{selectedCard.set.name} · #{selectedCard.number}</div>
            {selectedCard.rarity && <div className="text-xs text-ice-500 mt-0.5">{selectedCard.rarity}</div>}
            <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Card auto-filled
            </div>
          </div>
          <button
            type="button"
            onClick={clearCard}
            className="text-frost-400 hover:text-frost-600 transition-colors flex-shrink-0"
            title="Choose a different card"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main form */}
      <form onSubmit={handleSubmit} className="card-surface p-5 space-y-5">
        <h2 className="font-semibold text-frost-700 text-sm uppercase tracking-wide">Card Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">
              Card Name <span className="text-red-400">*</span>
            </label>
            <input type="text" placeholder="e.g. Charizard" className="ice-input" required {...field('name')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">
              Set Name <span className="text-red-400">*</span>
            </label>
            <input type="text" placeholder="e.g. Base Set" className="ice-input" required {...field('set_name')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">Set Number</label>
            <input type="text" placeholder="e.g. 4/102" className="ice-input" {...field('set_number')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">
              Condition <span className="text-red-400">*</span>
            </label>
            <select className="ice-select" required {...field('condition')}>
              {CONDITIONS.map(c => (
                <option key={c} value={c}>{c} — {CONDITION_LABELS[c]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">Quantity</label>
            <input
              type="number"
              min="1"
              max="999"
              className="ice-input"
              required
              {...field('quantity')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">
              Price I Paid ($) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="ice-input"
              required
              {...field('price_paid')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">
              TCGPlayer Market Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00 (optional)"
              className="ice-input"
              {...field('market_price')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">Date Purchased</label>
            <input type="date" className="ice-input" required {...field('date_purchased')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">Card Image URL</label>
            <input
              type="url"
              placeholder="https://images.pokemontcg.io/…"
              className="ice-input"
              {...field('image_url')}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">Notes / Grade</label>
            <textarea
              rows={3}
              placeholder="Grade, seller notes, PSA/BGS label, anything else…"
              className="ice-input resize-none"
              {...field('notes')}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Card saved! Redirecting…
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || success}
            className={clsx('ice-button flex-1 flex items-center justify-center gap-2')}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Saving…' : 'Save to Vault'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="ice-button-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
