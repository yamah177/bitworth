import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MEM_CACHE_TTL = 60_000
const DB_CACHE_TTL  = 90_000

let memCache: { price: number; ts: number } | null = null

async function fetchFromCoinGecko(): Promise<number | null> {
  try {
    const key = process.env.COINGECKO_API_KEY
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
    const res = await fetch(url, {
      headers: key ? { 'x-cg-demo-api-key': key } : {},
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data?.bitcoin?.usd === 'number' ? data.bitcoin.usd : null
  } catch {
    return null
  }
}

export async function GET() {
  if (memCache && Date.now() - memCache.ts < MEM_CACHE_TTL) {
    return NextResponse.json({ price: memCache.price, source: 'memory' })
  }

  const supabase = await createClient()

  const { data: cached } = await supabase
    .from('btc_price_cache')
    .select('price_usd, updated_at')
    .eq('id', 1)
    .single()

  const dbAge = cached
    ? Date.now() - new Date(cached.updated_at).getTime()
    : Infinity

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

  if (cached && Number(cached.price_usd) > 0) {
    const price = Number(cached.price_usd)
    memCache = { price, ts: Date.now() }
    return NextResponse.json({ price, source: 'db' })
  }

  const lastChance = await fetchFromCoinGecko()
  if (lastChance) {
    await supabase
      .from('btc_price_cache')
      .upsert({ id: 1, price_usd: lastChance, updated_at: new Date().toISOString() })
    memCache = { price: lastChance, ts: Date.now() }
    return NextResponse.json({ price: lastChance, source: 'coingecko-fallback' })
  }

  return NextResponse.json({ error: 'Unable to fetch BTC price' }, { status: 503 })
}
