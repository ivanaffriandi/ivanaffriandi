/**
 * SHŪ / EN Studio — Master Workspace Integration Client
 * 
 * Drop this file into your `work.ivanaffriandi.com` project (e.g. `lib/shuenClient.ts`)
 * to monitor orders, update fulfillment, and control SH-EN Studio directly!
 */

export interface ShuenHubOverview {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  pendingCraftingCount: number;
  shippedOrdersCount: number;
  newJobApplicationsCount: number;
  preorderQuotaPercent: number;
}

export interface ShuenOrder {
  id: string;
  invoice_id: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total_amount: number;
  user_email: string;
  payment_method?: string;
  tracking_number?: string;
  courier?: string;
  shipping_details?: {
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    zipCode?: string;
  };
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
    image?: string;
    details?: Array<{ label: string; value: string }>;
    config?: Record<string, any>;
  }>;
  created_at: string;
  updated_at: string;
}

export class ShuenStudioClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(options?: { baseUrl?: string; apiKey?: string }) {
    this.baseUrl = (options?.baseUrl || process.env.NEXT_PUBLIC_SHUEN_API_URL || 'https://shuenstudio.com').replace(/\/$/, '');
    this.apiKey = options?.apiKey || process.env.SHUEN_MASTER_API_KEY || 'shuen_master_sec_2026_ivan_work_hub';
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = new Headers(init?.headers);
    headers.set('x-shuen-api-key', this.apiKey);
    headers.set('Content-Type', 'application/json');

    const res = await fetch(url, {
      ...init,
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `SH-EN API Error (${res.status})`);
    }

    return res.json();
  }

  /**
   * Fetch live workspace overview, sales metrics, and latest orders
   */
  async getHubData(): Promise<{
    success: boolean;
    project: string;
    overview: ShuenHubOverview;
    orders: ShuenOrder[];
    products: any[];
    timestamp: string;
  }> {
    return this.request('/api/admin/hub');
  }

  /**
   * Update order status or input courier tracking airway bill (Resi JNE/J&T)
   */
  async updateOrder(orderId: string, params: {
    status?: 'PAID' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    trackingNumber?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.request('/api/admin/hub', {
      method: 'PATCH',
      body: JSON.stringify({
        action: 'update_order',
        orderId,
        ...params,
      }),
    });
  }

  /**
   * Fetch all orders with optional search / filter
   */
  async getOrders(params?: { orderId?: string }): Promise<{ orders: ShuenOrder[] }> {
    const query = params?.orderId ? `?orderId=${encodeURIComponent(params.orderId)}` : '';
    return this.request(`/api/admin/orders${query}`);
  }
}

// Export default singleton instance
export const shuen = new ShuenStudioClient();
