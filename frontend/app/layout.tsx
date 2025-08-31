import Link from 'next/link'
import ClientToolbar from './ClientToolbar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <header style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
          <strong>CREOLE</strong> — Center for Research in Ethnoscience, Orality, Language & Education
        </header>
        <ClientToolbar />
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  )
}