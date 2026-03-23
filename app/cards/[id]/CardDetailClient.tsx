'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import {
  ArrowLeft, Edit3, Trash2, Save, X, Loader2,
  ImageOff, DollarSign, Calendar, Tag, Hash, StickyNote, Package
} from 'lucide-react'
import type { CardRow, Condition, CardInsert } from '@/types/database'
import { ConditionBadge, CONDITIONS, CONDITION_LABELS } from '@/components/ConditionBadge'

interface Props {
  card: CardRow
}

export function CardDetailClient({ card: initial }: Props) {
  const router = useRouter()
  const [card, setCard] = useState<CardRow>(initial)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Edit form state mirrors the card
  const [editForm, setEditForm] = useState({
    name: card.name,
    set_name: card.set_name,
    set_number: card.set_number ?? '',
    image_url: card.image_url ?? '',
    condition: card.condition as Condition,
    price_paid: card.price_paid.toString(),
    market_price: card.market_price?.toString() ?? '',
    date_purchased: card.date_purchased,
    quantity: card.quantity.toString(),
    notes: card.notes ?? '',
  })

  const spent = card.price_paid * card.quantity
  const market = card.market_price != null ? card.market_price * card.quantity : null
  const pnl = market != null ? market - spent : null
  const pnlPct = spent > 0 && pnl != null ? (pnl / spent) * 100 : null

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const payload: Partial<CardInsert> = {
      name: editForm.name.trim(),
      set_name: editForm.set_name.trim(),
      set_number: editForm.set_number.trim() || null,
      image_url: editForm.image_url.trim() || null,
      condition: editForm.condition,
      price_paid: parseFloat(editForm.price_paid),
      market_price: editForm.market_price ? parseFloat(editForm.market_price) : null,
      date_purchased: editForm.date_purchased,
      quantity: parseInt(editForm.quantity, 10),
      notes: editForm.notes.trim() || null,
    }

    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg)
      }

      const updated = await res.json()
      setCard(updated)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.push('/cards')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
      setDeleting(false)
    }
  }

  const ef = (k: keyof typeof editForm) => ({
    value: editForm[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setEditForm(prev => ({ ...prev, [k]: e.target.value })),
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back + actions bar */}
      <div className="flex items-center justify-between">
        <Link href="/cards" className="flex items-center gap-1.5 text-frost-500 hover:text-ice-600 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Collection
        </Link>
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-ice-200 text-ice-600 hover:bg-ice-50 text-sm font-medium transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setEditing(false); setError(null) }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-frost-200 text-frost-500 hover:bg-frost-50 text-sm font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="ice-button flex items-center gap-2 text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-red-700">Delete "{card.name}"?</p>
            <p className="text-sm text-red-500">This cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(false)} className="ice-button-outline text-sm">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-colors disabled:opacity-50"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Card image column */}
        <div className="space-y-4">
          <div className="card-surface overflow-hidden aspect-[2.5/3.5] relative bg-ice-gradient">
            {(editing ? editForm.image_url : card.image_url) ? (
              <Image
                src={editing ? editForm.image_url : card.image_url!}
                alt={card.name}
                fill
                className="object-contain p-3"
                sizes="280px"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-ice-300 gap-2">
                <ImageOff className="w-12 h-12" />
                <span className="text-sm">No image</span>
              </div>
            )}
          </div>

          {/* P&L card */}
          <div className="card-surface p-4 space-y-3">
            <h3 className="text-xs font-bold text-frost-500 uppercase tracking-wide">Value Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-frost-400">Paid (×{card.quantity})</span>
                <span className="font-semibold text-frost-700">${spent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-frost-400">Market (×{card.quantity})</span>
                <span className="font-semibold text-frost-700">{market != null ? `$${market.toFixed(2)}` : '—'}</span>
              </div>
              {pnl != null && (
                <div className={clsx('flex justify-between text-sm font-bold border-t border-frost-100 pt-2',
                  pnl >= 0 ? 'text-emerald-600' : 'text-red-500'
                )}>
                  <span>Profit / Loss</span>
                  <span>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    {pnlPct != null && <span className="text-xs ml-1 opacity-70">({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)</span>}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details column */}
        <div className="card-surface p-6">
          {!editing ? (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-frost-800">{card.name}</h1>
                <p className="text-frost-400 mt-0.5">{card.set_name}{card.set_number ? ` · #${card.set_number}` : ''}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <ConditionBadge condition={card.condition} showFull />
                {card.quantity > 1 && (
                  <span className="condition-badge bg-ice-100 text-ice-700">×{card.quantity} copies</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={DollarSign} label="Price Paid" value={`$${card.price_paid.toFixed(2)} per card`} />
                <InfoRow icon={DollarSign} label="Market Price" value={card.market_price != null ? `$${card.market_price.toFixed(2)} per card` : 'Not set'} />
                <InfoRow icon={Calendar} label="Purchased" value={format(new Date(card.date_purchased), 'MMMM d, yyyy')} />
                <InfoRow icon={Package} label="Quantity" value={`${card.quantity} card${card.quantity !== 1 ? 's' : ''}`} />
                {card.set_number && <InfoRow icon={Hash} label="Set Number" value={card.set_number} />}
              </div>

              {card.notes && (
                <div className="bg-ice-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-frost-500 uppercase tracking-wide mb-2">
                    <StickyNote className="w-3.5 h-3.5" />
                    Notes / Grade
                  </div>
                  <p className="text-frost-700 text-sm whitespace-pre-wrap">{card.notes}</p>
                </div>
              )}

              <div className="text-xs text-frost-300 pt-2 border-t border-frost-100">
                Added {format(new Date(card.created_at), 'PPpp')}
              </div>
            </div>
          ) : (
            /* Edit form */
            <div className="space-y-4">
              <h2 className="font-semibold text-frost-700">Edit Card</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="edit-label">Card Name</label>
                  <input type="text" className="ice-input" required {...ef('name')} />
                </div>
                <div>
                  <label className="edit-label">Set Name</label>
                  <input type="text" className="ice-input" required {...ef('set_name')} />
                </div>
                <div>
                  <label className="edit-label">Set Number</label>
                  <input type="text" className="ice-input" {...ef('set_number')} />
                </div>
                <div>
                  <label className="edit-label">Condition</label>
                  <select className="ice-select" {...ef('condition')}>
                    {CONDITIONS.map(c => (
                      <option key={c} value={c}>{c} — {CONDITION_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="edit-label">Quantity</label>
                  <input type="number" min="1" className="ice-input" {...ef('quantity')} />
                </div>
                <div>
                  <label className="edit-label">Price Paid ($)</label>
                  <input type="number" step="0.01" min="0" className="ice-input" {...ef('price_paid')} />
                </div>
                <div>
                  <label className="edit-label">Market Price ($)</label>
                  <input type="number" step="0.01" min="0" placeholder="Optional" className="ice-input" {...ef('market_price')} />
                </div>
                <div>
                  <label className="edit-label">Date Purchased</label>
                  <input type="date" className="ice-input" {...ef('date_purchased')} />
                </div>
                <div>
                  <label className="edit-label">Image URL</label>
                  <input type="url" className="ice-input" placeholder="https://…" {...ef('image_url')} />
                </div>
                <div className="sm:col-span-2">
                  <label className="edit-label">Notes / Grade</label>
                  <textarea rows={3} className="ice-input resize-none" {...ef('notes')} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .edit-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.375rem;
        }
      `}</style>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-ice-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-ice-500" />
      </div>
      <div>
        <div className="text-xs font-semibold text-frost-400 uppercase tracking-wide">{label}</div>
        <div className="text-sm font-medium text-frost-700 mt-0.5">{value}</div>
      </div>
    </div>
  )
}
