import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Scanner not configured' }, { status: 503 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: 'This is a Pokémon Trading Card Game card. Identify the card and respond with ONLY a JSON object in this exact format, no other text:\n{"name":"<card name>","set":"<set name>","number":"<card number>"}\n\nIf you cannot identify the card, respond with:\n{"name":"","set":"","number":""}',
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    // Extract JSON from response
    const jsonMatch = text.match(/\{[^}]+\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not identify card' }, { status: 422 })
    }

    const result = JSON.parse(jsonMatch[0]) as { name: string; set: string; number: string }
    return NextResponse.json(result)
  } catch (err) {
    console.error('scan-card error:', err)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
