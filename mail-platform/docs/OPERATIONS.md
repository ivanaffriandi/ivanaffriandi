# Production Operations & Maintenance Runbook

## 1. Daily Operations & System Checks

```bash
# Check container status and resource usage
make status
docker stats

# Inspect aggregated system logs
make logs

# Inspect Postfix queue depth
docker exec mail_postfix mailq
```

---

## 2. Rspamd Spam & Training Management

To train Rspamd Bayesian classifier on misclassified emails:

```bash
# Train message as Spam
docker exec -i mail_rspamd rspamc learn_spam < /path/to/spam_message.eml

# Train message as Legitimate (Ham)
docker exec -i mail_rspamd rspamc learn_ham < /path/to/ham_message.eml
```

---

## 3. Monitoring & Grafana Dashboards

Prometheus collects metrics at `/api/v1/stats/metrics`.
Grafana runs on port 3000 (accessible via proxy / admin tunnel) with pre-provisioned dashboards:
- **System Health**: CPU, RAM, Disk I/O, Database Pool Connection metrics.
- **Mail Delivery Queues**: Inbound volume, outbound volume, delivery latency, bounce counts.
- **Security Audit**: Failed login attempts, malware detections, Rspamd score distribution.
