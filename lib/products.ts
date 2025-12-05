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
    id: 'physical-mouse',
    title: 'Wired gaming Mouse',
    price: '¥1200',
    description: 'Comfortable wireless mouse suitable for long study sessions.',
    url: 'https://s.click.aliexpress.com/e/_c4VlSGHF',
    images: [
      '/shop/Mouse/mouse1.avif',
      '/shop/Mouse/mouse2.avif',
      '/shop/Mouse/mouse3.avif',
      '/shop/Mouse/mouse4.avif',
      '/shop/Mouse/mouse5.avif',
    ],
  },
  {
    id: 'physical-mouse-2',
    title: 'Wireless Gaming Mouse with Joystick',
    price: '¥3800',
    description: 'Comfortable wireless mouse suitable for long study sessions.',
    url: 'https://s.click.aliexpress.com/e/_c2w5gzip',
    images: [
      '/shop/Mouse2/mouse1.avif',
      '/shop/Mouse2/mouse5.avif',
      '/shop/Mouse2/mouse2.avif',
      '/shop/Mouse2/mouse3.avif',
      '/shop/Mouse2/mouse4.avif',
    ],
  },
  
]

export default products
