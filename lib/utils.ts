export function formatBtc(btc: number, decimals = 4): string {
  return `₿ ${btc.toFixed(decimals)}`
}

export function formatUsd(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(usd)
}

export function formatUsdFull(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd)
}

export function usdToBtc(usd: number, btcPrice: number): number {
  if (btcPrice === 0) return 0
  return usd / btcPrice
}

export function btcToUsd(btc: number, btcPrice: number): number {
  return btc * btcPrice
}

export function formatBtcPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatBtcChange(btc: number): string {
  return `${btc >= 0 ? '+' : ''}₿ ${Math.abs(btc).toFixed(4)}`
}

export function calcNetWorth(
  totalAssetsUsd: number,
  totalLiabilitiesUsd: number,
  btcPrice: number
) {
  const netWorthUsd = totalAssetsUsd - totalLiabilitiesUsd
  const netWorthBtc = usdToBtc(netWorthUsd, btcPrice)
  return { netWorthUsd, netWorthBtc }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
