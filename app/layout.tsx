import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'SMVS Seva Management System',
  description: 'Digital platform for seva distribution and tracking — SMVS Swaminarayan Sanstha',
}

export const viewport: Viewport = {
  themeColor: '#8B1A1A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#2C1810',
              color: '#FFD700',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '13px',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
