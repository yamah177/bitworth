import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MEM_CACHE_TTL = 60_000
const DB_CACHE_TTL  = 90_000
const CURRENCIES = ['usd','eur','gbp','jpy','cad','aud','chf','cny','inr','mxn','brl','sgd']

let memCache: { prices: Record<string, number>; ts: number } | null = null

async function fetchFromCoinGecko(): Promise<Record<string, number> | null> {
  try {
    const key = process.env.COINGECKO_API_KEY
    const vs = CURRENCIES.join(',')
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${vs}`
    const res = await fetch(url, {
      headers: key ? { 'x-cg-demo-api-key': key } : {},
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.bitcoin) return null
    return data.bitcoin
  } catch {
    return null
  }
}

export async function GET() {
  if (memCache && Date.now() - memCache.ts < MEM_CACHE_TTL) {
    return NextResponse.json({ prices: memCache.prices, source: 'memory' })
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
    const freshPrices = await fetchFromCoinGecko()
    if (freshPrices) {
      await supabase
        .from('btc_price_cache')
        .upsert({ id: 1, price_usd: freshPrices.usd, updated_at: new Date().toISOString() })
      memCache = { prices: freshPrices, ts: Date.now() }
      return NextResponse.json({ prices: freshPrices, source: 'coingecko' })
    }
  }

  if (cached && Number(cached.price_usd) > 0) {
    const prices = { usd: Number(cached.price_usd) }
    memCache = { prices, ts: Date.now() }
    return NextResponse.json({ prices, source: 'db' })
  }

  const lastChance = await fetchFromCoinGecko()
  if (lastChance) {
    await supabase
      .from('btc_price_cache')
      .upsert({ id: 1, price_usd: lastChance.usd, updated_at: new Date().toISOString() })
    memCache = { prices: lastChance, ts: Date.now() }
    return NextResponse.json({ prices: lastChance, source: 'coingecko-fallback' })
  }

  return NextResponse.json({ error: 'Unable to fetch BTC price' }, { status: 503 })
}
