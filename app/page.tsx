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
  Sparkles,
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
      <div className="relative rounded-3xl overflow-hidden shadow-ice-lg" style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 45%, #0ea5e9 100%)' }}>
        {/* Dewgong artwork — right side, large */}
        <div className="absolute -right-2 -bottom-6 w-64 h-64 opacity-35 pointer-events-none select-none">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
        {/* Second Dewgong — left, mirrored */}
        <div className="absolute -left-4 -bottom-4 w-36 h-36 opacity-15 pointer-events-none select-none">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
            alt=""
            className="w-full h-full object-contain scale-x-[-1]"
          />
        </div>
        {/* Third tiny Dewgong — top right corner */}
        <div className="absolute top-3 right-52 w-16 h-16 opacity-10 pointer-events-none select-none hidden sm:block">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png"
            alt=""
            className="w-full h-full object-contain rotate-12"
          />
        </div>

        {/* Floating snowflakes */}
        <div className="absolute top-5 left-1/4 text-white/20 pointer-events-none animate-spin" style={{ animationDuration: '10s' }}>
          <Snowflake className="w-5 h-5" />
        </div>
        <div className="absolute top-8 right-1/3 text-white/15 pointer-events-none animate-spin hidden sm:block" style={{ animationDuration: '14s', animationDirection: 'reverse' }}>
          <Snowflake className="w-7 h-7" />
        </div>
        <div className="absolute bottom-5 left-1/3 text-white/10 pointer-events-none animate-spin hidden sm:block" style={{ animationDuration: '18s' }}>
          <Snowflake className="w-4 h-4" />
        </div>

        {/* Subtle inner glow overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(186,230,253,0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 p-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white/90 text-xs font-bold px-3 py-1 rounded-full border border-white/20 mb-4 uppercase tracking-wider">
            <Snowflake className="w-3 h-3" />
            Ice Type Vault
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">Card Vault</h1>
              <p className="text-ice-200 text-sm">
                {totalCards > 0
                  ? `${totalCards} card${totalCards !== 1 ? 's' : ''} across ${uniqueSets} set${uniqueSets !== 1 ? 's' : ''} in your collection`
                  : 'Your icy card vault awaits. Add your first card!'}
              </p>
            </div>
            <Link
              href="/add"
              className="inline-flex items-center gap-2 bg-white text-ice-800 hover:bg-ice-50 transition-all duration-200 rounded-xl px-5 py-2.5 text-sm font-bold whitespace-nowrap shadow-lg hover:shadow-xl hover:-translate-y-0.5 self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-ice-500" />
              Add Card
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
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
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-frost-700">Top Performers</h2>
          </div>
          <div className="card-surface divide-y divide-frost-100">
            {cardsWithPnl.map((card, i) => (
              <Link
                key={card.id}
                href={`/cards/${card.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-ice-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-ice-50 border border-ice-200 flex items-center justify-center text-xs font-bold text-ice-600 flex-shrink-0">
                  {i + 1}
                </div>
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
                <div className={`text-sm font-bold px-2.5 py-1 rounded-lg ${card.pnl >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
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
          <div className="flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-ice-400" />
            <h2 className="text-lg font-bold text-frost-700">Recently Added</h2>
          </div>
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
