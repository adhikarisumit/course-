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
    <li key={p.id} className="p-3 border rounded-md h-full">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Thumbnails: left on desktop, below on mobile */}
        {imgs.length > 1 && (
          <div className="order-2 sm:order-1 flex gap-2 sm:flex-col sm:w-20">
            {imgs.map((src, i) => (
              <button
                key={src}
                onClick={() => setSelected(i)}
                aria-label={`Show image ${i + 1} for ${p.title}`}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border flex-shrink-0 ${i === selected ? 'ring-2 ring-primary' : ''}`}
              >
                <img src={src} alt={`${p.title} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main image and details */}
        <div className="order-1 sm:order-2 flex-1">
          <div className="w-full h-56 sm:h-48 mb-3 flex items-center justify-center bg-muted/10 rounded-md overflow-hidden">
            <img src={imgs[selected]} alt={p.title} className="max-h-full max-w-full object-contain" />
          </div>

          <h2 className="font-medium text-lg">{p.title}</h2>
          {p.description && <p className="text-sm text-muted-foreground mt-2">{p.description}</p>}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-lg font-semibold">{p.price}</div>
            <div className="hidden sm:flex gap-2">
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
        </div>
      </div>

      {/* Actions for mobile stacked */}
      <div className="mt-4 sm:hidden flex flex-col gap-2">
        <div className="text-lg font-semibold">{p.price}</div>
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
