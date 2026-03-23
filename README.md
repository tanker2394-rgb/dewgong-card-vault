# 🧊 Dewgong Card Vault

A Pokémon TCG card portfolio tracker with an icy Dewgong aesthetic — track your collection, monitor value, and manage cards via Discord.

## Stack

- **Frontend/API:** Next.js 14 (App Router) + TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS — icy blues & frost whites
- **Card Data:** Pokémon TCG API (`api.pokemontcg.io`)
- **Discord Bot:** discord.js v14 (OpenClaw bot)

---

## Features

| Feature | Description |
|---|---|
| Card Lookup | Search the Pokémon TCG API by name, auto-fill image, set, and number |
| Track Details | Condition (NM/LP/MP/HP/DMG), price paid, TCGPlayer market price, date, quantity, notes |
| Dashboard | Total cards, total spent, market value, profit/loss |
| Collection View | Grid or list view, filterable by condition/set, sortable by any column |
| Card Detail | Full card page with edit and delete |
| Discord Bot | `!add`, `!list`, `!value`, `!help` commands |

---

## Setup

### 1. Clone & install

```bash
# Install Next.js dependencies
npm install

# Install Discord bot dependencies
cd discord-bot && npm install && cd ..
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your keys (see `.env.example` for descriptions).

### 3. Create the Supabase database

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:

```sql
-- Copy and paste contents of:
supabase/migrations/001_create_cards_table.sql
```

3. Copy your **Project URL** and **anon key** from Settings → API into `.env.local`

### 4. Get a Pokémon TCG API key (optional but recommended)

Register at [dev.pokemontcg.io](https://dev.pokemontcg.io) for a free API key. Without it, you get 1,000 requests/day.

### 5. Run the web app

```bash
npm run dev
# → http://localhost:3000
```

### 6. Set up the Discord bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Create a new Application → Bot
3. Enable **Message Content Intent** under Bot → Privileged Gateway Intents
4. Copy the bot token into `.env.local` as `DISCORD_BOT_TOKEN`
5. Invite the bot to your server with these permissions: `Send Messages`, `Read Message History`, `Add Reactions`, `Embed Links`
6. Start the bot:

```bash
cd discord-bot
npm start
```

---

## Discord Bot Commands

| Command | Example | Description |
|---|---|---|
| `!add` | `!add Charizard "Base Set" NM 45.00` | Add a card to the vault |
| `!list` | `!list` | Show last 5 cards added |
| `!value` | `!value` | Show total portfolio value & P/L |
| `!help` | `!help` | Show all commands |

### `!add` format

```
!add <CardName> "<Set Name>" <CONDITION> <price>
```

- Card name: single word or quoted for multi-word
- Set name: quote it if it has spaces (recommended)
- Condition: `NM`, `LP`, `MP`, `HP`, or `DMG`
- Price: decimal number e.g. `45.00`

---

## Project Structure

```
dewgong-card-vault/
├── app/
│   ├── layout.tsx          # Root layout + Navbar
│   ├── page.tsx            # Dashboard
│   ├── add/
│   │   ├── page.tsx
│   │   └── AddCardForm.tsx # TCG API search + form
│   ├── cards/
│   │   ├── page.tsx
│   │   ├── CardListClient.tsx  # Filterable/sortable list
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── CardDetailClient.tsx  # Detail + edit + delete
│   └── api/
│       ├── cards/route.ts          # GET, POST
│       ├── cards/[id]/route.ts     # GET, PATCH, DELETE
│       └── tcg-search/route.ts     # Proxy to TCG API
├── components/
│   ├── Navbar.tsx
│   ├── CardThumbnail.tsx
│   ├── StatCard.tsx
│   ├── ConditionBadge.tsx
│   ├── EmptyState.tsx
│   └── LoadingSpinner.tsx
├── lib/
│   ├── supabase.ts
│   └── pokemon-tcg.ts
├── types/
│   └── database.ts
├── supabase/
│   └── migrations/001_create_cards_table.sql
└── discord-bot/
    ├── index.js            # OpenClaw bot
    └── package.json
```
