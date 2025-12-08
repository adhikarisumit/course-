"use client"

import React from 'react'
import Link from 'next/link'
import { useCart } from '@/components/cart-context'
import { Button } from '@/components/ui/button'

export default function CartPage() {
  const { items, removeItem, updateQty, total, clear } = useCart()

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-semibold">Your Cart</h1>
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">Your cart is empty. <Link href="/shop" className="text-primary underline">Browse products</Link></p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {items.map((it) => (
              <li key={it.id} className="p-4 border rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  {it.image && <img src={it.image} alt={it.title} className="w-20 h-16 sm:w-24 sm:h-16 object-cover rounded" />}
                  <div>
                    <div className="font-medium">{it.title}</div>
                    <div className="text-sm text-muted-foreground">¥{it.price.toFixed(2)} each</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                  <input
                    type="number"
                    min={1}
                    value={it.qty}
                    onChange={(e) => updateQty(it.id, Number(e.target.value) || 1)}
                    className="w-full sm:w-16 p-1 border rounded"
                  />
                  <div className="text-right font-medium">¥{(it.price * it.qty).toFixed(2)}</div>
                  <div className="w-full sm:w-auto">
                    <Button variant="destructive" size="sm" className="w-full" onClick={() => removeItem(it.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-lg font-semibold">Total: ¥{total.toFixed(2)}</div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/shop">Continue shopping</Link>
              </Button>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/shop/checkout">Proceed to checkout</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
