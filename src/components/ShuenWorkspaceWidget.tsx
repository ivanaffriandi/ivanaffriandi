'use client';

import React, { useState, useEffect } from 'react';
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
    const interval = setInterval(loadData, 15000); // 15s live polling
    return () => clearInterval(interval);
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
      <div className={styles.studioHeroCard} style={{ textAlign: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ width: '20px', height: '20px', border: '2px solid rgba(212,175,55,0.2)', borderTop: '2px solid #d4af37', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>Connecting to Live Studio Database...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={styles.studioHeroCard} style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
        <div>
          <p style={{ color: '#f87171', fontWeight: 800, fontSize: '14px', margin: 0 }}>Studio Engine Connection Offline</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '4px 0 0 0' }}>{error}</p>
        </div>
        <button onClick={loadData} className={styles.btnSecondary} style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          Retry Connection
        </button>
      </div>
    );
  }

  const { overview, orders } = data!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* ── STUDIO HERO CARD ── */}
      <div className={styles.studioHeroCard}>
        <div className={styles.studioMeta}>
          <div className={styles.studioLogoBox}>
            SH
          </div>
          <div>
            <div className={styles.studioTitleRow}>
              <h2 className={styles.studioTitle}>SHŪ / EN Studio</h2>
              <div className={styles.liveIndicator}>
                <span className={styles.liveDot} />
                Live Engine
              </div>
            </div>
            <p className={styles.studioSubtitle}>shuenstudio.com · Connected to PostgreSQL, DOKU &amp; Logistics</p>
          </div>
        </div>

        <div className={styles.studioActions}>
          <button onClick={loadData} className={styles.btnSecondary}>
            ↻ Live Sync
          </button>
          <a href="https://shuenstudio.com/admin" target="_blank" rel="noreferrer" className={styles.btnPrimary}>
            Open Full Studio Admin ↗
          </a>
        </div>
      </div>

      {/* ── METRICS GRID ── */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Revenue</span>
          <span className={`${styles.metricValue} ${styles.metricValueGold}`}>
            Rp {overview.totalRevenue.toLocaleString('id-ID')}
          </span>
          <span className={styles.metricFooter}>{overview.paidOrdersCount} Paid Orders</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>In Crafting</span>
          <span className={styles.metricValue}>
            {overview.pendingCraftingCount}
          </span>
          <span className={styles.metricFooter}>Lead time: 17–20 Workdays</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Shipped &amp; Done</span>
          <span className={`${styles.metricValue} ${styles.metricValueEmerald}`}>
            {overview.shippedOrdersCount}
          </span>
          <span className={styles.metricFooter}>Via JNE &amp; J&amp;T Express</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Pre-Order Quota</span>
          <span className={`${styles.metricValue} ${styles.metricValueCyan}`}>
            {overview.preorderQuotaPercent}%
          </span>
          <span className={styles.metricFooter}>Batch 1 Allocation</span>
        </div>
      </div>

      {/* ── ORDERS CARD ── */}
      <div className={styles.ordersCard}>
        <div className={styles.ordersHeader}>
          <div>
            <h3 className={styles.ordersHeading}>Recent Bespoke Orders</h3>
            <p className={styles.ordersSubheading}>Live customer customization queue and courier airway bill dispatch</p>
          </div>
          <span className={styles.badgePill}>{orders.length} orders</span>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: 'ui-monospace, monospace' }}>
            No incoming customer orders recorded yet.
          </div>
        ) : (
          <div className={styles.orderList}>
            {orders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              const statusUpper = String(order.status).toUpperCase();
              return (
                <div
                  key={order.id}
                  className={`${styles.orderItem} ${isSelected ? styles.orderItemActive : ''}`}
                >
                  <div className={styles.orderMainRow}>
                    <div className={styles.orderIdentity}>
                      <div className={styles.orderThumb}>
                        SHU
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={styles.orderInvoiceTitle}>{order.invoice_id || order.id}</span>
                          <span className={styles.orderCustomer}>· {order.shipping_details?.fullName || order.user_email}</span>
                        </div>
                        <p className={styles.orderSummaryMeta}>
                          {order.items.map((it: any) => `${it.title} (${it.quantity}x)`).join(', ')} · Rp {order.total_amount.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className={styles.orderControlRow}>
                      <span className={`${styles.statusPill} ${
                        statusUpper === 'PAID' || statusUpper === 'SUCCESS' ? styles.statusPaid :
                        statusUpper === 'PRODUCTION' ? styles.statusProduction :
                        statusUpper === 'SHIPPED' ? styles.statusShipped :
                        styles.badgePill
                      }`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedOrder(isSelected ? null : order);
                          setResiInput(order.tracking_number || '');
                        }}
                        className={styles.btnManage}
                      >
                        {isSelected ? 'Close' : 'Manage'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Management Drawer */}
                  {isSelected && (
                    <div className={styles.orderDrawer}>
                      <div>
                        <div style={{ marginBottom: '12px' }}>
                          <div className={styles.specLabel}>Delivery Address &amp; Contact</div>
                          <div className={styles.specValue}>{order.shipping_details?.fullName} ({order.shipping_details?.phone || 'No phone'})</div>
                          <div className={styles.specValue} style={{ opacity: 0.8 }}>{order.shipping_details?.address || 'Standard Address'}</div>
                          <div className={styles.specValue} style={{ opacity: 0.6 }}>{order.shipping_details?.city}, {order.shipping_details?.province} ({order.shipping_details?.zipCode})</div>
                        </div>
                        <div>
                          <div className={styles.specLabel}>Courier Method</div>
                          <div className={styles.specValue} style={{ color: '#d4af37', fontWeight: 800 }}>{order.courier || 'JNE / J&T'}</div>
                        </div>
                      </div>

                      <div>
                        <div>
                          <div className={styles.specLabel}>Airway Bill / Nomor Resi (JNE / J&amp;T)</div>
                          <div className={styles.resiInputGroup}>
                            <input
                              type="text"
                              placeholder="e.g. JNE1029384756"
                              value={resiInput}
                              onChange={(e) => setResiInput(e.target.value)}
                              className={styles.resiInput}
                            />
                            <button
                              disabled={updating}
                              onClick={() => handleUpdateStatus(order.id, 'SHIPPED', resiInput)}
                              className={styles.btnDispatch}
                            >
                              Dispatch Resi
                            </button>
                          </div>
                        </div>

                        <div className={styles.actionBtnGroup}>
                          <button
                            disabled={updating}
                            onClick={() => handleUpdateStatus(order.id, 'PRODUCTION')}
                            className={styles.btnStatusAction}
                          >
                            Mark In Crafting
                          </button>
                          <button
                            disabled={updating}
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                            className={styles.btnStatusAction}
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
