import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_CURRENCIES = ['usd','eur','gbp','jpy','cad','aud','chf','cny','inr','mxn','brl','sgd']

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('user_preferences')
    .select('currency')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ currency: data?.currency ?? 'usd' })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currency } = await req.json()
  if (!VALID_CURRENCIES.includes(currency)) {
    return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
  }

  await supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, currency, updated_at: new Date().toISOString() })

  return NextResponse.json({ currency })
}
