'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ShuenStudioClient, ShuenHubOverview, ShuenOrder } from '@/lib/shuenClient';
import styles from '@/app/work/work.module.css';

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
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PRODUCTION' | 'SHIPPED' | 'PAID'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [resiInput, setResiInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.getHubData();
      setData({ overview: res.overview, orders: res.orders });
      if (res.orders.length > 0 && !selectedOrderId) {
        setSelectedOrderId(res.orders[0].id);
        setResiInput(res.orders[0].tracking_number || '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to SHŪ / EN Studio API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: 'PAID' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED', trackingNumber?: string) => {
    setUpdating(true);
    try {
      await client.updateOrder(orderId, { status, trackingNumber });
      await loadData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!data?.orders) return [];
    return data.orders.filter((order) => {
      const statusUpper = String(order.status).toUpperCase();
      const matchesFilter = filterTab === 'ALL' || 
        (filterTab === 'PRODUCTION' && (statusUpper === 'PRODUCTION' || statusUpper === 'PROCESSING')) ||
        (filterTab === 'SHIPPED' && (statusUpper === 'SHIPPED' || statusUpper === 'DELIVERED')) ||
        (filterTab === 'PAID' && (statusUpper === 'PAID' || statusUpper === 'SUCCESS'));

      const search = searchQuery.toLowerCase();
      const matchesSearch = !search || 
        (order.invoice_id && order.invoice_id.toLowerCase().includes(search)) ||
        (order.user_email && order.user_email.toLowerCase().includes(search)) ||
        (order.shipping_details?.fullName && order.shipping_details.fullName.toLowerCase().includes(search));

      return matchesFilter && matchesSearch;
    });
  }, [data?.orders, filterTab, searchQuery]);

  const selectedOrder = useMemo(() => {
    if (!data?.orders || !selectedOrderId) return null;
    return data.orders.find(o => o.id === selectedOrderId) || null;
  }, [data?.orders, selectedOrderId]);

  if (loading && !data) {
    return (
      <div className={styles.emptyInspector}>
        <div style={{ width: '24px', height: '24px', border: '2px solid rgba(212,175,55,0.2)', borderTop: '2px solid #d4af37', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span>Initializing Studio Telemetry Gateway...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={styles.detailBox} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <p style={{ color: '#f87171', fontWeight: 800, margin: 0 }}>Studio Engine Connection Error</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '4px 0 12px 0' }}>{error}</p>
        <button onClick={loadData} className={styles.btnActionApple}>
          Retry Connection
        </button>
      </div>
    );
  }

  const { overview } = data!;

  return (
    <div className={styles.workspaceBody}>
      {/* ── LEFT MASTER PANE (METRICS & ORDER QUEUE) ── */}
      <div className={styles.masterPane}>
        {/* Holographic Mini Metrics */}
        <div className={styles.miniMetricsGrid}>
          <div className={styles.miniMetricCard}>
            <span className={styles.miniMetricLabel}>Studio Omzet</span>
            <span className={`${styles.miniMetricVal} ${styles.miniMetricValGold}`}>
              Rp {overview.totalRevenue.toLocaleString('id-ID')}
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{overview.paidOrdersCount} Paid Orders</span>
          </div>

          <div className={styles.miniMetricCard}>
            <span className={styles.miniMetricLabel}>In Crafting</span>
            <span className={styles.miniMetricVal}>
              {overview.pendingCraftingCount}
            </span>
            <span style={{ fontSize: '10px', color: '#d4af37' }}>Lead time: 17–20d</span>
          </div>

          <div className={styles.miniMetricCard}>
            <span className={styles.miniMetricLabel}>Shipped</span>
            <span className={styles.miniMetricVal} style={{ color: '#34d399' }}>
              {overview.shippedOrdersCount}
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>JNE &amp; J&amp;T</span>
          </div>

          <div className={styles.miniMetricCard}>
            <span className={styles.miniMetricLabel}>Quota Batch 1</span>
            <span className={styles.miniMetricVal} style={{ color: '#38bdf8' }}>
              {overview.preorderQuotaPercent}%
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Capacity Allocation</span>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className={styles.filterBar}>
          <button
            onClick={() => setFilterTab('ALL')}
            className={`${styles.filterChip} ${filterTab === 'ALL' ? styles.filterChipActive : ''}`}
          >
            All ({data?.orders.length || 0})
          </button>
          <button
            onClick={() => setFilterTab('PRODUCTION')}
            className={`${styles.filterChip} ${filterTab === 'PRODUCTION' ? styles.filterChipActive : ''}`}
          >
            Crafting ({overview.pendingCraftingCount})
          </button>
          <button
            onClick={() => setFilterTab('SHIPPED')}
            className={`${styles.filterChip} ${filterTab === 'SHIPPED' ? styles.filterChipActive : ''}`}
          >
            Shipped ({overview.shippedOrdersCount})
          </button>
          <button
            onClick={() => setFilterTab('PAID')}
            className={`${styles.filterChip} ${filterTab === 'PAID' ? styles.filterChipActive : ''}`}
          >
            Paid ({overview.paidOrdersCount})
          </button>
        </div>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Search customer, invoice, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.dispatchInput}
          style={{ padding: '8px 12px', fontSize: '12px' }}
        />

        {/* Orders List Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: 'ui-monospace, monospace' }}>
              No matching bespoke orders found.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isSelected = selectedOrderId === order.id;
              const statusUpper = String(order.status).toUpperCase();
              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setResiInput(order.tracking_number || '');
                  }}
                  className={`${styles.orderCardItem} ${isSelected ? styles.orderCardItemActive : ''}`}
                >
                  <div className={styles.orderCardHeader}>
                    <span className={styles.orderCardInvoice}>{order.invoice_id || order.id}</span>
                    <span className={`${styles.orderStatusBadge} ${
                      statusUpper === 'PAID' || statusUpper === 'SUCCESS' ? styles.statusBadgePaid :
                      statusUpper === 'PRODUCTION' ? styles.statusBadgeProduction :
                      statusUpper === 'SHIPPED' ? styles.statusBadgeShipped :
                      styles.badgePill
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div>
                    <div className={styles.orderCardCustomer}>
                      {order.shipping_details?.fullName || order.user_email}
                    </div>
                    <div className={styles.orderCardItemsSummary}>
                      {order.items.map((it: any) => `${it.title} (${it.quantity}x)`).join(', ')}
                    </div>
                  </div>

                  <div className={styles.orderCardFooter}>
                    <span className={styles.orderCardPrice}>
                      Rp {Number(order.total_amount || 0).toLocaleString('id-ID')}
                    </span>
                    <span className={styles.orderCardCourier}>
                      {order.courier || 'JNE / J&T'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT DETAIL INSPECTOR PANE ── */}
      <div className={styles.detailPane}>
        {selectedOrder ? (
          <>
            {/* Header Identity Box */}
            <div className={styles.detailBox}>
              <div className={styles.detailBoxHeader}>
                <div>
                  <h3 className={styles.detailBoxTitle}>{selectedOrder.invoice_id || selectedOrder.id}</h3>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0 0', fontFamily: 'ui-monospace, monospace' }}>
                    Created: {new Date(selectedOrder.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedOrder.shipping_details?.phone && (
                    <a
                      href={`https://wa.me/${selectedOrder.shipping_details.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.btnActionApple}
                    >
                      💬 WhatsApp Customer
                    </a>
                  )}
                  <a
                    href="https://shuenstudio.com/admin"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.btnActionApple}
                  >
                    Open in Full Admin ↗
                  </a>
                </div>
              </div>

              {/* Bespoke Specification Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.4)' }}>
                  Bespoke Configuration Breakdown
                </span>

                {selectedOrder.items.map((item: any, iIdx: number) => (
                  <div key={iIdx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '13px', color: '#ffffff' }}>{item.title}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#d4af37' }}>Rp {Number(item.price || 0).toLocaleString('id-ID')} ({item.quantity}x)</span>
                    </div>

                    {item.details && item.details.length > 0 && (
                      <div className={styles.specsTableGrid}>
                        {item.details.map((d: any, dIdx: number) => (
                          <div key={dIdx} className={styles.specCell}>
                            <span className={styles.specCellLabel}>{d.label}</span>
                            <span className={styles.specCellValue}>{d.value || '-'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics & Airway Bill Dispatcher Box */}
            <div className={styles.detailBox}>
              <div className={styles.detailBoxHeader}>
                <h3 className={styles.detailBoxTitle}>Logistics &amp; Courier Airway Bill</h3>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#d4af37' }}>
                  {selectedOrder.courier || 'JNE / J&T Express'}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                <div><strong style={{ color: '#ffffff' }}>{selectedOrder.shipping_details?.fullName}</strong> ({selectedOrder.shipping_details?.phone || 'No phone'})</div>
                <div>{selectedOrder.shipping_details?.address || 'Standard Address'}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {selectedOrder.shipping_details?.city}, {selectedOrder.shipping_details?.province} ({selectedOrder.shipping_details?.zipCode})
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
                  Input Nomor Resi (JNE / J&amp;T)
                </label>
                <div className={styles.dispatchRow}>
                  <input
                    type="text"
                    placeholder="e.g. JNE1092837465 / JNT9281726354"
                    value={resiInput}
                    onChange={(e) => setResiInput(e.target.value)}
                    className={styles.dispatchInput}
                  />
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED', resiInput)}
                    className={styles.btnDispatchApple}
                  >
                    Dispatch Resi
                  </button>
                </div>
              </div>

              <div className={styles.statusBarActions}>
                <button
                  disabled={updating}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'PRODUCTION')}
                  className={styles.btnStatusPill}
                >
                  Mark In Crafting (17–20d)
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                  className={styles.btnStatusPill}
                >
                  Mark Delivered
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.emptyInspector}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              📦
            </div>
            <span>Select an order from the queue to inspect details &amp; dispatch airway bill.</span>
          </div>
        )}
      </div>
    </div>
  );
}
