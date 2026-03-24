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

// Special card subtypes that users often type before the Pokémon name
const SUBTYPES = ['VMAX', 'VSTAR', 'GX', 'EX', 'MEGA', 'BREAK', 'PRIME', 'LEGEND']

export async function searchCards(query: string, set?: string): Promise<TcgCard[]> {
  const apiKey = process.env.POKEMON_TCG_API_KEY

  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-Api-Key'] = apiKey

  // Detect if user typed a subtype first e.g. "vmax charizard" → name:charizard* subtypes:VMAX
  let nameQuery = query.trim()
  let subtypeFilter = ''
  for (const sub of SUBTYPES) {
    const regex = new RegExp(`\\b${sub}\\b`, 'i')
    if (regex.test(nameQuery)) {
      subtypeFilter = sub
      nameQuery = nameQuery.replace(regex, '').trim()
      break
    }
  }
  // Handle standalone "V" as a subtype only if it's the whole word and something else is present
  if (!subtypeFilter && /\bV\b/.test(nameQuery) && nameQuery.replace(/\bV\b/, '').trim()) {
    subtypeFilter = 'V'
    nameQuery = nameQuery.replace(/\bV\b/, '').trim()
  }

  let q = `name:${nameQuery}*`
  if (subtypeFilter) q += ` subtypes:${subtypeFilter}`
  if (set) q += ` set.name:"${set}*"`

  const encodedQuery = encodeURIComponent(q)
  const res = await fetch(
    `${BASE_URL}/cards?q=${encodedQuery}&pageSize=36&orderBy=-set.releaseDate`,
    { headers }
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
