'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { NetWorthSnapshot } from '@/types'

interface Props {
  snapshots: NetWorthSnapshot[]
}

const PERIODS = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'All', days: 9999 },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm shadow-xl">
      <div className="text-white/40 text-xs mb-1">
        {d?.created_at ? format(parseISO(d.created_at), 'MMM d, yyyy') : label}
      </div>
      <div className="font-mono font-bold text-[#F7931A] text-base">
        ₿ {Number(payload[0]?.value ?? 0).toFixed(4)}
      </div>
      <div className="text-white/40 text-xs mt-0.5">
        @ ${Number(d?.btc_price_usd ?? 0).toLocaleString()} / BTC
      </div>
    </div>
  )
}

export function NetWorthChart({ snapshots }: Props) {
  const [period, setPeriod] = useState(1)

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - PERIODS[period].days)

  const filtered = snapshots.filter(s =>
    PERIODS[period].days === 9999 || new Date(s.created_at) >= cutoff
  )

  const data = filtered.map(s => ({
    ...s,
    btc: Number(s.net_worth_btc),
    date: format(parseISO(s.created_at), 'MMM d'),
  }))

  const isEmpty = data.length < 2

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs text-white/40 uppercase tracking-wider font-medium">
          Net worth in BTC
        </span>
        <div className="flex gap-1">
          {PERIODS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPeriod(i)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                period === i
                  ? 'bg-[#F7931A]/15 text-[#F7931A] border border-[#F7931A]/30'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="h-48 flex flex-col items-center justify-center text-white/20 text-sm gap-2">
          <span className="text-3xl">📈</span>
          <span>Your history builds as you track over time</span>
          <span className="text-xs">Snapshots are saved whenever you update your holdings</span>
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
            <XAxis
              dataKey="date"
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `₿${v.toFixed(2)}`}
              width={68}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="btc"
              stroke="#F7931A"
              strokeWidth={2}
              fill="url(#btcGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#F7931A', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
