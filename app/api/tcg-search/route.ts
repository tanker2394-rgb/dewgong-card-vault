import { NextResponse } from 'next/server'
import { searchCards } from '@/lib/pokemon-tcg'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const set   = searchParams.get('set')

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 })
  }

  try {
    const cards = await searchCards(query.trim(), set?.trim() || undefined)
    return NextResponse.json(cards)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
