export interface Spec { label: string; value: string }
export interface Product {
  id: string; name: string; slug: string; sku: string; category: string;
  shortDescription: string; description: string; price: number;
  image: { url: string; publicId: string }; specifications: Spec[];
  isActive: boolean; isFeatured: boolean; sortOrder: number;
}
export interface Settings {
  deliveryFee: number; storeName: string; phone: string; whatsapp: string; email: string; address: string;
  social: { facebook: string; instagram: string; youtube: string; tiktok: string };
}
export interface Announcement { id: string; text: string; linkUrl: string; linkLabel: string; isActive: boolean }
export interface PublicConfig { currency: string; provinces: string[]; paymentMethods: { cod: boolean; online: boolean } }
export interface QuoteLine { productId: string; slug: string; name: string; image: string; unitPrice: number; quantity: number; lineTotal: number }
export interface Quote { lines: QuoteLine[]; unavailable: string[]; subtotal: number; deliveryFee: number; total: number }
export interface OrderItem { name: string; slug: string; image: string; unitPrice: number; quantity: number; lineTotal: number }
export interface Order {
  id: string; orderNumber: string; createdAt: string;
  customer: { name: string; phone: string; email: string; address: string; city: string; province: string; postalCode: string };
  items: OrderItem[]; subtotal: number; deliveryFee: number; total: number;
  paymentMethod: 'cod' | 'online'; paymentStatus: string; status: string; notes: string;
}
export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;
export const PAYMENT_STATUSES = ['Unpaid', 'Pending', 'Paid', 'Failed', 'Refunded'] as const;
export const CATEGORIES = ['Buses', 'Vehicles', 'Industrial'] as const;
export const MAX_QTY = 20;
