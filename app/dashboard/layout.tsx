import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — Bitworth',
  description: 'Your net worth in Bitcoin',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
