'use client'

import { formatBtc, formatBtcPrice } from '@/lib/utils'

interface Props {
  netWorthUsd: number
  netWorthBtc: number
  btcPrice: number
}

export function BtcInsightCard({ netWorthUsd, netWorthBtc, btcPrice }: Props) {
  // Scenario: BTC 2x
  const btc2x = netWorthUsd / (btcPrice * 2)
  // Scenario: BTC 5x
  const btc5x = netWorthUsd / (btcPrice * 5)
  // Scenario: BTC 10x
  const btc10x = netWorthUsd / (btcPrice * 10)

  // How many sats is the net worth?
  const sats = Math.round(netWorthBtc * 100_000_000)

  return (
    <div className="bg-[#F7931A]/5 border border-[#F7931A]/15 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="text-xl mt-0.5">⚡</div>
        <div className="flex-1">
          <div className="text-xs text-[#F7931A]/70 uppercase tracking-wider font-medium mb-3">
            Bitcoin insight
          </div>

          <p className="text-sm text-white/60 leading-relaxed mb-4">
            Your net worth is{' '}
            <span className="text-white font-mono font-bold">
              {sats.toLocaleString()} sats
            </span>
            . If Bitcoin reaches{' '}
            <span className="text-white/80">{formatBtcPrice(btcPrice * 2)}</span>{' '}
            (2×), your wealth in BTC terms drops to{' '}
            <span className="font-mono text-[#F7931A]/80">{formatBtc(btc2x)}</span>
            {' '}— even if your USD wealth stays flat. That&apos;s why you stack.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'BTC @ 2×', price: btcPrice * 2, btc: btc2x },
              { label: 'BTC @ 5×', price: btcPrice * 5, btc: btc5x },
              { label: 'BTC @ 10×', price: btcPrice * 10, btc: btc10x },
            ].map(s => (
              <div key={s.label} className="bg-black/20 rounded-xl px-3 py-2.5 text-center">
                <div className="text-xs text-white/25 mb-1">{s.label}</div>
                <div className="font-mono text-xs font-bold text-[#F7931A]/70">
                  {formatBtc(s.btc)}
                </div>
                <div className="text-xs text-white/20 mt-0.5">
                  {formatBtcPrice(s.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
