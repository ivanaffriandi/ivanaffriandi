// Blocked IPs library — uses /api/blocked-ips server route (Firebase Realtime DB)

export interface BlockedIP {
  id: string;
  ip: string;
  note?: string;
  blockedAt?: string;
}

// 1. Get all blocked IPs
export async function getBlockedIPs(): Promise<BlockedIP[]> {
  try {
    const res = await fetch("/api/blocked-ips", { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error("Failed to load blocked IPs client side:", err);
    return [];
  }
}

// 2. Block a new IP
export async function addBlockedIP(ip: string, note?: string): Promise<BlockedIP | null> {
  try {
    const res = await fetch("/api/blocked-ips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, note })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to block IP");
    }
    return res.json();
  } catch (err: any) {
    console.error("Failed to add blocked IP client side:", err);
    throw err;
  }
}

// 3. Unblock an IP (Delete block record)
export async function deleteBlockedIP(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/blocked-ips?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to delete blocked IP client side:", err);
    return false;
  }
}
