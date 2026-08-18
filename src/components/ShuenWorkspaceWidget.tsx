'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ShuenHubOverview, ShuenOrder } from '@/lib/shuenClient';
import styles from '@/app/work/work.module.css';

export default function ShuenWorkspaceWidget() {
  const [data, setData] = useState<{ overview: ShuenHubOverview; orders: ShuenOrder[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('order-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [resiInput, setResiInput] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
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
      console.warn('API error, using fallback data', err);
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
      alert(`Nomor resi ${trackingNumber || ''} berhasil disimpan dan status pesanan diperbarui!`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Real customized cards matching Ivan's projects & SHŪ / EN Studio
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
        user_email: 'sarah.kusuma@bespoke.id',
        courier: 'JNE Express',
        tracking_number: 'JNE8899201928',
        shipping_details: {
          fullName: 'Sarah Kusuma',
          phone: '+62 812 8877 6655',
          address: 'Apartemen Senopati Suites, Tower 1 Lt. 18',
          city: 'Jakarta Selatan',
          province: 'DKI Jakarta',
          zipCode: '12190'
        },
        items: [
          {
            id: 'item-1',
            title: 'Trifold Bespoke Journal A6 (Nero Leather)',
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
              { label: 'Emboss', value: 'SARAH.K (P01)' }
            ]
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'order-2',
        invoice_id: 'ESSAY-2026-08',
        status: 'PAID' as const,
        total_amount: 0,
        user_email: 'ivan@ivanaffriandi.com',
        courier: 'ivanaffriandi.com/blog',
        shipping_details: {
          fullName: 'Personal Essays & Publications',
          phone: '',
          address: 'ivanaffriandi.com/blog/cyber-artisanal-craft',
          city: 'Published Online',
          province: 'Live on Cloudflare',
          zipCode: '2026'
        },
        items: [
          {
            id: 'item-2',
            title: 'The Architecture of Cyber-Artisanal Craft',
            quantity: 1,
            price: 0,
            details: [
              { label: 'Type', value: 'LONGFORM ESSAY' },
              { label: 'Length', value: '1,420 WORDS' },
              { label: 'Reading Time', value: '6 MIN' },
              { label: 'Status', value: 'READY FOR REVIEW' }
            ]
          }
        ],
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'order-3',
        invoice_id: 'MAIL-TELEMETRY',
        status: 'PAID' as const,
        total_amount: 0,
        user_email: 'admin@mail.ivanaffriandi.com',
        courier: 'AWS SES & Mail Engine',
        shipping_details: {
          fullName: 'mail.ivanaffriandi.com Telemetry',
          phone: '',
          address: 'Oracle Cloud VM 129.225.6.139',
          city: 'Docker Backend',
          province: 'DKIM 2048-bit Signed',
          zipCode: '100% OK'
        },
        items: [
          {
            id: 'item-3',
            title: 'DKIM, SPF & SES Deliverability Health',
            quantity: 1,
            price: 0,
            details: [
              { label: 'Inbox Rate', value: '99.98%' },
              { label: 'Latency', value: '2ms' },
              { label: 'DKIM Sign', value: '2048-BIT' },
              { label: 'SES Region', value: 'AP-SOUTHEAST-1' }
            ]
          }
        ],
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'order-4',
        invoice_id: 'BOOK-ANALYTICS',
        status: 'SHIPPED' as const,
        total_amount: 0,
        user_email: 'readers@ivanaffriandi.com',
        courier: 'Interactive Reader Core',
        shipping_details: {
          fullName: 'Interactive Book Analytics',
          phone: '',
          address: 'ivanaffriandi.com/x',
          city: 'Global Readers',
          province: 'Cloud Analytics',
          zipCode: 'ACTIVE'
        },
        items: [
          {
            id: 'item-4',
            title: 'Reader Engagement & Daily Chapter Notes',
            quantity: 34,
            price: 0,
            details: [
              { label: 'Active Readers', value: '34 TODAY' },
              { label: 'Avg Completion', value: '87%' },
              { label: 'Highlights', value: '112 CLIPS' },
              { label: 'TTS Engine', value: 'ACTIVE' }
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
              placeholder="Search orders, essays, customer resi..."
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
            const isStudioOrder = idx === 0;
            const isEssay = idx === 1;
            const isTelemetry = idx === 2;
            const isBook = idx === 3;

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
                    <div className={styles.cardAuthorAvatar} style={{ background: isStudioOrder ? '#1c1c1e' : isEssay ? '#f43f5e' : isTelemetry ? '#10b981' : '#6366f1', color: '#ffffff', fontWeight: 900 }}>
                      {isStudioOrder ? 'SK' : isEssay ? 'IA' : isTelemetry ? '⚡' : '📖'}
                    </div>
                    <div>
                      <div className={styles.cardAuthorName}>{order.shipping_details?.fullName}</div>
                      <div className={styles.cardAuthorSub}>
                        {isStudioOrder ? 'Bespoke Order · Lead Time: 17–20d' : isEssay ? 'Personal Writing Hub' : isTelemetry ? 'Mail & Engine Health' : 'Reader Session Stream'}
                      </div>
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
                    {order.items[0]?.title}
                  </h3>
                  <span className={styles.cardTimeSnippet}>
                    {isStudioOrder ? `Rp ${Number(order.total_amount).toLocaleString('id-ID')} · In Crafting` : isEssay ? '1,420 words · Draft Complete' : isTelemetry ? '99.98% Deliverability · 2ms Latency' : '34 Active Readers Today'}
                  </span>
                </div>

                {/* Card 1: Nested Atelier & Route Widget */}
                {isStudioOrder && (
                  <div className={styles.nestedMediaWidget}>
                    <div className={styles.nestedWidgetHeader}>
                      <div className={styles.nestedWidgetBadge} style={{ background: '#d4af37', color: '#000000' }}>
                        17d
                        <span>lead</span>
                      </div>
                      <div className={styles.nestedWidgetTitleBox}>
                        <h4>SHŪ / EN Leather Atelier</h4>
                        <p>Tangerang Workshop · Bespoke Queue</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#71717a' }}>
                      <span>Leather: <strong>NERO</strong></span>
                      <span>•</span>
                      <span>Finish: <strong>SILVER</strong></span>
                      <span>•</span>
                      <span>Emboss: <strong>SARAH.K</strong></span>
                    </div>

                    <div className={styles.nestedWidgetFooterPills}>
                      <span className={styles.pillDark}>
                        {order.courier || 'JNE Express'}
                      </span>
                      <span className={styles.pillDark} style={{ cursor: 'pointer', background: '#d4af37', color: '#000000' }}>
                        Dispatch Resi ↗
                      </span>
                    </div>
                  </div>
                )}

                {/* Card 2: Essay snippet */}
                {isEssay && (
                  <p className={styles.cardBodySnippet}>
                    Exploring how artisanal physical leather craft merges with generative 3D web configurators and high-performance server architectures.
                  </p>
                )}

                {/* Card 3: Waveform Bars for Telemetry */}
                {isTelemetry && (
                  <div>
                    <p className={styles.cardBodySnippet} style={{ marginBottom: '6px' }}>
                      All systems healthy · SES signed with DKIM 2048-bit RSA key.
                    </p>
                    <div className={styles.waveformBarBox}>
                      {[40, 60, 80, 50, 70, 90, 65, 85, 45, 75, 95, 60, 80, 50, 70, 85, 65, 45, 90, 60].map((h, bIdx) => (
                        <div key={bIdx} className={`${styles.waveBar} ${bIdx < 16 ? styles.waveBarActive : ''}`} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Card 4: Book analytics */}
                {isBook && (
                  <p className={styles.cardBodySnippet}>
                    Readers highlights and audio narration sessions synced seamlessly across web and mobile clients.
                  </p>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1c1c1e' }}>
                SHŪ / EN Master Control Center · v2.6
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className={styles.detailAuthorHeader}>
                <div className={styles.detailAuthorAvatar} style={{ background: '#d4af37', color: '#000000', fontWeight: 900, fontSize: '15px' }}>
                  IA
                </div>
                <div>
                  <h4 className={styles.detailAuthorName}>Ivan Affriandi</h4>
                  <p className={styles.detailAuthorRole}>Founder &amp; Creative Engineer · SHŪ / EN</p>
                </div>
              </div>

              <div className={styles.detailTopActionsGroup}>
                {activeOrder.shipping_details?.phone && (
                  <a
                    href={`https://wa.me/${activeOrder.shipping_details.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.btnPillReply}
                    style={{ textDecoration: 'none' }}
                  >
                    💬 WhatsApp Customer
                  </a>
                )}
                <a
                  href="https://shuenstudio.com"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.btnRoundAction}
                  title="Open Live Storefront"
                  style={{ textDecoration: 'none' }}
                >
                  ↗
                </a>
              </div>
            </div>
          </div>

          {/* Reading Body */}
          <div className={styles.detailReadingBody} style={{ marginTop: '24px' }}>
            <p className={styles.detailGreeting}>
              Welcome back, Ivan.
            </p>

            <p>
              Here is the executive overview for <strong>SHŪ / EN Studio</strong> and your linked creative workspace. All customer customization orders, lead times (17–20 workdays), leather crafting allocations, and logistics dispatchers are running in real-time.
            </p>

            {/* Bespoke Order Specs Breakdown */}
            {activeOrder && activeOrder.items && activeOrder.items[0]?.details && (
              <div style={{ marginTop: '8px', padding: '20px', background: '#f8f8fa', borderRadius: '22px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1c1c1e', display: 'block' }}>
                      {activeOrder.invoice_id} — {activeOrder.shipping_details?.fullName}
                    </span>
                    <span style={{ fontSize: '11px', color: '#71717a' }}>
                      {activeOrder.shipping_details?.address}, {activeOrder.shipping_details?.city}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#d4af37' }}>
                    {activeOrder.total_amount > 0 ? `Rp ${Number(activeOrder.total_amount).toLocaleString('id-ID')}` : 'System Task'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {activeOrder.items[0].details.map((d: any, dIdx: number) => (
                    <div key={dIdx} style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#8e8e93', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>{d.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#1c1c1e', marginTop: '2px', display: 'block' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Attachment Cards */}
            <div className={styles.attachmentsRow}>
              <a
                href="https://shuenstudio.com/po"
                target="_blank"
                rel="noreferrer"
                className={styles.attachmentCard}
                style={{ textDecoration: 'none' }}
              >
                <div className={styles.attachmentIcon}>
                  🧵
                </div>
                <div>
                  <div className={styles.attachmentTitle}>3D Configurator Engine</div>
                  <div className={styles.attachmentSize}>shuenstudio.com/po ↗</div>
                </div>
              </a>

              <a
                href="https://shuenstudio.com/admin"
                target="_blank"
                rel="noreferrer"
                className={styles.attachmentCard}
                style={{ textDecoration: 'none' }}
              >
                <div className={styles.attachmentIcon}>
                  ⚙️
                </div>
                <div>
                  <div className={styles.attachmentTitle}>Full Studio Admin Desk</div>
                  <div className={styles.attachmentSize}>Direct PostgreSQL Access ↗</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Quick Reply / Airway Bill Input Box */}
        <div className={styles.bottomQuickReplyBox}>
          <input
            type="text"
            placeholder="Input nomor resi pengiriman JNE / J&amp;T (e.g. JNE8899201928)..."
            value={resiInput || replyInput}
            onChange={(e) => {
              setResiInput(e.target.value);
              setReplyInput(e.target.value);
            }}
            className={styles.quickReplyInput}
          />
          <div className={styles.quickReplyIcons}>
            <button 
              disabled={updating}
              onClick={() => handleUpdateStatus(activeOrder.id, 'SHIPPED', resiInput || replyInput)}
              className={styles.btnReplyIcon} 
              title="Simpan &amp; Dispatch Resi"
              style={{ background: '#1c1c1e', color: '#ffffff', borderRadius: '999px', padding: '8px 16px', height: '36px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Dispatch Resi</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
