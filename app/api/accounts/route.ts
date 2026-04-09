import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('usd_value', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, type, institution, usd_value, notes } = body

  if (!name || !type || usd_value === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (isNaN(Number(usd_value)) || Number(usd_value) < 0) {
    return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('accounts')
    .insert({
      user_id: user.id,
      name: name.trim(),
      type,
      institution: institution?.trim() || null,
      usd_value: Number(usd_value),
      notes: notes?.trim() || null,
      is_manual: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
