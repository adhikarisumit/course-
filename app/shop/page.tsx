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
  const [activeIndex, setActiveIndex] = useState(0)
  const [showFullImage, setShowFullImage] = useState(false)

  return (
    <li key={p.id} className="border border-border rounded-lg overflow-hidden flex flex-col h-full bg-card">
      {/* Main image container - fixed height */}
      <div 
        className="w-full h-48 flex items-center justify-center bg-muted/5 p-4 flex-shrink-0 overflow-hidden cursor-pointer relative group"
        onClick={() => setShowFullImage(true)}
      >
        <img 
          src={imgs[activeIndex]} 
          alt={p.title} 
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110" 
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors duration-300">
          <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Click to View</span>
        </div>
      </div>

      {/* Full image modal/overlay */}
      {showFullImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-2xl max-h-[80vh] flex items-center justify-center">
            <img 
              src={imgs[activeIndex]} 
              alt={p.title} 
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-black rounded-full p-2 transition-all"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Thumbnails - horizontal scrollable on all screens */}
      {imgs.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-muted/5 flex-shrink-0">
          {imgs.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-14 h-14 rounded border transition-all ${
                i === activeIndex ? 'ring-2 ring-primary' : 'hover:border-primary/50'
              }`}
              aria-label={`Show image ${i + 1}`}
            >
              <img src={src} alt={`${p.title} ${i + 1}`} className="w-full h-full object-cover rounded" />
            </button>
          ))}
        </div>
      )}

      {/* Product info and actions */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title and description */}
        <div>
          <h2 className="font-semibold text-base md:text-lg line-clamp-2">{p.title}</h2>
          {p.description && <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
        </div>

        {/* Price */}
        <div className="text-lg font-bold text-primary">{p.price}</div>

        {/* Action buttons - stack on mobile, inline on desktop */}
        <div className="flex flex-col gap-2 mt-auto">
          <Button
            size="sm"
            className="w-full"
            onClick={() => addItem(p, 1)}
          >
            Add to cart
          </Button>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => {
                addItem(p, 1)
                router.push('/shop/checkout')
              }}
            >
              Buy Now
            </Button>

            {p.url && (
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  View
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}export default function ShopPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Shop</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">Digital and physical products related to our courses.</p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </ul>
    </main>
  )
}
