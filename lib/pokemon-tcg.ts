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
  const url = `${BASE_URL}/cards?q=${encodeURIComponent(q)}&pageSize=60&orderBy=-set.releaseDate`
  const res = await fetch(url, { headers, cache: 'no-store' })
  if (!res.ok) {
    console.error(`Pokemon TCG API error ${res.status} for query: ${q}`)
    return []
  }
  const data: TcgSearchResponse = await res.json()
  return data.data ?? []
}

export async function searchCards(query: string, set?: string): Promise<TcgCard[]> {
  const apiKey = process.env.POKEMON_TCG_API_KEY
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-Api-Key'] = apiKey

  const setFilter = set ? ` set.name:"${set}*"` : ''
  let baseName = query.trim()
  let detectedSubtype = ''

  for (const sub of SUBTYPE_WORDS) {
    if (new RegExp(`\\b${sub}\\b`, 'i').test(baseName)) {
      detectedSubtype = sub
      baseName = baseName.replace(new RegExp(`\\b${sub}\\b`, 'gi'), '').trim()
      break
    }
  }
  // Strip standalone "V" (e.g. "Pikachu V" → "Pikachu" so wildcard catches all variants)
  const strippedV = baseName.replace(/\bV\b/g, '').trim()
  if (strippedV) baseName = strippedV
  if (!baseName) baseName = query.trim()

  if (detectedSubtype) {
    // Subtype detected (e.g. "Deoxys VMAX"): run two targeted searches in parallel
    const [specificResults, broadResults] = await Promise.all([
      fetchCards(`name:${baseName}* subtypes:${detectedSubtype}${setFilter}`, headers),
      fetchCards(`name:${baseName}*${setFilter}`, headers),
    ])
    const seen = new Set<string>()
    return [...specificResults, ...broadResults].filter(card => {
      if (seen.has(card.id)) return false
      seen.add(card.id)
      return true
    })
  }

  // Simple query (e.g. "Lucario"): one call
  return fetchCards(`name:${baseName}*${setFilter}`, headers)
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
