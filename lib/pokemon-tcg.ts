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

const SUBTYPE_WORDS = ['VMAX', 'VSTAR', 'VUNION', 'GX', 'EX', 'MEGA', 'BREAK', 'PRIME', 'LEGEND', 'TAG TEAM']

async function fetchCards(q: string, headers: HeadersInit): Promise<TcgCard[]> {
  const res = await fetch(
    `${BASE_URL}/cards?q=${encodeURIComponent(q)}&pageSize=60&orderBy=-set.releaseDate`,
    { headers, cache: 'no-store' }
  )
  if (!res.ok) return []
  const data: TcgSearchResponse = await res.json()
  return data.data ?? []
}

export async function searchCards(query: string, set?: string): Promise<TcgCard[]> {
  const apiKey = process.env.POKEMON_TCG_API_KEY
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-Api-Key'] = apiKey

  const setFilter = set ? ` set.name:"${set}*"` : ''

  // Extract subtype and base name
  let nameQuery = query.trim()
  let detectedSubtype = ''
  for (const sub of SUBTYPE_WORDS) {
    if (new RegExp(`\\b${sub}\\b`, 'i').test(nameQuery)) {
      detectedSubtype = sub
      nameQuery = nameQuery.replace(new RegExp(`\\b${sub}\\b`, 'gi'), '').trim()
      break
    }
  }
  const withoutV = nameQuery.replace(/\bV\b/g, '').trim()
  if (withoutV) nameQuery = withoutV
  if (!nameQuery) nameQuery = query.trim()

  // Run two searches in parallel: one broad, one with subtype filter (if detected)
  // This ensures we never miss a card due to API quirks
  const broadQuery = `name:${nameQuery}*${setFilter}`
  const specificQuery = detectedSubtype
    ? `name:${nameQuery}* subtypes:${detectedSubtype}${setFilter}`
    : null

  const [broadResults, specificResults] = await Promise.all([
    fetchCards(broadQuery, headers),
    specificQuery ? fetchCards(specificQuery, headers) : Promise.resolve([] as TcgCard[]),
  ])

  // Merge, putting specific results first, deduplicating by card id
  const seen = new Set<string>()
  return [...specificResults, ...broadResults].filter(card => {
    if (seen.has(card.id)) return false
    seen.add(card.id)
    return true
  })
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
