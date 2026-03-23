import { supabase } from '@/lib/supabase'

export const revalidate = 0
import { CardListClient } from './CardListClient'
import type { CardRow } from '@/types/database'

async function getAllCards(): Promise<CardRow[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return (data as CardRow[]) ?? []
}

export default async function CardsPage() {
  const cards = await getAllCards()
  return <CardListClient initialCards={cards} />
}
