export type Product = {
  id: string
  title: string
  price: string
  description?: string
  url?: string
  images?: string[]
}

export const products: Product[] = [
  {
    id: 'n2-practice-pack',
    title: 'JLPT N2 Practice Pack (PDF)',
    price: '$9.99',
    description: 'A bundled PDF pack of JLPT N2 vocabulary and grammar exercises.',
    url: '/resources/N2/230新日本语能力考试  N2  Luyen tap Tu vung - Chu Han (1).pdf',
    images: ['/shop/n2-pack.svg'],
  },
  {
    id: 'n2-grammar-book',
    title: 'N2 Grammar Exercises (PDF)',
    price: '$4.99',
    description: 'Additional grammar worksheets for N2 level.',
    url: '/resources/N2/Shiken ni deru Bunpou to hyougen 1-2kyuu.pdf',
    images: ['/shop/n2-grammar.svg'],
  },
  {
    id: 'physical-mouse',
    title: 'Wireless Ergonomic Mouse',
    price: '$24.99',
    description: 'Comfortable wireless mouse suitable for long study sessions.',
    url: '/shop/Mouse/mouse1.avif',
    images: [
      '/shop/Mouse/mouse1.avif',
      '/shop/Mouse/mouse2.avif',
      '/shop/Mouse/mouse3.avif',
      '/shop/Mouse/mouse4.avif',
      '/shop/Mouse/mouse5.avif',
    ],
  },
  {
    id: 'physical-keyboard',
    title: 'Mechanical Keyboard (Compact)',
    price: '$49.99',
    description: 'Compact mechanical keyboard with tactile switches.',
    url: '/shop/keyboard.svg',
    images: ['/shop/keyboard.svg'],
  },
  {
    id: 'consulting',
    title: '1:1 JLPT Coaching (30min)',
    price: '$19.99',
    description: 'Schedule a quick coaching session to review exam strategy.',
    url: 'mailto:you@example.com?subject=Shop%20Inquiry%3A%201%3A1%20JLPT%20Coaching',
    images: ['/shop/coaching.svg'],
  },
]

export default products
