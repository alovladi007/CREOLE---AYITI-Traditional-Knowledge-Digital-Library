'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type AuthCtx = { token: string|null, setToken: (t: string|null)=>void }
const Ctx = createContext<AuthCtx>({ token: null, setToken: ()=>{} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string|null>(null)
  useEffect(()=>{
    // Not used with http-only cookies, but keeping for compatibility
  },[])
  return <Ctx.Provider value={{ token, setToken }}>{children}</Ctx.Provider>
}

export function useAuth(){ return useContext(Ctx) }