import { Account, Liability, ACCOUNT_TYPE_LABELS, LIABILITY_TYPE_LABELS } from '@/types'

export function exportAccountsToCSV(accounts: Account[]): string {
  const headers = ['Name', 'Type', 'Institution', 'Value (USD)', 'Notes', 'Created At']
  const rows = accounts.map(a => [
    csvEscape(a.name),
    csvEscape(ACCOUNT_TYPE_LABELS[a.type as keyof typeof ACCOUNT_TYPE_LABELS] ?? a.type),
    csvEscape(a.institution ?? ''),
    a.usd_value.toString(),
    csvEscape(a.notes ?? ''),
    a.created_at,
  ])
  return [headers, ...rows].map(r => r.join(',')).join('\n')
}

export function exportLiabilitiesToCSV(liabilities: Liability[]): string {
  const headers = ['Name', 'Type', 'Institution', 'Balance (USD)', 'Notes', 'Created At']
  const rows = liabilities.map(l => [
    csvEscape(l.name),
    csvEscape(LIABILITY_TYPE_LABELS[l.type as keyof typeof LIABILITY_TYPE_LABELS] ?? l.type),
    csvEscape(l.institution ?? ''),
    l.usd_balance.toString(),
    csvEscape(l.notes ?? ''),
    l.created_at,
  ])
  return [headers, ...rows].map(r => r.join(',')).join('\n')
}

export function exportSnapshotsToCSV(snapshots: any[]): string {
  const headers = ['Date', 'Net Worth (BTC)', 'Net Worth (USD)', 'Total Assets (USD)', 'Total Liabilities (USD)', 'BTC Price (USD)']
  const rows = snapshots.map(s => [
    s.created_at,
    Number(s.net_worth_btc).toFixed(8),
    Number(s.net_worth_usd).toFixed(2),
    Number(s.total_assets_usd).toFixed(2),
    Number(s.total_liabilities_usd).toFixed(2),
    Number(s.btc_price_usd).toFixed(2),
  ])
  return [headers, ...rows].map(r => r.join(',')).join('\n')
}

export function exportAllToCSV(accounts: Account[], liabilities: Liability[], snapshots: any[]): string {
  return [
    '=== ASSETS ===',
    exportAccountsToCSV(accounts),
    '',
    '=== LIABILITIES ===',
    exportLiabilitiesToCSV(liabilities),
    '',
    '=== NET WORTH HISTORY ===',
    exportSnapshotsToCSV(snapshots),
  ].join('\n')
}

export interface ParsedAccount {
  name: string; type: string; institution: string; usd_value: number; notes: string
}
export interface ParsedLiability {
  name: string; type: string; institution: string; usd_balance: number; notes: string
}
export interface ImportResult {
  accounts: ParsedAccount[]; liabilities: ParsedLiability[]; errors: string[]
}

const ACCOUNT_LABEL_TO_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => [v.toLowerCase(), k])
)
const LIABILITY_LABEL_TO_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(LIABILITY_TYPE_LABELS).map(([k, v]) => [v.toLowerCase(), k])
)

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQuotes = !inQuotes }
    else if (line[i] === ',' && !inQuotes) { result.push(current.trim()); current = '' }
    else { current += line[i] }
  }
  result.push(current.trim())
  return result
}

export function importFromCSV(csv: string): ImportResult {
  const errors: string[] = []
  const accounts: ParsedAccount[] = []
  const liabilities: ParsedLiability[] = []
  const sections = csv.split(/=== .+ ===/).map(s => s.trim()).filter(Boolean)
  const sectionNames = (csv.match(/=== (.+) ===/g) ?? []).map(s => s.replace(/=== | ===/g, '').trim().toLowerCase())

  sectionNames.forEach((name, idx) => {
    const section = sections[idx]
    if (!section) return
    const lines = section.split('\n').filter(l => l.trim()).slice(1)
    if (name === 'assets') {
      lines.forEach((line, i) => {
        const cols = parseCSVLine(line)
        if (cols.length < 4) { errors.push(`Assets row ${i + 2}: not enough columns`); return }
        const usd_value = parseFloat(cols[3])
        if (isNaN(usd_value)) { errors.push(`Assets row ${i + 2}: invalid value`); return }
        accounts.push({ name: cols[0], type: ACCOUNT_LABEL_TO_TYPE[cols[1]?.toLowerCase()] ?? 'other_asset', institution: cols[2] ?? '', usd_value, notes: cols[4] ?? '' })
      })
    }
    if (name === 'liabilities') {
      lines.forEach((line, i) => {
        const cols = parseCSVLine(line)
        if (cols.length < 4) { errors.push(`Liabilities row ${i + 2}: not enough columns`); return }
        const usd_balance = parseFloat(cols[3])
        if (isNaN(usd_balance)) { errors.push(`Liabilities row ${i + 2}: invalid balance`); return }
        liabilities.push({ name: cols[0], type: LIABILITY_LABEL_TO_TYPE[cols[1]?.toLowerCase()] ?? 'other_debt', institution: cols[2] ?? '', usd_balance, notes: cols[4] ?? '' })
      })
    }
  })

  return { accounts, liabilities, errors }
}

function csvEscape(str: string): string {
  if (!str) return ''
  if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`
  return str
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
