import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Resume Analyzer',
  description: 'Created with Vercel',
  generator: 'Vercel.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-gray-200/60 bg-white/40 py-3 text-center text-sm text-gray-600">
          © 2026 Meet Nagadia™
        </footer>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
