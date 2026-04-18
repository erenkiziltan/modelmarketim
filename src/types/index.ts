export type Locale = 'tr' | 'en'

export interface Product {
  id: string
  slug: string
  name_tr: string
  name_en: string
  description_tr: string
  description_en: string
  price: number
  stock: number
  is_active: boolean
  created_at: string
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  sort_order: number
  is_cover: boolean
}

export interface ProductVariant {
  id: string
  product_id: string
  name_tr: string
  name_en: string
  options: string[]
  price_modifier: number
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: ShippingAddress
  items: OrderItem[]
  total_price: number
  status: OrderStatus
  payment_status: PaymentStatus
  created_at: string
  notes?: string
}

export interface ShippingAddress {
  street: string
  city: string
  district: string
  zip_code: string
  country: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  variant?: string
  quantity: number
  unit_price: number
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface CartItem {
  product: Product
  quantity: number
  selectedVariants: Record<string, string>
}
