'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ShuenHubOverview, ShuenOrder } from '@/lib/shuenClient';
import styles from '@/app/work/work.module.css';

interface ShuenWorkspaceWidgetProps {
  activeTab?: string;
}

export default function ShuenWorkspaceWidget({ activeTab = 'orders' }: ShuenWorkspaceWidgetProps) {
  const [data, setData] = useState<{ overview: ShuenHubOverview; orders: ShuenOrder[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PRODUCTION' | 'SHIPPED' | 'PAID'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [resiInput, setResiInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/work/hub', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData({ overview: json.overview, orders: json.orders || [] });
        if (json.orders && json.orders.length > 0 && !selectedOrderId) {
          setSelectedOrderId(json.orders[0].id);
          setResiInput(json.orders[0].tracking_number || '');
        }
      }
    } catch (err: any) {
      console.warn('API sync warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: 'PAID' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED', trackingNumber?: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/work/hub', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_order',
          orderId,
          status,
          trackingNumber,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      await loadData();
      alert(`Status pesanan berhasil diperbarui ke ${status}!`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // If database is empty, display pristine initial workspace slot
  const ordersList = useMemo(() => {
    if (data?.orders && data.orders.length > 0) {
      return data.orders;
    }
    return [
      {
        id: 'order-1',
        invoice_id: 'SHU-2026-001',
        status: 'PRODUCTION' as const,
        total_amount: 374000,
        user_email: 'customer@shuenstudio.com',
        courier: 'JNE Express',
        tracking_number: 'JNE8899201928',
        shipping_details: {
          fullName: 'Bespoke Customer #1',
          phone: '+62 812 0000 1111',
          address: 'Jl. Senopati No. 18',
          city: 'Jakarta Selatan',
          province: 'DKI Jakarta',
          zipCode: '12190'
        },
        items: [
          {
            id: 'item-1',
            title: 'Trifold Leather Journal A6',
            quantity: 1,
            price: 374000,
            details: [
              { label: 'Series', value: 'A6' },
              { label: 'Style', value: 'TRIFOLD' },
              { label: 'Material', value: 'MOIRE' },
              { label: 'Leather', value: 'NERO' },
              { label: 'Cord', value: 'OSSO' },
              { label: 'Finish', value: 'SILVER' },
              { label: 'Charms', value: 'NADIR (G), STELLAR (S)' },
              { label: 'Emboss', value: 'IVAN (P01)' }
            ]
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }, [data?.orders]);

  const filteredOrders = useMemo(() => {
    return ordersList.filter((order) => {
      const statusUpper = String(order.status).toUpperCase();
      const matchesFilter = filterStatus === 'ALL' || 
        (filterStatus === 'PRODUCTION' && (statusUpper === 'PRODUCTION' || statusUpper === 'PROCESSING')) ||
        (filterStatus === 'SHIPPED' && (statusUpper === 'SHIPPED' || statusUpper === 'DELIVERED')) ||
        (filterStatus === 'PAID' && (statusUpper === 'PAID' || statusUpper === 'SUCCESS'));

      const search = searchQuery.toLowerCase();
      const matchesSearch = !search || 
        (order.invoice_id && order.invoice_id.toLowerCase().includes(search)) ||
        (order.user_email && order.user_email.toLowerCase().includes(search)) ||
        (order.shipping_details?.fullName && order.shipping_details.fullName.toLowerCase().includes(search));

      return matchesFilter && matchesSearch;
    });
  }, [ordersList, filterStatus, searchQuery]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return filteredOrders[0] || ordersList[0];
    return ordersList.find(o => o.id === selectedOrderId) || filteredOrders[0] || ordersList[0];
  }, [ordersList, filteredOrders, selectedOrderId]);

  return (
    <>
      {/* ── MIDDLE QUEUE COLUMN ── */}
      <section className={styles.feedColumn}>
        {/* Search Bar */}
        <div className={styles.searchPillBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span style={{ color: '#a1a1aa', fontSize: '13px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search invoice, customer, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className={styles.filterSegmentRow}>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`${styles.filterSegmentBtn} ${filterStatus === 'ALL' ? styles.filterSegmentBtnActive : ''}`}
          >
            All ({ordersList.length})
          </button>
          <button
            onClick={() => setFilterStatus('PRODUCTION')}
            className={`${styles.filterSegmentBtn} ${filterStatus === 'PRODUCTION' ? styles.filterSegmentBtnActive : ''}`}
          >
            Crafting
          </button>
          <button
            onClick={() => setFilterStatus('SHIPPED')}
            className={`${styles.filterSegmentBtn} ${filterStatus === 'SHIPPED' ? styles.filterSegmentBtnActive : ''}`}
          >
            Shipped
          </button>
          <button
            onClick={() => setFilterStatus('PAID')}
            className={`${styles.filterSegmentBtn} ${filterStatus === 'PAID' ? styles.filterSegmentBtnActive : ''}`}
          >
            Paid
          </button>
        </div>

        {/* Orders Cards List */}
        <div className={styles.cardsScrollFeed}>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: '#a1a1aa', fontSize: '12px', fontFamily: 'ui-monospace, monospace' }}>
              No orders found in queue.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isSelected = order.id === selectedOrder?.id;
              const statusUpper = String(order.status).toUpperCase();
              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setResiInput(order.tracking_number || '');
                  }}
                  className={`${styles.swissOrderCard} ${isSelected ? styles.swissOrderCardActive : ''}`}
                >
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.cardInvoiceText}>{order.invoice_id || order.id}</span>
                    <span className={`${styles.statusPill} ${
                      statusUpper === 'PAID' || statusUpper === 'SUCCESS' ? styles.statusPillPaid :
                      statusUpper === 'PRODUCTION' ? styles.statusPillProduction :
                      styles.statusPillShipped
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div>
                    <div className={styles.cardCustomerRow}>
                      {order.shipping_details?.fullName || order.user_email}
                    </div>
                    <div className={styles.cardItemsRow}>
                      {order.items?.map((it: any) => `${it.title} (${it.quantity}x)`).join(', ')}
                    </div>
                  </div>

                  <div className={styles.cardFooterRow}>
                    <span className={styles.cardPriceVal}>
                      Rp {Number(order.total_amount || 0).toLocaleString('id-ID')}
                    </span>
                    <span className={styles.cardCourierVal}>
                      {order.courier || 'JNE / J&T Express'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ── RIGHT DETAIL INSPECTOR CANVAS ── */}
      <section className={styles.detailCanvas}>
        {selectedOrder ? (
          <>
            <div>
              {/* Top Bar */}
              <div className={styles.detailTopBar}>
                <div className={styles.detailStudioTitle}>
                  <div className={styles.studioPulseDot} />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#18181b' }}>
                    SHŪ / EN Studio Control Hub
                  </span>
                  <span style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'ui-monospace, monospace' }}>
                    v2.6 OS
                  </span>
                </div>

                <div className={styles.detailRightActions}>
                  {selectedOrder.shipping_details?.phone && (
                    <a
                      href={`https://wa.me/${selectedOrder.shipping_details.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.btnSwissPill}
                    >
                      💬 WhatsApp Customer
                    </a>
                  )}
                  <a
                    href="https://shuenstudio.com"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.btnSwissPill}
                  >
                    Storefront ↗
                  </a>
                  <a
                    href="https://shuenstudio.com/admin"
                    target="_blank"
                    rel="noreferrer"
                    className={`${styles.btnSwissPill} ${styles.btnSwissPillPrimary}`}
                  >
                    Full Admin Desk ↗
                  </a>
                </div>
              </div>

              {/* Order Status Stepper */}
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Order Status Progression
                </span>
                <div className={styles.stepperRow}>
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PAID')}
                    className={`${styles.stepperBtn} ${selectedOrder.status === 'PAID' ? styles.stepperBtnActive : ''}`}
                  >
                    1. Paid (DOKU)
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PRODUCTION')}
                    className={`${styles.stepperBtn} ${selectedOrder.status === 'PRODUCTION' ? styles.stepperBtnActive : ''}`}
                  >
                    2. In Crafting (17–20d)
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED', resiInput)}
                    className={`${styles.stepperBtn} ${selectedOrder.status === 'SHIPPED' ? styles.stepperBtnActive : ''}`}
                  >
                    3. Shipped (Resi)
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                    className={`${styles.stepperBtn} ${selectedOrder.status === 'DELIVERED' ? styles.stepperBtnActive : ''}`}
                  >
                    4. Delivered
                  </button>
                </div>
              </div>

              {/* Bespoke Specification Matrix */}
              <div style={{ marginTop: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Bespoke Atelier Specifications
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#18181b' }}>
                    {selectedOrder.invoice_id} · Rp {Number(selectedOrder.total_amount).toLocaleString('id-ID')}
                  </span>
                </div>

                {selectedOrder.items && selectedOrder.items[0]?.details ? (
                  <div className={styles.specsGrid}>
                    {selectedOrder.items[0].details.map((d: any, dIdx: number) => (
                      <div key={dIdx} className={styles.specCard}>
                        <span className={styles.specCardLabel}>{d.label}</span>
                        <span className={styles.specCardVal}>{d.value || '-'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.customerInfoBox}>Standard Product Configuration</div>
                )}
              </div>

              {/* Customer & Courier Delivery Details */}
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>
                  Shipping &amp; Logistics ({selectedOrder.courier || 'JNE / J&T Express'})
                </span>
                <div className={styles.customerInfoBox}>
                  <div style={{ fontWeight: 800, color: '#18181b', fontSize: '13px' }}>
                    {selectedOrder.shipping_details?.fullName} ({selectedOrder.shipping_details?.phone || 'No phone'})
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    {selectedOrder.shipping_details?.address}
                  </div>
                  <div style={{ color: '#a1a1aa', marginTop: '2px' }}>
                    {selectedOrder.shipping_details?.city}, {selectedOrder.shipping_details?.province} {selectedOrder.shipping_details?.zipCode}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Airway Bill / Resi Dispatcher */}
            <div className={styles.dispatchBar}>
              <input
                type="text"
                placeholder="Input airway bill / nomor resi JNE atau J&amp;T..."
                value={resiInput}
                onChange={(e) => setResiInput(e.target.value)}
                className={styles.dispatchInput}
              />
              <button
                disabled={updating || !resiInput}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED', resiInput)}
                className={styles.btnDispatch}
              >
                <span>Dispatch Resi</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a1a1aa', fontSize: '13px', fontFamily: 'ui-monospace, monospace' }}>
            Select an order from the queue to inspect details.
          </div>
        )}
      </section>
    </>
  );
}
