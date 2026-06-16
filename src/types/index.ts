export type OrderStatus = 'pendiente' | 'confirmado' | 'en_facturacion' | 'facturado' | 'en_despacho' | 'despachado' | 'entregado' | 'cancelado';

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'credito';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'emitida' | 'pagada' | 'cancelada';
  issuedAt: Date;
  paidAt?: Date;
}

export interface Dispatch {
  id: string;
  orderId: string;
  invoiceId: string;
  clientName: string;
  address: string;
  items: OrderItem[];
  status: 'preparando' | 'en_transito' | 'entregado' | 'fallido';
  carrier: string;
  trackingNumber: string;
  dispatchedAt: Date;
  deliveredAt?: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  suggestions: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
