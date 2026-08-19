# Domain & DNS Configuration Guide (`ivanaffriandi.com`)

## 1. Master DNS Records Specification Table

Replace `<SERVER_IP>` with your public VPS IPv4 address and `<SERVER_IPV6>` with your IPv6 address.

| Record Type | Name / Host | Value / Target | TTL | Description |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `mail` | `129.225.6.139` | Auto / 300 | Mail server IPv4 address (DNS only, no orange cloud) |
| **MX** | `@` | `mail.ivanaffriandi.com` (Priority: 10) | Auto / 300 | Primary Mail Exchange server |
| **TXT (SPF)** | `@` | `v=spf1 ip4:129.225.6.139 ~all` | Auto / 300 | Sender Policy Framework |
| **TXT (DKIM)**| `202608mail._domainkey` | `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6cSwEjy+OSpG3CprtF/jEHTy0vphfjqBnb7hrCXloZ83qK6wuF8WsjnE5VWiRvGVKYy0GWVUKIybfQJrUM9/l/fm6ggn6gT2JLnLkmXkM+hEx3uHuiY+cZG1daKRX1y4kKBLVVtiKOqNv4dmc2eWxtM9CQmikIpLrtBd5+4Df0tU9rv2XlYwEaYxw+XIhhVN9I5vnFTki/OyoNFUm+YXU4+oV69alLPal1BNC4bvkSduYFEpzQ569ykWMKAfj/kOyJmt6cS8JqS9ztwDuqVaa7/P9EphCAvxAhGwBlBA0LliL9Zzi7hL7lU6PaBh+pVch2KyodMnhpg2VmJtojYQBwIDAQAB` | Auto / 300 | 2048-bit RSA DKIM Public Key |
| **TXT (DMARC)**| `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@ivanaffriandi.com;` | Auto / 300 | DMARC Policy & Report Destination |
| **PTR (rDNS)**| `129.225.6.139` | `mail.ivanaffriandi.com` | Configured at VPS host | Reverse DNS PTR Record |

---

## 2. Zero-Downtime Migration Strategy from Lark Mailbox

To transition `hello@ivanaffriandi.com` from Lark to self-hosted infrastructure without mail loss:

1. **Step 1**: Provision new mail infrastructure at `mail.ivanaffriandi.com`. Test outbound sending to check-mail tools.
2. **Step 2**: Update SPF record to allow both servers temporarily:
   `v=spf1 ip4:<SERVER_IP> include:spf.larksuite.com ~all`
3. **Step 3**: Synchronize historical emails from Lark IMAP to Dovecot using `imapsync`.
4. **Step 4**: Update MX record to point to `10 mail.ivanaffriandi.com.`.
5. **Step 5**: After 48 hours of verifying inbound flow on Dovecot, remove Lark from SPF.
