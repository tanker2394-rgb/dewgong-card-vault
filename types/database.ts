export type Condition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'

export interface CardRow {
  id: string
  user_id: string
  name: string
  set_name: string
  set_number: string | null
  image_url: string | null
  condition: Condition
  price_paid: number
  market_price: number | null
  date_purchased: string
  quantity: number
  notes: string | null
  created_at: string
}

export interface CardInsert {
  user_id?: string
  name: string
  set_name: string
  set_number?: string | null
  image_url?: string | null
  condition: Condition
  price_paid: number
  market_price?: number | null
  date_purchased: string
  quantity: number
  notes?: string | null
}

export interface Database {
  public: {
    Tables: {
      cards: {
        Row: CardRow
        Insert: CardInsert
        Update: Partial<CardInsert>
      }
    }
  }
}
