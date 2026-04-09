import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Satsworth — Net Worth in Bitcoin',
  description: 'Track your net worth denominated in Bitcoin. See your wealth in hard money terms.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Satsworth',
    description: 'Track your net worth in Bitcoin',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
