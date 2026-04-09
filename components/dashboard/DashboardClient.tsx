'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Account, Liability, NetWorthSnapshot } from '@/types'
import { usdToBtc } from '@/lib/utils'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { NetWorthHero } from '@/components/dashboard/NetWorthHero'
import { NetWorthChart } from '@/components/dashboard/NetWorthChart'
import { AssetsList } from '@/components/dashboard/AssetsList'
import { LiabilitiesList } from '@/components/dashboard/LiabilitiesList'
import { AllocationBreakdown } from '@/components/dashboard/AllocationBreakdown'
import { BtcInsightCard } from '@/components/dashboard/BtcInsightCard'

interface Props {
  userEmail: string
}

const BTC_POLL_INTERVAL = 60_000 // refresh BTC price every 60s

export function DashboardClient({ userEmail }: Props) {
  const [btcPrice, setBtcPrice] = useState(98000)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const snapshotSavedRef = useRef(false)

  // ── Fetch BTC price ─────────────────────────────────────
  const fetchBtcPrice = useCallback(async () => {
    try {
      const res = await fetch('/api/btc-price')
      const data = await res.json()
      if (data.price) setBtcPrice(data.price)
    } catch {}
  }, [])

  // ── Fetch user data ──────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [acctRes, liabRes, snapRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/liabilities'),
        fetch('/api/snapshots?days=365'),
      ])
      const [accts, liabs, snaps] = await Promise.all([
        acctRes.json(),
        liabRes.json(),
        snapRes.json(),
      ])
      if (Array.isArray(accts)) setAccounts(accts)
      if (Array.isArray(liabs)) setLiabilities(liabs)
      if (Array.isArray(snaps)) setSnapshots(snaps)
    } catch {}
  }, [])

  // ── Save daily snapshot ──────────────────────────────────
  // Saves once per session (not once per day — for demo purposes saves on
  // every first load so the chart populates. In production you'd gate this
  // server-side to once per day per user.)
  const saveSnapshot = useCallback(async (
    accts: Account[],
    liabs: Liability[],
    price: number
  ) => {
    if (snapshotSavedRef.current) return
    snapshotSavedRef.current = true

    const totalAssetsUsd = accts.reduce((s, a) => s + a.usd_value, 0)
    const totalLiabilitiesUsd = liabs.reduce((s, l) => s + l.usd_balance, 0)
    const netWorthUsd = totalAssetsUsd - totalLiabilitiesUsd
    const netWorthBtc = usdToBtc(netWorthUsd, price)

    if (totalAssetsUsd === 0 && totalLiabilitiesUsd === 0) return

    await fetch('/api/snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        total_assets_usd: totalAssetsUsd,
        total_liabilities_usd: totalLiabilitiesUsd,
        net_worth_usd: netWorthUsd,
        net_worth_btc: netWorthBtc,
        btc_price_usd: price,
      }),
    })
  }, [])

  // ── Initial load ─────────────────────────────────────────
  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([fetchBtcPrice(), fetchData()])
      setLoading(false)
    }
    init()
  }, [fetchBtcPrice, fetchData])

  // ── Auto-save snapshot after data loads ─────────────────
  useEffect(() => {
    if (!loading && (accounts.length > 0 || liabilities.length > 0)) {
      saveSnapshot(accounts, liabilities, btcPrice)
    }
  }, [loading, accounts, liabilities, btcPrice, saveSnapshot])

  // ── Poll BTC price ───────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(fetchBtcPrice, BTC_POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchBtcPrice])

  // ── Manual refresh ───────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    snapshotSavedRef.current = false
    await Promise.all([fetchBtcPrice(), fetchData()])
    setRefreshing(false)
  }, [fetchBtcPrice, fetchData])

  // ── Derived totals ───────────────────────────────────────
  const totalAssetsUsd = accounts.reduce((s, a) => s + a.usd_value, 0)
  const totalLiabilitiesUsd = liabilities.reduce((s, l) => s + l.usd_balance, 0)
  const netWorthUsd = totalAssetsUsd - totalLiabilitiesUsd
  const netWorthBtc = usdToBtc(netWorthUsd, btcPrice)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-[#F7931A] flex items-center justify-center font-mono font-bold text-black mx-auto mb-4 animate-pulse">
            ₿
          </div>
          <div className="text-white/30 text-sm">Loading your wealth...</div>
        </div>
      </div>
    )
  }

  const isEmpty = accounts.length === 0 && liabilities.length === 0

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DashboardNav
        userEmail={userEmail}
        btcPrice={btcPrice}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4 animate-fade-in">

        {/* Empty state */}
        {isEmpty && (
          <div className="bg-[#F7931A]/5 border border-[#F7931A]/15 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">₿</div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome to Bitworth</h2>
            <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">
              Add your first asset below to start tracking your net worth in Bitcoin.
              Every account, property, and liability gets converted to BTC in real time.
            </p>
          </div>
        )}

        {/* Hero net worth */}
        <NetWorthHero
          netWorthBtc={netWorthBtc}
          netWorthUsd={netWorthUsd}
          totalAssetsUsd={totalAssetsUsd}
          totalLiabilitiesUsd={totalLiabilitiesUsd}
          btcPrice={btcPrice}
          snapshots={snapshots}
        />

        {/* Chart */}
        <NetWorthChart snapshots={snapshots} />

        {/* Assets + Allocation side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AssetsList
              accounts={accounts}
              btcPrice={btcPrice}
              onRefresh={handleRefresh}
            />
          </div>
          <div className="space-y-4">
            <AllocationBreakdown accounts={accounts} btcPrice={btcPrice} />
          </div>
        </div>

        {/* Liabilities */}
        <LiabilitiesList
          liabilities={liabilities}
          btcPrice={btcPrice}
          onRefresh={handleRefresh}
        />

        {/* BTC insight */}
        {!isEmpty && (
          <BtcInsightCard
            netWorthUsd={netWorthUsd}
            netWorthBtc={netWorthBtc}
            btcPrice={btcPrice}
          />
        )}

        {/* BTC price on mobile (repeated at bottom for convenience) */}
        <div className="sm:hidden flex items-center justify-center gap-2 py-2 text-xs font-mono text-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F7931A]/50 inline-block"></span>
          1 BTC = ${Math.round(btcPrice).toLocaleString()}
        </div>

        <div className="pb-6" />
      </main>
    </div>
  )
}
