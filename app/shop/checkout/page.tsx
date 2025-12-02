"use client"

import React, { useState } from 'react'
import { useCart } from '@/components/cart-context'
import { Button } from '@/components/ui/button'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const [copied, setCopied] = useState(false)
  const paypayId = 'aatit'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paypayId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      // ignore
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <div>
          <Button variant="outline" size="sm" asChild>
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-2 mb-6">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between">
                <div>{it.title} × {it.qty}</div>
                <div className="font-medium">${(it.price * it.qty).toFixed(2)}</div>
              </li>
            ))}
          </ul>

          <div className="mb-6">
            <div className="text-lg">Total: <span className="font-semibold">${total.toFixed(2)}</span></div>
          </div>

          <div className="p-4 border rounded-md bg-muted/30">
            <h2 className="font-medium mb-2">Pay with PayPay</h2>
            <p className="mb-2">Send payment to PayPay ID:</p>
            <div className="flex items-center gap-3">
              <div className="font-semibold text-lg">{paypayId}</div>
              <Button size="sm" onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">After payment, please email the receipt to <strong>you@example.com</strong> (or contact via the app).</p>
          </div>

          <div className="mt-6 flex gap-2">
            <Button variant="destructive" onClick={() => { clear() }}>Clear cart</Button>
          </div>
        </>
      )}
    </main>
  )
}
