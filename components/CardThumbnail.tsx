'use client'

import Image from 'next/image'
import Link from 'next/link'
import { clsx } from 'clsx'
import type { CardRow } from '@/types/database'
import { ConditionBadge } from './ConditionBadge'
import { ImageOff } from 'lucide-react'

interface Props {
  card: CardRow
  className?: string
}

export function CardThumbnail({ card, className }: Props) {
  const pl = card.price_paid * card.quantity
  const mv = card.market_price != null ? card.market_price * card.quantity : null
  const pnl = mv != null ? mv - pl : null

  return (
    <Link
      href={`/cards/${card.id}`}
      className={clsx('card-surface-hover block overflow-hidden group', className)}
    >
      {/* Card image */}
      <div className="relative aspect-[2.5/3.5] bg-ice-gradient overflow-hidden">
        {card.image_url ? (
          <Image
            src={card.image_url}
            alt={card.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ice-300">
            <ImageOff className="w-10 h-10" />
            <span className="text-xs">No image</span>
          </div>
        )}
        {/* Qty badge */}
        {card.quantity > 1 && (
          <div className="absolute top-2 right-2 bg-ice-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            ×{card.quantity}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div className="font-semibold text-frost-800 text-sm truncate">{card.name}</div>
        <div className="text-xs text-frost-400 truncate">{card.set_name}</div>
        <div className="flex items-center justify-between">
          <ConditionBadge condition={card.condition} />
          <span className="text-xs text-frost-500">#{card.set_number ?? '—'}</span>
        </div>

        {/* Price row */}
        <div className="pt-1 border-t border-frost-100 flex items-center justify-between">
          <span className="text-xs text-frost-400">Paid</span>
          <span className="text-xs font-semibold text-frost-700">${pl.toFixed(2)}</span>
        </div>
        {pnl != null && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-frost-400">P/L</span>
            <span className={clsx('text-xs font-bold', pnl >= 0 ? 'text-emerald-600' : 'text-red-500')}>
              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
