'use client';

import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  authenticated: boolean;
  roles: string[];
  username?: string;
}

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  roles: [],
});

export function AuthProvider({ 
  children, 
  session 
}: { 
  children: ReactNode;
  session: AuthContextType;
}) {
  return (
    <AuthContext.Provider value={session}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}