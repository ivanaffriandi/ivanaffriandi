'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ShuenHubOverview, ShuenOrder } from '@/lib/shuenClient';
import styles from '@/app/work/work.module.css';

export default function ShuenWorkspaceWidget() {
  const [data, setData] = useState<{ overview: ShuenHubOverview; orders: ShuenOrder[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('order-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [resiInput, setResiInput] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/work/hub', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData({ overview: json.overview, orders: json.orders || [] });
        if (json.orders && json.orders.length > 0 && selectedOrderId === 'order-1') {
          setSelectedOrderId(json.orders[0].id);
          setResiInput(json.orders[0].tracking_number || '');
        }
      }
    } catch (err: any) {
      console.warn('API error, using live fallback data', err);
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
      await loadData();
      alert('Order status & airway bill updated successfully!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Mock initial demo items matching the screenshot exactly if real orders list is empty
  const displayOrders = useMemo(() => {
    if (data?.orders && data.orders.length > 0) {
      return data.orders;
    }
    return [
      {
        id: 'order-1',
        invoice_id: 'SHU-2026-8801',
        status: 'PRODUCTION' as const,
        total_amount: 374000,
        user_email: 'brendan.walsh@studio.com',
        courier: 'JNE Reguler',
        tracking_number: 'JNE1092837465',
        shipping_details: {
          fullName: 'Brendan Walsh',
          phone: '+62 812 3456 7890',
          address: 'Market St, San Francisco, CA / BSD City',
          city: 'Tangerang',
          province: 'Banten',
          zipCode: '15332'
        },
        items: [
          {
            id: 'item-1',
            title: 'Potential Office Review — Journal A6',
            quantity: 1,
            price: 374000,
            image: '/assets/journal-red.jpg',
            details: [
              { label: 'Series', value: 'A6' },
              { label: 'Style', value: 'TRIFOLD' },
              { label: 'Material', value: 'MOIRE' },
              { label: 'Leather', value: 'NERO' },
              { label: 'Cord', value: 'OSSO' },
              { label: 'Finish', value: 'SILVER' },
              { label: 'Charms', value: 'NADIR (G), STELLAR (S)' },
              { label: 'Emboss', value: 'WALSH (P01)' }
            ]
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'order-2',
        invoice_id: 'SHU-2026-8802',
        status: 'PAID' as const,
        total_amount: 289000,
        user_email: 'adriana.livingston@gmail.com',
        courier: 'J&T Express',
        shipping_details: {
          fullName: 'Adriana Livingston',
          phone: '+62 811 9876 5432',
          address: 'Jl. Sudirman No. 45, Jakarta',
          city: 'Jakarta Selatan',
          province: 'DKI Jakarta',
          zipCode: '12190'
        },
        items: [
          {
            id: 'item-2',
            title: 'Business Offer — Bespoke Archive A5',
            quantity: 1,
            price: 289000,
            image: '/assets/product-new2.jpg',
            details: [
              { label: 'Series', value: 'A5' },
              { label: 'Style', value: 'BIFOLD' },
              { label: 'Leather', value: 'BORDEAUX' },
              { label: 'Hardware', value: 'GOLD' }
            ]
          }
        ],
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'order-3',
        invoice_id: 'SHU-2026-8803',
        status: 'PAID' as const,
        total_amount: 450000,
        user_email: 'donny.richards@apple.com',
        courier: 'JNE Express',
        shipping_details: {
          fullName: 'Donny Richards',
          phone: '+62 813 5555 4444',
          address: 'Pondok Indah Residences, Tower 2',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          zipCode: '12310'
        },
        items: [
          {
            id: 'item-3',
            title: 'Team Stand Up — Custom Executive Set',
            quantity: 1,
            price: 450000,
            details: [
              { label: 'Series', value: 'A5' },
              { label: 'Charms', value: 'AURA (S), NOVA (S)' }
            ]
          }
        ],
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'order-4',
        invoice_id: 'SHU-2026-8804',
        status: 'SHIPPED' as const,
        total_amount: 520000,
        user_email: 'diana@netflix.com',
        courier: 'J&T EZ',
        tracking_number: 'JNT9988776655',
        shipping_details: {
          fullName: 'Diana from Netflix',
          phone: '+62 819 0000 1111',
          address: 'Pacific Place Mall, SCBD',
          city: 'Jakarta Selatan',
          province: 'DKI Jakarta',
          zipCode: '12190'
        },
        items: [
          {
            id: 'item-4',
            title: 'Hot Upcoming Shows — Special Edition Atelier',
            quantity: 2,
            price: 520000,
            details: [
              { label: 'Edition', value: 'Netflix Studio Red' }
            ]
          }
        ],
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }, [data?.orders]);

  const activeOrder = useMemo(() => {
    return displayOrders.find(o => o.id === selectedOrderId) || displayOrders[0];
  }, [displayOrders, selectedOrderId]);

  return (
    <>
      {/* ── MIDDLE FEED COLUMN (CARDS LIST) ── */}
      <section className={styles.feedColumn}>
        {/* Search Pill */}
        <div className={styles.searchPillBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span style={{ color: '#8e8e93', fontSize: '15px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search mail / orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button className={styles.searchFilterBtn} title="Filter options">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
        </div>

        {/* Scrollable Cards Feed */}
        <div className={styles.cardsScrollFeed}>
          {displayOrders.map((order, idx) => {
            const isSelected = order.id === activeOrder?.id;
            const isBrendan = idx === 0;
            const isWaveform = idx === 2;
            const isNetflix = idx === 3;

            return (
              <div
                key={order.id}
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setResiInput(order.tracking_number || '');
                }}
                className={`${styles.feedCard} ${isSelected ? styles.feedCardActive : ''}`}
              >
                {/* Header Row */}
                <div className={styles.cardHeaderRow}>
                  <div className={styles.cardAuthorCluster}>
                    <div className={styles.cardAuthorAvatar}>
                      {isNetflix ? (
                        <div style={{ width: '100%', height: '100%', background: '#E50914', color: '#ffffff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                          N
                        </div>
                      ) : (
                        <img src={`https://images.unsplash.com/photo-${1534528741775 + idx * 1000}?w=100&auto=format&fit=crop&q=80`} alt={order.shipping_details?.fullName} />
                      )}
                    </div>
                    <div>
                      <div className={styles.cardAuthorName}>{order.shipping_details?.fullName}</div>
                      {isBrendan && <div className={styles.cardAuthorSub}>Walsh</div>}
                    </div>
                  </div>

                  <div className={styles.cardArrowIcon}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>

                {/* Main Heading & Time */}
                <div>
                  <h3 className={styles.cardMainTitle}>
                    {order.items[0]?.title.split('—')[0].trim() || 'Bespoke Leather Journal'}
                  </h3>
                  <span className={styles.cardTimeSnippet}>
                    {isBrendan ? '09:45 AM - 10:15 PM' : isWaveform ? '09:45 AM - 10:15 AM' : `IDR ${Number(order.total_amount).toLocaleString('id-ID')} · ${order.status}`}
                  </span>
                </div>

                {/* Card 1: Nested Media & Route Widget */}
                {isBrendan && (
                  <div className={styles.nestedMediaWidget}>
                    <div className={styles.nestedWidgetHeader}>
                      <div className={styles.nestedWidgetBadge}>
                        2.3
                        <span>km</span>
                      </div>
                      <div className={styles.nestedWidgetTitleBox}>
                        <h4>Mystery Residences</h4>
                        <p>Market St, San Francisco, Ca</p>
                      </div>
                    </div>

                    <img 
                      src="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=400&auto=format&fit=crop&q=80" 
                      alt="Architecture Preview" 
                      className={styles.nestedWidgetArt} 
                    />

                    <div className={styles.nestedWidgetFooterPills}>
                      <span className={styles.pillDark}>
                        45 <span>min</span>
                      </span>
                      <span className={styles.pillDark} style={{ cursor: 'pointer' }}>
                        Route <span>by car ↗</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Standard Snippet for Card 2 & 4 */}
                {!isBrendan && !isWaveform && (
                  <p className={styles.cardBodySnippet}>
                    Need some help in growing your social media? we've got you covered
                  </p>
                )}

                {/* Waveform Bars for Card 3 */}
                {isWaveform && (
                  <div>
                    <p className={styles.cardBodySnippet} style={{ marginBottom: '6px' }}>
                      Need some help in growing your social media? we've got you covered
                    </p>
                    <div className={styles.waveformBarBox}>
                      {[40, 60, 80, 50, 70, 90, 65, 85, 45, 75, 95, 60, 80, 50, 70, 85, 65, 45, 90, 60].map((h, bIdx) => (
                        <div key={bIdx} className={`${styles.waveBar} ${bIdx < 12 ? styles.waveBarActive : ''}`} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── RIGHT DETAIL READING & ACTION CANVAS ── */}
      <section className={styles.detailCanvas}>
        <div>
          {/* Top Bar */}
          <div className={styles.detailCanvasTopBar}>
            <button className={styles.btnActionTopText}>
              <span style={{ fontSize: '13px' }}>ⓘ</span>
              Mark as spam
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className={styles.detailAuthorHeader}>
                <div className={styles.detailAuthorAvatar}>
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80" alt="Alana Coleton" />
                </div>
                <div>
                  <h4 className={styles.detailAuthorName}>Alana Coleton</h4>
                  <p className={styles.detailAuthorRole}>Product Manager · SHŪ / EN Studio</p>
                </div>
              </div>

              <div className={styles.detailTopActionsGroup}>
                <button className={styles.btnPillReply} onClick={() => alert('Reply dialog opened')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 17 4 12 9 7" />
                    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                  </svg>
                  Reply
                </button>
                <button className={styles.btnRoundAction} title="Archive">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="21 8 21 21 3 21 3 8" />
                    <rect x="1" y="3" width="22" height="5" />
                    <line x1="10" y1="12" x2="14" y2="12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Reading Body */}
          <div className={styles.detailReadingBody} style={{ marginTop: '24px' }}>
            <p className={styles.detailGreeting}>Hey David,</p>

            <p>
              Here are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.
            </p>

            <p>
              All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable.
            </p>

            <div style={{ marginTop: '12px' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>Best,</p>
              <p style={{ margin: 0, color: '#71717a' }}>Alana Coleton</p>
            </div>

            {/* Bespoke Order Specs breakdown if looking at specific order */}
            {activeOrder && activeOrder.items && activeOrder.items[0]?.details && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#f8f8fa', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1c1c1e', display: 'block', marginBottom: '8px' }}>
                  Live Order Specifications: {activeOrder.invoice_id} ({activeOrder.status})
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {activeOrder.items[0].details.map((d: any, dIdx: number) => (
                    <div key={dIdx} style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#8e8e93', textTransform: 'uppercase', display: 'block' }}>{d.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1c1c1e' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachment Cards Row */}
            <div className={styles.attachmentsRow}>
              <div className={styles.attachmentCard}>
                <div className={styles.attachmentIcon}>
                  🎬
                </div>
                <div>
                  <div className={styles.attachmentTitle}>Video Presentation</div>
                  <div className={styles.attachmentSize}>8.5 mb</div>
                </div>
              </div>

              <div className={styles.attachmentCard}>
                <div className={styles.attachmentIcon}>
                  📄
                </div>
                <div>
                  <div className={styles.attachmentTitle}>Review Document</div>
                  <div className={styles.attachmentSize}>250 kb</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quick Reply / Airway Bill Input Box */}
        <div className={styles.bottomQuickReplyBox}>
          <input
            type="text"
            placeholder="Start typing your reply or airway bill here..."
            value={replyInput || resiInput}
            onChange={(e) => {
              setReplyInput(e.target.value);
              setResiInput(e.target.value);
            }}
            className={styles.quickReplyInput}
          />
          <div className={styles.quickReplyIcons}>
            <button className={styles.btnReplyIcon} title="Attach file">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <button 
              onClick={() => handleUpdateStatus(activeOrder.id, 'SHIPPED', resiInput || replyInput)}
              className={styles.btnReplyIcon} 
              title="Send / Dispatch"
              style={{ background: '#1c1c1e', color: '#ffffff', borderRadius: '50%', width: '32px', height: '32px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
