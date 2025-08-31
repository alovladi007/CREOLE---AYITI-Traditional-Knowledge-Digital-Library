'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ClientToolbar() {
  return (
    <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8, padding: '0 16px'}}>
      <Link href="/">Home</Link>
      <Link href="/intake">Intake</Link>
      <Link href="/requests/new">New Request</Link>
      <RoleGate role="admin"><Link href="/dashboard/requests">Admin Inbox</Link></RoleGate>
      <RoleGate role="admin"><Link href="/admin/contracts">Contracts</Link></RoleGate>
      <div style={{marginLeft:'auto'}}><AuthButtons/></div>
    </div>
  )
}

function RoleGate({ role, children }: { role: string, children: any }){
  const [roles, setRoles] = useState<string[]>([])
  useEffect(()=>{
    fetch('/api/auth/session').then(r=>r.json()).then(s=> setRoles(s.roles||[]))
  },[])
  if (!roles.includes(role)) return null
  return children
}

function AuthButtons(){
  const [session, setSession] = useState<any>(null)
  useEffect(()=>{
    fetch('/api/auth/session').then(r=>r.json()).then(setSession)
  },[])
  if (!session?.authenticated) return <a href="/api/auth/login">Sign in</a>
  return <a href="/api/auth/logout">Sign out</a>
}