export const SUPPORTED_CURRENCIES = [
  { code: 'usd', symbol: '$',   name: 'US Dollar',        flag: '🇺🇸' },
  { code: 'eur', symbol: '€',   name: 'Euro',              flag: '🇪🇺' },
  { code: 'gbp', symbol: '£',   name: 'British Pound',     flag: '🇬🇧' },
  { code: 'jpy', symbol: '¥',   name: 'Japanese Yen',      flag: '🇯🇵' },
  { code: 'cad', symbol: 'CA$', name: 'Canadian Dollar',   flag: '🇨🇦' },
  { code: 'aud', symbol: 'A$',  name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'chf', symbol: 'Fr',  name: 'Swiss Franc',       flag: '🇨🇭' },
  { code: 'cny', symbol: '¥',   name: 'Chinese Yuan',      flag: '🇨🇳' },
  { code: 'inr', symbol: '₹',   name: 'Indian Rupee',      flag: '🇮🇳' },
  { code: 'mxn', symbol: 'MX$', name: 'Mexican Peso',      flag: '🇲🇽' },
  { code: 'brl', symbol: 'R$',  name: 'Brazilian Real',    flag: '🇧🇷' },
  { code: 'sgd', symbol: 'S$',  name: 'Singapore Dollar',  flag: '🇸🇬' },
] as const

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code']

export function getCurrency(code: string) {
  return SUPPORTED_CURRENCIES.find(c => c.code === code) ?? SUPPORTED_CURRENCIES[0]
}

export function formatFiat(amount: number, currencyCode: string): string {
  const code = currencyCode.toUpperCase()
  const noDecimals = ['jpy', 'krw'].includes(currencyCode.toLowerCase())
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
