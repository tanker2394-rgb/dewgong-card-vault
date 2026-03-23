'use client'

import { useState, useMemo } from 'react'
import type { CardRow, Condition } from '@/types/database'
import { CardThumbnail } from '@/components/CardThumbnail'
import { EmptyState } from '@/components/EmptyState'
import { CONDITIONS, CONDITION_LABELS } from '@/components/ConditionBadge'
import { Search, SlidersHorizontal, X, LayoutGrid, List } from 'lucide-react'
import { clsx } from 'clsx'
import Link from 'next/link'
import { ConditionBadge } from '@/components/ConditionBadge'
import { format } from 'date-fns'

type SortKey = 'created_at' | 'name' | 'price_paid' | 'market_price' | 'set_name'
type SortDir = 'asc' | 'desc'
type ViewMode = 'grid' | 'list'

interface Props {
  initialCards: CardRow[]
}

export function CardListClient({ initialCards }: Props) {
  const [search, setSearch] = useState('')
  const [conditionFilter, setConditionFilter] = useState<Condition | 'ALL'>('ALL')
  const [setFilter, setSetFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const allSets = useMemo(() => {
    const sets = [...new Set(initialCards.map(c => c.set_name))].sort()
    return sets
  }, [initialCards])

  const filtered = useMemo(() => {
    let result = [...initialCards]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.set_name.toLowerCase().includes(q) ||
        (c.notes ?? '').toLowerCase().includes(q)
      )
    }

    if (conditionFilter !== 'ALL') {
      result = result.filter(c => c.condition === conditionFilter)
    }

    if (setFilter) {
      result = result.filter(c => c.set_name === setFilter)
    }

    result.sort((a, b) => {
      let av: string | number = a[sortKey] as string | number ?? ''
      let bv: string | number = b[sortKey] as string | number ?? ''

      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()

      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [initialCards, search, conditionFilter, setFilter, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortArrow = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const hasFilters = conditionFilter !== 'ALL' || setFilter !== '' || search !== ''

  const totalValue = filtered.reduce((s, c) => s + (c.market_price ?? c.price_paid) * c.quantity, 0)
  const totalSpent = filtered.reduce((s, c) => s + c.price_paid * c.quantity, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-frost-800">My Collection</h1>
          <p className="text-frost-400 text-sm mt-0.5">
            {filtered.length} card{filtered.length !== 1 ? 's' : ''}
            {hasFilters ? ' (filtered)' : ` — $${totalSpent.toFixed(2)} spent · $${totalValue.toFixed(2)} value`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl border border-ice-200 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx('px-3 py-2 transition-colors', viewMode === 'grid' ? 'bg-ice-100 text-ice-700' : 'text-frost-400 hover:bg-frost-50')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx('px-3 py-2 transition-colors', viewMode === 'list' ? 'bg-ice-100 text-ice-700' : 'text-frost-400 hover:bg-frost-50')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors',
              showFilters || hasFilters
                ? 'bg-ice-100 border-ice-300 text-ice-700'
                : 'border-ice-200 text-frost-500 hover:bg-frost-50'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && <span className="bg-ice-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
          </button>
          <Link href="/add" className="ice-button text-sm">
            + Add
          </Link>
        </div>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-frost-400" />
          <input
            type="text"
            placeholder="Search cards, sets, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ice-input pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-frost-400 hover:text-frost-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="card-surface p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Condition */}
            <div>
              <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">Condition</label>
              <select
                value={conditionFilter}
                onChange={e => setConditionFilter(e.target.value as Condition | 'ALL')}
                className="ice-select"
              >
                <option value="ALL">All Conditions</option>
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{c} — {CONDITION_LABELS[c]}</option>
                ))}
              </select>
            </div>

            {/* Set */}
            <div>
              <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">Set</label>
              <select
                value={setFilter}
                onChange={e => setSetFilter(e.target.value)}
                className="ice-select"
              >
                <option value="">All Sets</option>
                {allSets.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-semibold text-frost-500 mb-1.5 uppercase tracking-wide">Sort by</label>
              <select
                value={`${sortKey}_${sortDir}`}
                onChange={e => {
                  const [k, d] = e.target.value.split('_') as [SortKey, SortDir]
                  setSortKey(k)
                  setSortDir(d)
                }}
                className="ice-select"
              >
                <option value="created_at_desc">Date Added (newest)</option>
                <option value="created_at_asc">Date Added (oldest)</option>
                <option value="name_asc">Name (A–Z)</option>
                <option value="name_desc">Name (Z–A)</option>
                <option value="price_paid_desc">Price Paid (high)</option>
                <option value="price_paid_asc">Price Paid (low)</option>
                <option value="market_price_desc">Market Value (high)</option>
                <option value="market_price_asc">Market Value (low)</option>
                <option value="set_name_asc">Set Name</option>
              </select>
            </div>

            {/* Clear filters */}
            {hasFilters && (
              <div className="sm:col-span-3 flex justify-end">
                <button
                  onClick={() => { setSearch(''); setConditionFilter('ALL'); setSetFilter('') }}
                  className="text-sm text-ice-500 hover:text-ice-700 font-medium flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        hasFilters ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-frost-400">
            <Search className="w-8 h-8" />
            <p>No cards match your filters.</p>
            <button
              onClick={() => { setSearch(''); setConditionFilter('ALL'); setSetFilter('') }}
              className="text-ice-500 hover:underline text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <EmptyState />
        )
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(card => (
            <CardThumbnail key={card.id} card={card} />
          ))}
        </div>
      ) : (
        /* List view */
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ice-50 border-b border-ice-100">
                  <th className="px-4 py-3 text-left font-semibold text-frost-500 text-xs uppercase tracking-wide">Image</th>
                  <th
                    className="px-4 py-3 text-left font-semibold text-frost-500 text-xs uppercase tracking-wide cursor-pointer hover:text-ice-600"
                    onClick={() => handleSort('name')}
                  >
                    Name{sortArrow('name')}
                  </th>
                  <th
                    className="px-4 py-3 text-left font-semibold text-frost-500 text-xs uppercase tracking-wide cursor-pointer hover:text-ice-600"
                    onClick={() => handleSort('set_name')}
                  >
                    Set{sortArrow('set_name')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-frost-500 text-xs uppercase tracking-wide">Cond.</th>
                  <th className="px-4 py-3 text-right font-semibold text-frost-500 text-xs uppercase tracking-wide">Qty</th>
                  <th
                    className="px-4 py-3 text-right font-semibold text-frost-500 text-xs uppercase tracking-wide cursor-pointer hover:text-ice-600"
                    onClick={() => handleSort('price_paid')}
                  >
                    Paid{sortArrow('price_paid')}
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold text-frost-500 text-xs uppercase tracking-wide cursor-pointer hover:text-ice-600"
                    onClick={() => handleSort('market_price')}
                  >
                    Market{sortArrow('market_price')}
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-frost-500 text-xs uppercase tracking-wide">P/L</th>
                  <th className="px-4 py-3 text-left font-semibold text-frost-500 text-xs uppercase tracking-wide">Purchased</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-frost-100">
                {filtered.map(card => {
                  const spent = card.price_paid * card.quantity
                  const market = card.market_price != null ? card.market_price * card.quantity : null
                  const pnl = market != null ? market - spent : null

                  return (
                    <tr key={card.id} className="hover:bg-ice-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/cards/${card.id}`}>
                          <div className="w-10 h-14 bg-ice-50 rounded-lg overflow-hidden">
                            {card.image_url ? (
                              <img src={card.image_url} alt={card.name} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full bg-ice-100" />
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/cards/${card.id}`} className="font-semibold text-frost-800 hover:text-ice-600 transition-colors">
                          {card.name}
                        </Link>
                        {card.set_number && (
                          <div className="text-xs text-frost-400">#{card.set_number}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-frost-500">{card.set_name}</td>
                      <td className="px-4 py-3">
                        <ConditionBadge condition={card.condition} />
                      </td>
                      <td className="px-4 py-3 text-right text-frost-600">{card.quantity}</td>
                      <td className="px-4 py-3 text-right text-frost-700 font-medium">${spent.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-frost-700">
                        {market != null ? `$${market.toFixed(2)}` : '—'}
                      </td>
                      <td className={clsx('px-4 py-3 text-right font-bold text-xs',
                        pnl == null ? 'text-frost-400' :
                        pnl >= 0 ? 'text-emerald-600' : 'text-red-500'
                      )}>
                        {pnl == null ? '—' : `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-frost-400 text-xs">
                        {format(new Date(card.date_purchased), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
