import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guest Mode — Satsworth',
  description: 'Track your net worth in Bitcoin — no account required',
}

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
