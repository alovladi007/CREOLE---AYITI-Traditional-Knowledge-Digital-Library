import type { Metadata } from 'next';
import { getSessionServer } from '@/lib/authServer';

export const metadata: Metadata = {
  title: 'CREOLE - Center for Research in Ethnoscience, Orality, Language & Education',
  description: 'Traditional Knowledge Documentation and Protection Platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionServer();
  const isAdmin = session.roles.includes('admin');

  return (
    <html lang="en">
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f5f5f5;
            color: #333;
          }
          .toolbar {
            background: #2c3e50;
            color: white;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .toolbar h1 {
            font-size: 1.5rem;
            font-weight: 600;
          }
          .nav-links {
            display: flex;
            gap: 2rem;
            align-items: center;
          }
          .nav-links a {
            color: white;
            text-decoration: none;
            transition: opacity 0.2s;
          }
          .nav-links a:hover {
            opacity: 0.8;
          }
          .auth-button {
            background: #3498db;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: background 0.2s;
          }
          .auth-button:hover {
            background: #2980b9;
          }
          .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 2rem;
          }
        `}</style>
      </head>
      <body>
        <div className="toolbar">
          <h1>CREOLE</h1>
          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="/intake">Intake</a>
            {isAdmin && (
              <>
                <a href="/dashboard/requests">Admin Inbox</a>
                <a href="/admin/contracts">Contracts</a>
              </>
            )}
            <div style={{ marginLeft: 'auto' }}>
              {session.authenticated ? (
                <>
                  <span style={{ marginRight: '1rem' }}>
                    {session.username}
                  </span>
                  <a href="/api/auth/logout" className="auth-button">
                    Sign out
                  </a>
                </>
              ) : (
                <a href="/api/auth/login" className="auth-button">
                  Sign in
                </a>
              )}
            </div>
          </nav>
        </div>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}