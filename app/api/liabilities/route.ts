import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('liabilities')
    .select('*')
    .eq('user_id', user.id)
    .order('usd_balance', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, type, institution, usd_balance, notes } = body

  if (!name || !type || usd_balance === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (isNaN(Number(usd_balance)) || Number(usd_balance) < 0) {
    return NextResponse.json({ error: 'Invalid balance' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('liabilities')
    .insert({
      user_id: user.id,
      name: name.trim(),
      type,
      institution: institution?.trim() || null,
      usd_balance: Number(usd_balance),
      notes: notes?.trim() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
