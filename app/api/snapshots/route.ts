import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(Number(searchParams.get('days') ?? 365), 1095) // max 3 years

  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .select('net_worth_btc, net_worth_usd, btc_price_usd, created_at')
    .eq('user_id', user.id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { total_assets_usd, total_liabilities_usd, net_worth_usd, net_worth_btc, btc_price_usd } = body

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .insert({
      user_id: user.id,
      total_assets_usd: Number(total_assets_usd),
      total_liabilities_usd: Number(total_liabilities_usd),
      net_worth_usd: Number(net_worth_usd),
      net_worth_btc: Number(net_worth_btc),
      btc_price_usd: Number(btc_price_usd),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
