'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Account, Liability, NetWorthSnapshot } from '@/types'
import { usdToBtc } from '@/lib/utils'
import { CurrencyCode } from '@/lib/currencies'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { NetWorthHero } from '@/components/dashboard/NetWorthHero'
import { NetWorthChart } from '@/components/dashboard/NetWorthChart'
import { AssetsList } from '@/components/dashboard/AssetsList'
import { LiabilitiesList } from '@/components/dashboard/LiabilitiesList'
import { AllocationBreakdown } from '@/components/dashboard/AllocationBreakdown'
import { BtcInsightCard } from '@/components/dashboard/BtcInsightCard'
import { BtcPercentileCard } from '@/components/dashboard/BtcPercentileCard'

interface Props { userEmail: string }

const BTC_POLL_INTERVAL = 60_000

export function DashboardClient({ userEmail }: Props) {
  const [btcPrices, setBtcPrices] = useState<Record<string, number>>({ usd: 0 })
  const [currency, setCurrency] = useState<CurrencyCode>('usd')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const snapshotSavedRef = useRef(false)

  const btcPrice = btcPrices[currency] ?? btcPrices['usd'] ?? 0
  const usdPrice = btcPrices['usd'] ?? 0

  const fetchBtcPrice = useCallback(async () => {
    try {
      const res = await fetch('/api/btc-price')
      const data = await res.json()
      if (data.prices) setBtcPrices(data.prices)
    } catch {}
  }, [])

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch('/api/preferences')
      const data = await res.json()
      if (data.currency) setCurrency(data.currency as CurrencyCode)
    } catch {}
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [acctRes, liabRes, snapRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/liabilities'),
        fetch('/api/snapshots?days=365'),
      ])
      const [accts, liabs, snaps] = await Promise.all([
        acctRes.json(), liabRes.json(), snapRes.json(),
      ])
      if (Array.isArray(accts)) setAccounts(accts)
      if (Array.isArray(liabs)) setLiabilities(liabs)
      if (Array.isArray(snaps)) setSnapshots(snaps)
    } catch {}
  }, [])

  const saveSnapshot = useCallback(async (accts: Account[], liabs: Liability[], price: number) => {
    if (snapshotSavedRef.current || price === 0) return
    snapshotSavedRef.current = true
    const totalAssetsUsd = accts.reduce((s, a) => s + a.usd_value, 0)
    const totalLiabilitiesUsd = liabs.reduce((s, l) => s + l.usd_balance, 0)
    const netWorthUsd = totalAssetsUsd - totalLiabilitiesUsd
    if (totalAssetsUsd === 0 && totalLiabilitiesUsd === 0) return
    await fetch('/api/snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        total_assets_usd: totalAssetsUsd,
        total_liabilities_usd: totalLiabilitiesUsd,
        net_worth_usd: netWorthUsd,
        net_worth_btc: usdToBtc(netWorthUsd, price),
        btc_price_usd: price,
      }),
    })
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([fetchBtcPrice(), fetchData(), fetchPreferences()])
      setLoading(false)
    }
    init()
  }, [fetchBtcPrice, fetchData, fetchPreferences])

  useEffect(() => {
    if (!loading && usdPrice > 0 && (accounts.length > 0 || liabilities.length > 0)) {
      saveSnapshot(accounts, liabilities, usdPrice)
    }
  }, [loading, accounts, liabilities, usdPrice, saveSnapshot])

  useEffect(() => {
    const interval = setInterval(fetchBtcPrice, BTC_POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchBtcPrice])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    snapshotSavedRef.current = false
    await Promise.all([fetchBtcPrice(), fetchData()])
    setRefreshing(false)
  }, [fetchBtcPrice, fetchData])

  const totalAssetsUsd = accounts.reduce((s, a) => s + a.usd_value, 0)
  const totalLiabilitiesUsd = liabilities.reduce((s, l) => s + l.usd_balance, 0)
  const netWorthUsd = totalAssetsUsd - totalLiabilitiesUsd
  const netWorthBtc = usdToBtc(netWorthUsd, usdPrice)
  const isEmpty = accounts.length === 0 && liabilities.length === 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-[#F7931A] flex items-center justify-center font-mono font-bold text-black mx-auto mb-4 animate-pulse">₿</div>
          <div className="text-white/30 text-sm">Loading your wealth...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DashboardNav
        userEmail={userEmail}
        btcPrice={btcPrice}
        currency={currency}
        onCurrencyChange={setCurrency}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onImported={handleRefresh}
      />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4 animate-fade-in">
        {isEmpty && (
          <div className="bg-[#F7931A]/5 border border-[#F7931A]/15 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">₿</div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome to Satsworth</h2>
            <p className="text-white/40 text-sm max-w-sm mx-auto">
              Add your first asset below to start tracking your net worth in Bitcoin.
            </p>
          </div>
        )}
        <NetWorthHero
          netWorthBtc={netWorthBtc} netWorthUsd={netWorthUsd}
          totalAssetsUsd={totalAssetsUsd} totalLiabilitiesUsd={totalLiabilitiesUsd}
          btcPrice={btcPrice} currency={currency} snapshots={snapshots}
        />
        <NetWorthChart snapshots={snapshots} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AssetsList accounts={accounts} btcPrice={usdPrice} currency={currency} onRefresh={handleRefresh} />
          </div>
          <div className="space-y-4">
            <AllocationBreakdown accounts={accounts} btcPrice={usdPrice} />
          </div>
        </div>
        <LiabilitiesList liabilities={liabilities} btcPrice={usdPrice} currency={currency} onRefresh={handleRefresh} />
        {!isEmpty && <BtcInsightCard netWorthUsd={netWorthUsd} netWorthBtc={netWorthBtc} btcPrice={usdPrice} />}
        {!isEmpty && <BtcPercentileCard key={netWorthBtc.toFixed(4)} netWorthBtc={netWorthBtc} />}
        <div className="pb-6" />
      </main>
    </div>
  )
}

