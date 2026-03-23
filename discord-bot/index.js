/**
 * OpenClaw — Dewgong Card Vault Discord Bot
 *
 * Commands:
 *   !add <name> "<set>" <condition> <price>   — Add a card to the vault
 *   !list                                      — Show last 5 cards added
 *   !value                                     — Show total portfolio value
 *   !help                                      — Show all commands
 */

require('dotenv').config({ path: '../.env.local' })

const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require('discord.js')
const { createClient } = require('@supabase/supabase-js')

// ─── Config ─────────────────────────────────────────────────────────────────

const DISCORD_TOKEN  = process.env.DISCORD_BOT_TOKEN
const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const TCG_API_KEY    = process.env.POKEMON_TCG_API_KEY

const VALID_CONDITIONS = ['NM', 'LP', 'MP', 'HP', 'DMG']
const CONDITION_LABELS = { NM: 'Near Mint', LP: 'Lightly Played', MP: 'Moderately Played', HP: 'Heavily Played', DMG: 'Damaged' }

// Dewgong icy blue color
const ICE_COLOR = 0x38bdf8

// ─── Clients ─────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

// ─── Pokemon TCG API ─────────────────────────────────────────────────────────

async function findCardImage(name, setName) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (TCG_API_KEY) headers['X-Api-Key'] = TCG_API_KEY

    let query = `name:"${name}"`
    if (setName) query += ` set.name:"${setName}"`

    const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=1`
    const res = await fetch(url, { headers })
    const data = await res.json()

    if (data.data && data.data.length > 0) {
      const card = data.data[0]
      return {
        imageUrl: card.images.large ?? card.images.small ?? null,
        setName: card.set?.name ?? setName,
        setNumber: card.number ?? null,
        rarity: card.rarity ?? null,
      }
    }
  } catch (err) {
    console.error('TCG API error:', err.message)
  }
  return { imageUrl: null, setName, setNumber: null, rarity: null }
}

// ─── Parse !add command ───────────────────────────────────────────────────────
// Format: !add <Name or "Name with spaces"> "<Set>" <CONDITION> <price>
// Examples:
//   !add Charizard "Base Set" NM 45.00
//   !add "Dark Charizard" "Team Rocket" LP 120
//   !add Pikachu Promo NM 5.99

function parseAddCommand(args) {
  // We'll use a regex-based tokenizer that handles quoted strings
  const tokens = []
  const regex = /"([^"]+)"|(\S+)/g
  let match
  while ((match = regex.exec(args)) !== null) {
    tokens.push(match[1] ?? match[2])
  }

  // We expect at least 3 tokens after command: name, condition, price
  // Set name is optional (can be quoted)
  // Strategy: last token = price, second-to-last = condition, rest = name [+ set]
  if (tokens.length < 3) return null

  const price = parseFloat(tokens[tokens.length - 1])
  if (isNaN(price) || price < 0) return null

  const condition = tokens[tokens.length - 2].toUpperCase()
  if (!VALID_CONDITIONS.includes(condition)) return null

  // Remaining tokens form the name (and possibly set if there are 2+)
  const nameTokens = tokens.slice(0, tokens.length - 2)
  if (nameTokens.length === 0) return null

  // Heuristic: if we have 2+ name tokens and the second was quoted (or looks like a set),
  // treat first as card name and second as set.
  // Since quoted strings are already unwrapped, we rely on position.
  let cardName, setName

  if (nameTokens.length >= 2) {
    cardName = nameTokens[0]
    setName = nameTokens.slice(1).join(' ')
  } else {
    cardName = nameTokens[0]
    setName = null
  }

  return { cardName, setName, condition, price }
}

// ─── Command Handlers ─────────────────────────────────────────────────────────

async function handleAdd(message, argsString) {
  const parsed = parseAddCommand(argsString)

  if (!parsed) {
    return message.reply({
      embeds: [errorEmbed(
        'Invalid format',
        'Usage: `!add <name> "<set>" <condition> <price>`\n' +
        'Example: `!add Charizard "Base Set" NM 45.00`\n' +
        `Conditions: ${VALID_CONDITIONS.join(', ')}`
      )]
    })
  }

  const { cardName, setName, condition, price } = parsed

  // Show "thinking" reaction
  await message.react('❄️').catch(() => {})

  // Try to fetch card image from TCG API
  const tcgInfo = await findCardImage(cardName, setName)

  // Insert into Supabase
  const insertData = {
    name: cardName,
    set_name: tcgInfo.setName ?? setName ?? 'Unknown Set',
    set_number: tcgInfo.setNumber ?? null,
    image_url: tcgInfo.imageUrl ?? null,
    condition,
    price_paid: price,
    market_price: null,
    date_purchased: new Date().toISOString().split('T')[0],
    quantity: 1,
    notes: `Added via OpenClaw bot by ${message.author.tag}`,
  }

  const { data, error } = await supabase
    .from('cards')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    return message.reply({
      embeds: [errorEmbed('Database Error', `Could not save card: ${error.message}`)]
    })
  }

  // Build confirmation embed
  const embed = new EmbedBuilder()
    .setColor(ICE_COLOR)
    .setTitle('❄️ Card Added to Vault!')
    .setDescription(`**${cardName}** has been frozen into the Dewgong Card Vault.`)
    .addFields(
      { name: 'Set', value: insertData.set_name, inline: true },
      { name: 'Condition', value: `${condition} — ${CONDITION_LABELS[condition]}`, inline: true },
      { name: 'Price Paid', value: `$${price.toFixed(2)}`, inline: true },
      { name: 'Vault ID', value: data.id, inline: false },
    )
    .setFooter({ text: `Added by ${message.author.tag} · OpenClaw Bot` })
    .setTimestamp()

  if (tcgInfo.rarity) {
    embed.addFields({ name: 'Rarity', value: tcgInfo.rarity, inline: true })
  }

  if (tcgInfo.imageUrl) {
    embed.setThumbnail(tcgInfo.imageUrl)
  }

  await message.reply({ embeds: [embed] })
}

async function handleList(message) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error || !data || data.length === 0) {
    return message.reply({
      embeds: [infoEmbed('Your Vault is Empty', 'No cards found. Add one with `!add`!')]
    })
  }

  const embed = new EmbedBuilder()
    .setColor(ICE_COLOR)
    .setTitle('❄️ Last 5 Cards Added')
    .setDescription('Your most recently vaulted Pokémon cards:')
    .setFooter({ text: 'Dewgong Card Vault · OpenClaw Bot' })
    .setTimestamp()

  data.forEach((card, i) => {
    const pnl = card.market_price != null
      ? `$${(card.market_price - card.price_paid).toFixed(2)}`
      : 'N/A'
    embed.addFields({
      name: `${i + 1}. ${card.name}`,
      value: [
        `**Set:** ${card.set_name}${card.set_number ? ` #${card.set_number}` : ''}`,
        `**Condition:** ${card.condition}  |  **Paid:** $${card.price_paid.toFixed(2)}`,
        `**P/L:** ${pnl}  |  **Date:** ${card.date_purchased}`,
      ].join('\n'),
      inline: false,
    })
  })

  // Use image from first card
  if (data[0].image_url) {
    embed.setThumbnail(data[0].image_url)
  }

  await message.reply({ embeds: [embed] })
}

async function handleValue(message) {
  const { data, error } = await supabase.from('cards').select('*')

  if (error) {
    return message.reply({ embeds: [errorEmbed('Error', 'Could not fetch cards.')] })
  }

  if (!data || data.length === 0) {
    return message.reply({ embeds: [infoEmbed('Empty Vault', 'No cards in the vault yet!')] })
  }

  const totalCards    = data.reduce((s, c) => s + c.quantity, 0)
  const totalSpent    = data.reduce((s, c) => s + c.price_paid * c.quantity, 0)
  const totalMarket   = data.reduce((s, c) => c.market_price != null ? s + c.market_price * c.quantity : s, 0)
  const priced        = data.filter(c => c.market_price != null).length
  const pnl           = totalMarket - totalSpent
  const pnlPct        = totalSpent > 0 ? (pnl / totalSpent * 100).toFixed(1) : '0.0'

  const embed = new EmbedBuilder()
    .setColor(pnl >= 0 ? 0x10b981 : 0xef4444)
    .setTitle('💎 Portfolio Value')
    .setDescription('Current snapshot of the Dewgong Card Vault')
    .addFields(
      { name: 'Total Cards', value: `${totalCards} (${data.length} unique)`, inline: true },
      { name: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, inline: true },
      { name: 'Market Value', value: `$${totalMarket.toFixed(2)} (${priced} priced)`, inline: true },
      {
        name: 'Profit / Loss',
        value: `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnl >= 0 ? '+' : ''}${pnlPct}%)`,
        inline: false
      }
    )
    .setFooter({ text: 'Dewgong Card Vault · OpenClaw Bot' })
    .setTimestamp()

  await message.reply({ embeds: [embed] })
}

async function handleHelp(message) {
  const embed = new EmbedBuilder()
    .setColor(ICE_COLOR)
    .setTitle('🧊 OpenClaw — Dewgong Card Vault Bot')
    .setDescription('Manage your Pokémon card vault right from Discord!')
    .addFields(
      {
        name: '`!add <name> "<set>" <condition> <price>`',
        value: 'Add a card to the vault.\n**Conditions:** NM, LP, MP, HP, DMG\n**Example:** `!add Charizard "Base Set" NM 45.00`',
        inline: false,
      },
      {
        name: '`!list`',
        value: 'Show the last 5 cards added to the vault.',
        inline: false,
      },
      {
        name: '`!value`',
        value: 'Show the total portfolio value, total spent, and P/L.',
        inline: false,
      },
      {
        name: '`!help`',
        value: 'Show this help message.',
        inline: false,
      },
    )
    .setFooter({ text: 'Dewgong Card Vault · OpenClaw Bot' })

  await message.reply({ embeds: [embed] })
}

// ─── Embed helpers ─────────────────────────────────────────────────────────────

function errorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(Colors.Red)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
}

function infoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(ICE_COLOR)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
}

// ─── Event handlers ───────────────────────────────────────────────────────────

discord.once('ready', () => {
  console.log(`\n🧊 OpenClaw is online as ${discord.user.tag}`)
  console.log(`   Vault: ${SUPABASE_URL}`)
  console.log('   Ready to freeze some cards!\n')
  discord.user.setActivity('the Dewgong Card Vault', { type: 3 /* Watching */ })
})

discord.on('messageCreate', async (message) => {
  // Ignore bots and non-prefixed messages
  if (message.author.bot) return
  if (!message.content.startsWith('!')) return

  const [cmd, ...rest] = message.content.trim().split(/\s+/)
  const argsString = message.content.trim().slice(cmd.length).trim()

  try {
    switch (cmd.toLowerCase()) {
      case '!add':
        await handleAdd(message, argsString)
        break
      case '!list':
        await handleList(message)
        break
      case '!value':
        await handleValue(message)
        break
      case '!help':
        await handleHelp(message)
        break
    }
  } catch (err) {
    console.error(`Error handling ${cmd}:`, err)
    await message.reply({ embeds: [errorEmbed('Unexpected Error', err.message)] }).catch(() => {})
  }
})

// ─── Start ────────────────────────────────────────────────────────────────────

if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is not set. Check your .env.local file.')
  process.exit(1)
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase credentials are missing. Check your .env.local file.')
  process.exit(1)
}

discord.login(DISCORD_TOKEN)
