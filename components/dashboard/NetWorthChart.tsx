'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { format, parseISO, subDays, subMonths } from 'date-fns'
import { NetWorthSnapshot } from '@/types'

const PERIODS = [
  { label: '1M',     days: 30 },
  { label: '3M',     days: 90 },
  { label: '6M',     days: 180 },
  { label: '1Y',     days: 365 },
  { label: 'All',    days: 9999 },
  { label: 'Custom', days: 0 },
]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px', padding: '12px 16px', fontSize: '13px',
    }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '4px' }}>
        {d?.created_at ? format(parseISO(d.created_at), 'MMM d, yyyy') : ''}
      </div>
      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#F7931A', fontSize: '15px' }}>
        ₿ {Number(payload[0]?.value ?? 0).toFixed(4)}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '2px' }}>
        @ ${Number(d?.btc_price_usd ?? 0).toLocaleString()} / BTC
      </div>
    </div>
  )
}

interface Props {
  snapshots: NetWorthSnapshot[]
}

export function NetWorthChart({ snapshots }: Props) {
  const [periodIdx, setPeriodIdx] = useState(1)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  useEffect(() => {
    const to = new Date()
    const from = subMonths(to, 6)
    setCustomTo(format(to, 'yyyy-MM-dd'))
    setCustomFrom(format(from, 'yyyy-MM-dd'))
  }, [])

  const getFiltered = useCallback(() => {
    const label = PERIODS[periodIdx].label
    if (label === 'Custom') {
      if (!customFrom || !customTo) return snapshots
      const from = new Date(customFrom)
      const to = new Date(customTo)
      to.setHours(23, 59, 59)
      return snapshots.filter(s => {
        const d = new Date(s.created_at)
        return d >= from && d <= to
      })
    }
    if (label === 'All') return snapshots
    const cutoff = subDays(new Date(), PERIODS[periodIdx].days)
    return snapshots.filter(s => new Date(s.created_at) >= cutoff)
  }, [periodIdx, customFrom, customTo, snapshots])

  const filtered = getFiltered()
  const data = filtered.map(s => ({
    ...s,
    btc: Number(s.net_worth_btc),
    date: format(parseISO(s.created_at), 'MMM d'),
  }))

  const isEmpty = data.length < 2
  const first = data[0]
  const last = data[data.length - 1]
  const change = first && last ? last.btc - first.btc : null
  const changePct = first && last && first.btc > 0
    ? ((last.btc - first.btc) / first.btc) * 100 : null

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Net worth in BTC</span>
          {change !== null && !isEmpty && (
            <span className={`ml-3 text-xs font-mono font-bold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}₿ {change.toFixed(4)}
              {changePct !== null && (
                <span className="ml-1 opacity-60">({changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%)</span>
              )}
            </span>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {PERIODS.map((p, i) => (
            <button key={p.label} onClick={() => { setPeriodIdx(i); setShowCustom(p.label === 'Custom') }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                periodIdx === i
                  ? 'bg-[#F7931A]/15 text-[#F7931A] border border-[#F7931A]/30'
                  : 'text-white/30 hover:text-white/60'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {showCustom && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/30">From</label>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 10px', color: '#f0f0f0', fontSize: '12px', fontFamily: 'monospace', colorScheme: 'dark' }} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/30">To</label>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 10px', color: '#f0f0f0', fontSize: '12px', fontFamily: 'monospace', colorScheme: 'dark' }} />
          </div>
        </div>
      )}

      {isEmpty ? (
        <div className="h-48 flex flex-col items-center justify-center text-white/20 text-sm gap-2">
          <span className="text-3xl">📈</span>
          <span>No data for this period</span>
          <span className="text-xs">Snapshots save each time you update your holdings</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F7931A" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F7931A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₿${v.toFixed(2)}`} width={68} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="btc" stroke="#F7931A" strokeWidth={2} fill="url(#btcGrad)" dot={false} activeDot={{ r: 5, fill: '#F7931A', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
