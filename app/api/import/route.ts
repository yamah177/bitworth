import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { importFromCSV } from '@/lib/csvUtils'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { csv } = await req.json()
  if (!csv) return NextResponse.json({ error: 'No CSV provided' }, { status: 400 })

  const { accounts, liabilities, errors } = importFromCSV(csv)

  await Promise.allSettled([
    accounts.length > 0 ? supabase.from('accounts').insert(
      accounts.map(a => ({ user_id: user.id, name: a.name, type: a.type, institution: a.institution || null, usd_value: a.usd_value, notes: a.notes || null, is_manual: true }))
    ) : Promise.resolve(),
    liabilities.length > 0 ? supabase.from('liabilities').insert(
      liabilities.map(l => ({ user_id: user.id, name: l.name, type: l.type, institution: l.institution || null, usd_balance: l.usd_balance, notes: l.notes || null }))
    ) : Promise.resolve(),
  ])

  return NextResponse.json({ imported: { accounts: accounts.length, liabilities: liabilities.length }, errors })
}
