import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import type { CardRow } from '@/types/database'
import { CardDetailClient } from './CardDetailClient'

export const revalidate = 0

async function getCard(id: string): Promise<CardRow | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null
  return data as CardRow
}

export default async function CardDetailPage({ params }: { params: { id: string } }) {
  const card = await getCard(params.id)
  if (!card) notFound()

  return <CardDetailClient card={card} />
}
