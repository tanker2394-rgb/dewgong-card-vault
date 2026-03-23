import { createClient } from '@/lib/supabase-server'
import { CardListClient } from './CardListClient'
import type { CardRow } from '@/types/database'

export const revalidate = 0

async function getAllCards(): Promise<CardRow[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data as CardRow[]) ?? []
}

export default async function CardsPage() {
  const cards = await getAllCards()
  return <CardListClient initialCards={cards} />
}
