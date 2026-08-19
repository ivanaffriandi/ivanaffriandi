# Email Deliverability & Reputation Engineering Guide

## 1. Deliverability Pillars

Building and maintaining high inbox placement for `hello@ivanaffriandi.com` relies on strictly adhering to modern email deliverability standards:

1. **Reverse DNS (PTR)**: The public IPv4/IPv6 address of `mail.ivanaffriandi.com` MUST have a matching PTR record resolving to `mail.ivanaffriandi.com`.
2. **HELO/EHLO Hostname Alignment**: Postfix `myhostname` is explicitly configured as `mail.ivanaffriandi.com`.
3. **SPF Policy**: Strict SPF record permitting only authorized server IP addresses (`~all` initial, escalating to `-all`).
4. **DKIM 2048-Bit RSA**: All outbound emails are signed by Rspamd using selector `202608mail`.
5. **DMARC Policy Escalation**: Staged policy transition path (`p=none` ➔ `p=quarantine` ➔ `p=reject`).

---

## 2. DMARC Escalation Pathway

| Phase | Policy | Duration | Objective |
| :--- | :--- | :--- | :--- |
| **Phase 1: Monitoring** | `v=DMARC1; p=none; rua=mailto:dmarc-reports@ivanaffriandi.com;` | 14 Days | Collect aggregate reports; verify legitimate sending IP. |
| **Phase 2: Quarantine** | `v=DMARC1; p=quarantine; pct=100; rua=...;` | 30 Days | Instruct receiving MTAs to send non-aligned mail to Spam. |
| **Phase 3: Strict Reject**| `v=DMARC1; p=reject; adkim=s; aspf=s; rua=...;` | Permanent | Block unauthorized spoofing attempts globally. |

---

## 3. Deliverability Monitoring Dashboard

The Webmail UI includes a real-time **Deliverability & Security** modal tracking:
- SPF / DKIM alignment percentage
- Hard & Soft bounce rates
- Destination-domain response codes (Gmail, Outlook, iCloud)
- IP Blacklist (RBL / DNSBL) monitoring
