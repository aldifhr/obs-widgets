import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OBS Widgets',
  description: 'Pixel tipjar & social widgets for OBS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-studio-950 text-white font-body antialiased">{children}</body>
    </html>
  )
}
