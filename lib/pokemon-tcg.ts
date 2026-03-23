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

export async function searchCards(query: string, set?: string): Promise<TcgCard[]> {
  const apiKey = process.env.POKEMON_TCG_API_KEY

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (apiKey) {
    headers['X-Api-Key'] = apiKey
  }

  let q = `name:${query}*`
  if (set) q += ` set.name:"${set}*"`

  const encodedQuery = encodeURIComponent(q)
  const res = await fetch(
    `${BASE_URL}/cards?q=${encodedQuery}&pageSize=20&orderBy=name`,
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
