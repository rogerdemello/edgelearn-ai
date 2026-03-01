import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Mono, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['600', '700', '800'],
  display: 'swap',
});
const spaceMono = Space_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'EdgeLearn AI - Master Skills at the Edge',
  description: 'AI-powered learning platform for mastering any skill with personalized practice and real-time feedback',
  generator: 'v0.app',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${plusJakarta.variable} ${outfit.variable} ${spaceMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
