import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Cache in memory for 60s to avoid hammering DB on every request
let memCache: { price: number; ts: number } | null = null
const MEM_CACHE_TTL = 60_000 // 60 seconds
const DB_CACHE_TTL = 90_000  // refresh DB cache every 90 seconds

async function fetchFromCoinGecko(): Promise<number | null> {
  try {
    const key = process.env.COINGECKO_API_KEY
    const url = key
      ? `https://pro-api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
      : `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`

    const res = await fetch(url, {
      headers: key ? { 'x-cg-demo-api-key': key } : {},
      next: { revalidate: 60 },
    })

    if (!res.ok) return null
    const data = await res.json()
    return data?.bitcoin?.usd ?? null
  } catch {
    return null
  }
}

export async function GET() {
  // 1. Serve from memory cache if fresh
  if (memCache && Date.now() - memCache.ts < MEM_CACHE_TTL) {
    return NextResponse.json({ price: memCache.price, source: 'memory' })
  }

  const supabase = await createClient()

  // 2. Try to read from DB cache
  const { data: cached } = await supabase
    .from('btc_price_cache')
    .select('price_usd, updated_at')
    .eq('id', 1)
    .single()

  const dbAge = cached
    ? Date.now() - new Date(cached.updated_at).getTime()
    : Infinity

  // 3. If DB cache is stale, fetch fresh from CoinGecko
  if (dbAge > DB_CACHE_TTL) {
    const freshPrice = await fetchFromCoinGecko()
    if (freshPrice) {
      await supabase
        .from('btc_price_cache')
        .upsert({ id: 1, price_usd: freshPrice, updated_at: new Date().toISOString() })

      memCache = { price: freshPrice, ts: Date.now() }
      return NextResponse.json({ price: freshPrice, source: 'coingecko' })
    }
  }

  // 4. Serve from DB cache (even if slightly stale, beats nothing)
  if (cached) {
    const price = Number(cached.price_usd)
    memCache = { price, ts: Date.now() }
    return NextResponse.json({ price, source: 'db' })
  }

  // 5. Fallback
  return NextResponse.json({ price: 98000, source: 'fallback' })
}
