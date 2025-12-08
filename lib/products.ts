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
    description: 'Comfortable wired mouse suitable for long study sessions.',
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
  {
    id: 'headphone-1',
    title: 'Active Noise Cancelling Headphones',
    price: '¥5500',
    description: 'Hybrid Wireless Headphone With Multi Magnetic Touch Control LED Screen.',
    url: 'https://s.click.aliexpress.com/e/_c3b8SLlf',
    images: [
      '/shop/Headphone1/headphone1.jpg',
      '/shop/Headphone1/headphone2.jpg',
      '/shop/Headphone1/headphone3.jpg',
      '/shop/Headphone1/headphone4.jpg',
      '/shop/Headphone1/headphone5.jpg',
    ],
  },
  {
    id: 'headphone-2',
    title: 'Wireless Headphone with Detachable Full Color Touch Screen',
    price: '¥5500',
    description: 'AI Assistant Smart Chat Translation Function BT5.4.',
    url: 'https://s.click.aliexpress.com/e/_c4tuoPrT',
    images: [
      '/shop/Headphone2/headphone1.jpg',
      '/shop/Headphone2/headphone2.jpg',
      '/shop/Headphone2/headphone3.jpg',
      '/shop/Headphone2/headphone4.jpg',
      '/shop/Headphone2/headphone5.jpg',
    ],
  },
  
]

export default products
