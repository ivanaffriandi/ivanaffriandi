'use client';

import React, { useState, useEffect } from 'react';
import { ShuenStudioClient, ShuenHubOverview, ShuenOrder } from '@/lib/shuenClient';

interface ShuenWorkspaceWidgetProps {
  apiKey?: string;
  apiUrl?: string;
}

export default function ShuenWorkspaceWidget({
  apiKey = 'shuen_master_sec_2026_ivan_work_hub',
  apiUrl = 'https://shuenstudio.com',
}: ShuenWorkspaceWidgetProps) {
  const [client] = useState(() => new ShuenStudioClient({ apiKey, baseUrl: apiUrl }));
  const [data, setData] = useState<{ overview: ShuenHubOverview; orders: ShuenOrder[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ShuenOrder | null>(null);
  const [resiInput, setResiInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.getHubData();
      setData({ overview: res.overview, orders: res.orders });
    } catch (err: any) {
      setError(err.message || 'Failed to connect to SHŪ / EN Studio API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: 'PAID' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED', trackingNumber?: string) => {
    setUpdating(true);
    try {
      await client.updateOrder(orderId, { status, trackingNumber });
      await loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: ShuenOrder | null) => prev ? { ...prev, status, tracking_number: trackingNumber || prev.tracking_number } : null);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 rounded-3xl bg-neutral-900 border border-white/10 text-white flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
        <span className="text-sm font-medium tracking-wide">Connecting to SHŪ / EN Studio...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 rounded-3xl bg-red-950/30 border border-red-500/20 text-red-300 flex items-center justify-between">
        <div>
          <p className="font-bold text-sm">Connection Failed</p>
          <p className="text-xs opacity-70 mt-0.5">{error}</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-xs font-bold transition-all">
          Retry
        </button>
      </div>
    );
  }

  const { overview, orders } = data!;

  return (
    <div className="w-full flex flex-col gap-6 text-white font-sans">
      {/* ── HEADER CARD ── */}
      <div className="p-6 md:p-8 rounded-[28px] bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 font-serif font-black text-2xl shadow-inner">
            SH
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">SHŪ / EN Studio</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                Live
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1 font-mono">shuenstudio.com · Connected to PostgreSQL &amp; DOKU</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadData} className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all cursor-pointer">
            ↻ Refresh
          </button>
          <a href="https://shuenstudio.com/admin" target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 transition-all shadow-lg">
            Open Studio Admin ↗
          </a>
        </div>
      </div>

      {/* ── METRICS GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/5 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Total Revenue</span>
          <span className="text-xl md:text-2xl font-extrabold text-amber-300 tabular-nums">
            Rp {overview.totalRevenue.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-white/30 mt-1">{overview.paidOrdersCount} Paid Orders</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/5 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">In Crafting</span>
          <span className="text-xl md:text-2xl font-extrabold text-white tabular-nums">
            {overview.pendingCraftingCount}
          </span>
          <span className="text-[10px] text-amber-400/80 mt-1">Lead time: 17-20 Days</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/5 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Shipped &amp; Done</span>
          <span className="text-xl md:text-2xl font-extrabold text-emerald-400 tabular-nums">
            {overview.shippedOrdersCount}
          </span>
          <span className="text-[10px] text-white/30 mt-1">Via JNE &amp; J&amp;T</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/5 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Pre-Order Quota</span>
          <span className="text-xl md:text-2xl font-extrabold text-cyan-400 tabular-nums">
            {overview.preorderQuotaPercent}%
          </span>
          <span className="text-[10px] text-white/30 mt-1">Batch 1 Allocation</span>
        </div>
      </div>

      {/* ── RECENT ORDERS DESK ── */}
      <div className="p-6 md:p-8 rounded-[28px] bg-neutral-900/90 border border-white/10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Recent Bespoke Orders</h3>
            <p className="text-xs text-white/50 mt-0.5">Control crafting queue and dispatch airway bills</p>
          </div>
          <span className="text-xs font-mono text-white/40">{orders.length} orders total</span>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-white/40 text-xs font-mono">No customer orders recorded yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  className={`p-4 md:p-5 rounded-2xl border transition-all ${
                    isSelected ? 'bg-white/10 border-white/30 shadow-xl' : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-amber-300">
                        SHU
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{order.invoice_id || order.id}</span>
                          <span className="text-xs text-white/60">· {order.shipping_details?.fullName || order.user_email}</span>
                        </div>
                        <p className="text-[11px] text-white/40 mt-0.5">
                          {order.items.map((it: any) => `${it.title} (${it.quantity}x)`).join(', ')} · Rp {order.total_amount.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        String(order.status).toUpperCase() === 'PAID' || String(order.status).toUpperCase() === 'SUCCESS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        String(order.status).toUpperCase() === 'PRODUCTION' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        String(order.status).toUpperCase() === 'SHIPPED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-white/10 text-white/60 border border-white/10'
                      }`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedOrder(isSelected ? null : order);
                          setResiInput(order.tracking_number || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer"
                      >
                        {isSelected ? 'Close' : 'Manage'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Management Drawer */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <p className="font-bold text-white/70 uppercase text-[10px] tracking-wider">Shipping Address &amp; Courier</p>
                        <p className="text-white/80">{order.shipping_details?.address || 'Standard Address'}</p>
                        <p className="text-white/50">{order.shipping_details?.city}, {order.shipping_details?.province} ({order.shipping_details?.zipCode})</p>
                        <p className="text-amber-300/80 font-bold">Courier: {order.courier || 'JNE / J&T'}</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-white/70 uppercase text-[10px] tracking-wider mb-1">Airway Bill / Resi (JNE / J&amp;T)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. JNE1234567890"
                              value={resiInput}
                              onChange={(e) => setResiInput(e.target.value)}
                              className="flex-1 bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                            />
                            <button
                              disabled={updating}
                              onClick={() => handleUpdateStatus(order.id, 'SHIPPED', resiInput)}
                              className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-50"
                            >
                              Dispatch Resi
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            disabled={updating}
                            onClick={() => handleUpdateStatus(order.id, 'PRODUCTION')}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-bold text-[11px]"
                          >
                            Mark In Crafting
                          </button>
                          <button
                            disabled={updating}
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                            className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 font-bold text-[11px]"
                          >
                            Mark Delivered
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
