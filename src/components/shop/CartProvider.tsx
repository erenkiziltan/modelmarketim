'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CartItem, Product } from '@/types'

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (product: Product, quantity: number, variants: Record<string, string>) => void
  removeItem: (productId: string, variants: Record<string, string>) => void
  updateQuantity: (productId: string, variants: Record<string, string>, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('polyforge-cart')
    if (stored) {
      try { setItems(JSON.parse(stored)) } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('polyforge-cart', JSON.stringify(items))
  }, [items])

  // Body scroll lock when drawer open
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isDrawerOpen])

  const getKey = (productId: string, variants: Record<string, string>) =>
    `${productId}-${JSON.stringify(variants)}`

  const addItem = (product: Product, quantity: number, selectedVariants: Record<string, string>) => {
    setItems(prev => {
      const key = getKey(product.id, selectedVariants)
      const existing = prev.find(i => getKey(i.product.id, i.selectedVariants) === key)
      if (existing) {
        return prev.map(i =>
          getKey(i.product.id, i.selectedVariants) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { product, quantity, selectedVariants }]
    })
    setIsDrawerOpen(true)
  }

  const removeItem = (productId: string, variants: Record<string, string>) => {
    const key = getKey(productId, variants)
    setItems(prev => prev.filter(i => getKey(i.product.id, i.selectedVariants) !== key))
  }

  const updateQuantity = (productId: string, variants: Record<string, string>, quantity: number) => {
    const key = getKey(productId, variants)
    if (quantity <= 0) { removeItem(productId, variants); return }
    setItems(prev => prev.map(i =>
      getKey(i.product.id, i.selectedVariants) === key ? { ...i, quantity } : i
    ))
  }

  const clearCart = () => setItems([])
  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, itemCount, total,
      isDrawerOpen, openDrawer, closeDrawer,
      addItem, removeItem, updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
