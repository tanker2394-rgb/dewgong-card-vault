const BASE_URL = 'https://api.pokemontcg.io/v2'

export interface TcgCard {
  id: string
  name: string
  number: string
  set: {
    id: string
    name: string
    series: string
    printedTotal: number
    total: number
    releaseDate: string
    images: {
      symbol: string
      logo: string
    }
  }
  images: {
    small: string
    large: string
  }
  rarity?: string
  artist?: string
  cardmarket?: {
    prices?: {
      averageSellPrice?: number
      lowPrice?: number
      trendPrice?: number
    }
  }
  tcgplayer?: {
    prices?: {
      normal?: { market?: number; low?: number; mid?: number; high?: number }
      holofoil?: { market?: number; low?: number; mid?: number; high?: number }
      reverseHolofoil?: { market?: number }
    }
  }
}

export interface TcgSearchResponse {
  data: TcgCard[]
  page: number
  pageSize: number
  count: number
  totalCount: number
}

// Subtype words to strip from the query so we search by Pokémon name only
const SUBTYPE_WORDS = ['VMAX', 'VSTAR', 'VUNION', 'GX', 'EX', 'MEGA', 'BREAK', 'PRIME', 'LEGEND', 'TAG TEAM']

export async function searchCards(query: string, set?: string): Promise<TcgCard[]> {
  const apiKey = process.env.POKEMON_TCG_API_KEY

  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-Api-Key'] = apiKey

  // Strip subtype words to get a clean Pokémon name for the API search
  // e.g. "vmax charizard" → "charizard", "deoxys vmax" → "deoxys"
  // Then rely on client-side sort (by price) to surface the right variant
  let nameQuery = query.trim()
  for (const sub of SUBTYPE_WORDS) {
    nameQuery = nameQuery.replace(new RegExp(`\\b${sub}\\b`, 'gi'), '').trim()
  }
  // Also strip standalone "V" only when other words remain
  const withoutV = nameQuery.replace(/\bV\b/g, '').trim()
  if (withoutV) nameQuery = withoutV

  if (!nameQuery) nameQuery = query.trim() // fallback: nothing was strippable

  let q = `name:${nameQuery}*`
  if (set) q += ` set.name:"${set}*"`

  const res = await fetch(
    `${BASE_URL}/cards?q=${encodeURIComponent(q)}&pageSize=100&orderBy=-set.releaseDate`,
    { headers, cache: 'no-store' }
  )

  if (!res.ok) {
    throw new Error(`Pokemon TCG API error: ${res.status}`)
  }

  const data: TcgSearchResponse = await res.json()
  return data.data
}

export async function getCardById(id: string): Promise<TcgCard> {
  const apiKey = process.env.POKEMON_TCG_API_KEY

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (apiKey) {
    headers['X-Api-Key'] = apiKey
  }

  const res = await fetch(`${BASE_URL}/cards/${id}`, { headers })

  if (!res.ok) {
    throw new Error(`Pokemon TCG API error: ${res.status}`)
  }

  const data = await res.json()
  return data.data
}
