'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface ReaderUser {
  userId: string
  email: string
  displayName: string
  photoUrl?: string | null
}

interface ReaderAuthState {
  user: ReaderUser | null
  jwt: string | null
  googleClientId: string | null
  login: (jwt: string, user: ReaderUser) => void
  logout: () => void
}

const ReaderAuthContext = createContext<ReaderAuthState>({
  user: null,
  jwt: null,
  googleClientId: null,
  login: () => {},
  logout: () => {},
})

export function ReaderAuthProvider({
  children,
  googleClientId = null,
}: {
  children: ReactNode
  googleClientId?: string | null
}) {
  const [user, setUser] = useState<ReaderUser | null>(null)
  const [jwt, setJwt] = useState<string | null>(null)

  // Restore session from localStorage on first mount
  useEffect(() => {
    try {
      const storedJwt = localStorage.getItem('reader_jwt')
      const storedUser = localStorage.getItem('reader_user')
      if (storedJwt && storedUser) {
        setJwt(storedJwt)
        setUser(JSON.parse(storedUser) as ReaderUser)
      }
    } catch {
      // ignore parse/storage errors
    }
  }, [])

  function login(token: string, userData: ReaderUser) {
    try {
      localStorage.setItem('reader_jwt', token)
      localStorage.setItem('reader_user', JSON.stringify(userData))
    } catch { /* storage blocked */ }
    setJwt(token)
    setUser(userData)
  }

  function logout() {
    try {
      localStorage.removeItem('reader_jwt')
      localStorage.removeItem('reader_user')
    } catch { /* ignore */ }
    setJwt(null)
    setUser(null)
  }

  return (
    <ReaderAuthContext.Provider value={{ user, jwt, googleClientId, login, logout }}>
      {children}
    </ReaderAuthContext.Provider>
  )
}

export const useReaderAuth = () => useContext(ReaderAuthContext)
