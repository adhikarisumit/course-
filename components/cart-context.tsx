"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { Product } from "@/lib/products"

type CartItem = {
  id: string
  title: string
  price: number
  qty: number
  image?: string
}

type CartContextValue = {
  items: CartItem[]
  addItem: (p: Product, qty?: number) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function parsePrice(price: string) {
  if (!price) return 0
  const n = Number(price.replace(/[^0-9.-]+/g, ""))
  return Number.isFinite(n) ? n : 0
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart:v1")
      if (raw) setItems(JSON.parse(raw))
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("cart:v1", JSON.stringify(items))
    } catch (e) {}
  }, [items])

  const addItem = (p: Product, qty = 1) => {
    setItems((cur) => {
      const existing = cur.find((c) => c.id === p.id)
      if (existing) {
        return cur.map((c) => (c.id === p.id ? { ...c, qty: c.qty + qty } : c))
      }
      return [
        ...cur,
        {
          id: p.id,
          title: p.title,
          price: parsePrice(p.price),
          qty,
          image: p.images?.[0] ?? p.url,
        },
      ]
    })
  }

  const removeItem = (id: string) => setItems((cur) => cur.filter((c) => c.id !== id))

  const updateQty = (id: string, qty: number) =>
    setItems((cur) => cur.map((c) => (c.id === id ? { ...c, qty: Math.max(1, qty) } : c)))

  const clear = () => setItems([])

  const total = items.reduce((s, it) => s + it.price * it.qty, 0)
  const count = items.reduce((s, it) => s + it.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

export default CartProvider
