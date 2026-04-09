export type AccountType =
  | 'retirement_401k'
  | 'retirement_ira'
  | 'retirement_roth_ira'
  | 'brokerage'
  | 'real_estate'
  | 'precious_metals'
  | 'crypto'
  | 'cash_savings'
  | 'business'
  | 'other_asset'

export type LiabilityType =
  | 'mortgage'
  | 'student_loan'
  | 'credit_card'
  | 'auto_loan'
  | 'personal_loan'
  | 'other_debt'

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  institution: string | null
  usd_value: number
  notes: string | null
  is_manual: boolean
  created_at: string
  updated_at: string
}

export interface Liability {
  id: string
  user_id: string
  name: string
  type: LiabilityType
  institution: string | null
  usd_balance: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface NetWorthSnapshot {
  id: string
  user_id: string
  total_assets_usd: number
  total_liabilities_usd: number
  net_worth_usd: number
  net_worth_btc: number
  btc_price_usd: number
  created_at: string
}

export interface BtcPrice {
  price: number
  updated_at: string
}

export interface NetWorthSummary {
  totalAssetsUsd: number
  totalLiabilitiesUsd: number
  netWorthUsd: number
  netWorthBtc: number
  btcPrice: number
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  retirement_401k: '401(k)',
  retirement_ira: 'Traditional IRA',
  retirement_roth_ira: 'Roth IRA',
  brokerage: 'Brokerage',
  real_estate: 'Real Estate',
  precious_metals: 'Precious Metals',
  crypto: 'Crypto (non-BTC)',
  cash_savings: 'Cash / Savings',
  business: 'Business Equity',
  other_asset: 'Other Asset',
}

export const LIABILITY_TYPE_LABELS: Record<LiabilityType, string> = {
  mortgage: 'Mortgage',
  student_loan: 'Student Loan',
  credit_card: 'Credit Card',
  auto_loan: 'Auto Loan',
  personal_loan: 'Personal Loan',
  other_debt: 'Other Debt',
}

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  retirement_401k: '🏛',
  retirement_ira: '🏛',
  retirement_roth_ira: '🏛',
  brokerage: '📈',
  real_estate: '🏠',
  precious_metals: '🥇',
  crypto: '🔗',
  cash_savings: '💵',
  business: '🏢',
  other_asset: '◈',
}

export const LIABILITY_TYPE_ICONS: Record<LiabilityType, string> = {
  mortgage: '🏦',
  student_loan: '📚',
  credit_card: '💳',
  auto_loan: '🚗',
  personal_loan: '📝',
  other_debt: '◈',
}
