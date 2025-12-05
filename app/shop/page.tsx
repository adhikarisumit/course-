"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { products, type Product } from '@/lib/products'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart-context'
import { useRouter } from 'next/navigation'

function ProductCard({ p }: { p: Product }) {
  const { addItem } = useCart()
  const router = useRouter()
  const imgs = p.images && p.images.length > 0 ? p.images : ['/shop/n2-pack.svg']
  const [selected, setSelected] = useState(0)

  return (
    <li key={p.id} className="p-3 border rounded-md flex flex-col justify-between h-full">
      <div>
        <div className="w-full h-32 mb-2 flex items-center justify-center bg-muted/10 rounded-md overflow-hidden">
          <img src={imgs[selected]} alt={p.title} className="max-h-full max-w-full object-contain" />
        </div>

        {imgs.length > 1 && (
          <div className="flex gap-2 mb-2">
            {imgs.map((src, i) => (
              <button key={src} onClick={() => setSelected(i)} className={`w-10 h-10 rounded overflow-hidden border ${i === selected ? 'ring-2 ring-primary' : ''}`}>
                <img src={src} alt={`${p.title} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <h2 className="font-medium text-lg">{p.title}</h2>
        {p.description && <p className="text-sm text-muted-foreground mt-2">{p.description}</p>}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">{p.price}</div>
          <div className="flex gap-2">
            <Button size="sm" asChild>
              <button
                onClick={() => {
                  addItem(p, 1)
                }}
              >
                Add to cart
              </button>
            </Button>

            <Button variant="secondary" size="sm" asChild>
              <button
                onClick={() => {
                  addItem(p, 1)
                  router.push('/shop/checkout')
                }}
              >
                Buy Now
              </button>
            </Button>
          </div>
        </div>

        {p.url && (
          <Button size="sm" variant="outline" asChild className="w-full">
            <a href={p.url} target="_blank" rel="noopener noreferrer">
              View Product
            </a>
          </Button>
        )}
      </div>
    </li>
  )
}

export default function ShopPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-semibold">Shop</h1>
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground mb-8">Digital and physical products related to our courses.</p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </ul>
    </main>
  )
}
