import { createClient } from '@/lib/supabase-server'

export const revalidate = 0
import { StatCard } from '@/components/StatCard'
import { CardThumbnail } from '@/components/CardThumbnail'
import { EmptyState } from '@/components/EmptyState'
import Link from 'next/link'
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  ArrowRight,
  Snowflake,
} from 'lucide-react'
import type { CardRow } from '@/types/database'

async function getPortfolioData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { cards: [] as CardRow[], error: null }

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { cards: [] as CardRow[], error: error.message }
  return { cards: (data as CardRow[]) ?? [], error: null }
}

export default async function DashboardPage() {
  const { cards, error } = await getPortfolioData()

  const totalCards = cards.reduce((s, c) => s + c.quantity, 0)
  const totalSpent = cards.reduce((s, c) => s + c.price_paid * c.quantity, 0)
  const totalMarket = cards.reduce((s, c) => {
    if (c.market_price == null) return s
    return s + c.market_price * c.quantity
  }, 0)
  const pnl = totalMarket - totalSpent
  const pnlPercent = totalSpent > 0 ? (pnl / totalSpent) * 100 : 0
  const uniqueSets = new Set(cards.map(c => c.set_name)).size

  const recentCards = cards.slice(0, 6)

  // Top gainers (highest positive P&L)
  const cardsWithPnl = cards
    .filter(c => c.market_price != null)
    .map(c => ({
      ...c,
      pnl: (c.market_price! - c.price_paid) * c.quantity,
    }))
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="relative rounded-3xl overflow-hidden bg-dewgong-header p-8 text-white shadow-ice-lg">
        {/* Dewgong artwork — right side */}
        <div className="absolute -right-4 -bottom-4 w-52 h-52 opacity-25 pointer-events-none select-none">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
        {/* Second smaller Dewgong left side */}
        <div className="absolute -left-6 top-2 w-28 h-28 opacity-10 pointer-events-none select-none rotate-12">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
            alt=""
            className="w-full h-full object-contain scale-x-[-1]"
          />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Dewgong Card Vault</h1>
            <p className="text-ice-200 text-sm">
              {totalCards > 0
                ? `${totalCards} card${totalCards !== 1 ? 's' : ''} across ${uniqueSets} set${uniqueSets !== 1 ? 's' : ''} in your collection`
                : 'Your icy card vault awaits. Add your first card!'}
            </p>
          </div>
          <Link href="/add" className="flex items-center gap-2 bg-white text-ice-700 hover:bg-ice-50 transition-colors rounded-xl px-5 py-2.5 text-sm font-bold whitespace-nowrap shadow-md">
            + Add Card
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          Failed to load collection: {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Cards"
          value={totalCards.toLocaleString()}
          icon={CreditCard}
          color="blue"
          sub={`${cards.length} unique`}
          trend="neutral"
        />
        <StatCard
          label="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          label="Market Value"
          value={`$${totalMarket.toFixed(2)}`}
          icon={Package}
          color="blue"
        />
        <StatCard
          label="Profit / Loss"
          value={`${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`}
          sub={`${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(1)}%`}
          icon={pnl >= 0 ? TrendingUp : TrendingDown}
          color={pnl >= 0 ? 'green' : 'red'}
          trend={pnl >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Top gainers */}
      {cardsWithPnl.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-frost-700 mb-4">Top Performers</h2>
          <div className="card-surface divide-y divide-frost-100">
            {cardsWithPnl.map(card => (
              <Link
                key={card.id}
                href={`/cards/${card.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-ice-50 transition-colors"
              >
                <div className="w-10 h-14 relative flex-shrink-0 bg-ice-50 rounded-lg overflow-hidden">
                  {card.image_url ? (
                    <img src={card.image_url} alt={card.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ice-300">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-frost-800 truncate">{card.name}</div>
                  <div className="text-xs text-frost-400">{card.set_name}</div>
                </div>
                <div className={`text-sm font-bold ${card.pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {card.pnl >= 0 ? '+' : ''}${card.pnl.toFixed(2)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent additions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-frost-700">Recently Added</h2>
          {cards.length > 6 && (
            <Link href="/cards" className="text-ice-500 hover:text-ice-700 text-sm font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {cards.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentCards.map(card => (
              <CardThumbnail key={card.id} card={card} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
