import { supabase } from '@/lib/supabase'

export const revalidate = 0
import { notFound } from 'next/navigation'
import type { CardRow } from '@/types/database'
import { CardDetailClient } from './CardDetailClient'

async function getCard(id: string): Promise<CardRow | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as CardRow
}

export default async function CardDetailPage({ params }: { params: { id: string } }) {
  const card = await getCard(params.id)
  if (!card) notFound()

  return <CardDetailClient card={card} />
}
