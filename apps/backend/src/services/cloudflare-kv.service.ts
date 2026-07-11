const BASE_URL = "https://api.cloudflare.com/client/v4";

export class CloudflareKVService {
  private readonly accountId: string;
  private readonly namespaceId: string;
  private readonly apiToken: string;

  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
    const apiToken = process.env.CLOUDFLARE_KV_API_TOKEN;

    if (!accountId || !namespaceId || !apiToken) {
      throw new Error(
        "Cloudflare KV is not configured. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_KV_NAMESPACE_ID, and CLOUDFLARE_KV_API_TOKEN.",
      );
    }

    this.accountId = accountId;
    this.namespaceId = namespaceId;
    this.apiToken = apiToken;
  }

  private url(key: string): string {
    return `${BASE_URL}/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}/values/${encodeURIComponent(key)}`;
  }

  private get headers(): Record<string, string> {
    return { Authorization: `Bearer ${this.apiToken}` };
  }

  async get(key: string): Promise<string | null> {
    const res = await fetch(this.url(key), { headers: this.headers });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`KV get failed: ${res.status} ${res.statusText}`);

    return res.text();
  }

  async getJson<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const url = this.url(key) + (ttlSeconds ? `?expiration_ttl=${ttlSeconds}` : "");

    const res = await fetch(url, {
      method: "PUT",
      headers: { ...this.headers, "Content-Type": "text/plain" },
      body: value,
    });

    if (!res.ok) throw new Error(`KV set failed: ${res.status} ${res.statusText}`);
  }

  async setJson<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    const res = await fetch(this.url(key), {
      method: "DELETE",
      headers: this.headers,
    });

    if (!res.ok) throw new Error(`KV delete failed: ${res.status} ${res.statusText}`);
  }
}

export const kv = new CloudflareKVService();