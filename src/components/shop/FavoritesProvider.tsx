'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface FavoritesContextType {
  favorites: string[]
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('modelmarketim-favorites')
    if (stored) try { setFavorites(JSON.parse(stored)) } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('modelmarketim-favorites', JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    )
  }

  const isFavorite = (productId: string) => favorites.includes(productId)

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider')
  return ctx
}
