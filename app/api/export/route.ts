import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exportAccountsToCSV, exportLiabilitiesToCSV, exportSnapshotsToCSV, exportAllToCSV } from '@/lib/csvUtils'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'all'
  const date = new Date().toISOString().slice(0, 10)

  const [{ data: accounts }, { data: liabilities }, { data: snapshots }] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', user.id).order('usd_value', { ascending: false }),
    supabase.from('liabilities').select('*').eq('user_id', user.id).order('usd_balance', { ascending: false }),
    supabase.from('net_worth_snapshots').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
  ])

  let csv = ''
  let filename = ''

  if (type === 'assets') {
    csv = exportAccountsToCSV((accounts ?? []) as any)
    filename = `satsworth-assets-${date}.csv`
  } else if (type === 'liabilities') {
    csv = exportLiabilitiesToCSV((liabilities ?? []) as any)
    filename = `satsworth-liabilities-${date}.csv`
  } else if (type === 'snapshots') {
    csv = exportSnapshotsToCSV(snapshots ?? [])
    filename = `satsworth-history-${date}.csv`
  } else {
    csv = exportAllToCSV((accounts ?? []) as any, (liabilities ?? []) as any, snapshots ?? [])
    filename = `satsworth-export-${date}.csv`
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
