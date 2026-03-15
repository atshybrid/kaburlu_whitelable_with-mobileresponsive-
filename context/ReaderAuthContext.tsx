'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

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
  const [user, setUser] = useState<ReaderUser | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('reader_user')
      return raw ? (JSON.parse(raw) as ReaderUser) : null
    } catch {
      return null
    }
  })
  const [jwt, setJwt] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem('reader_jwt')
    } catch {
      return null
    }
  })

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
