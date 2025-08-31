import { NextResponse } from 'next/server';
import { getSessionServer } from '@/lib/authServer';

export async function GET() {
  const session = await getSessionServer();
  
  return NextResponse.json({
    authenticated: session.authenticated,
    roles: session.roles,
    username: session.username,
    token: session.token,
  });
}