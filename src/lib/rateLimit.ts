type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Purge les fenetres expirees quand la map grossit, pour borner la memoire. */
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: boolean; retryAfter: number };

/**
 * Limiteur de debit a fenetre fixe, en memoire du processus.
 * Suffisant pour un deploiement mono-instance (Hostinger).
 * A remplacer par Upstash/Redis le jour ou le site tourne sur plusieurs instances.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count++;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Remet le compteur a zero (ex: connexion admin reussie). */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

export function clientIp(req: Request): string {
  const h = req.headers;
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * Rejette les requetes cross-origin emises par un navigateur.
 * Origin absent (curl, app native) => on laisse passer, le rate limit prend le relais.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function tooManyRequests(retryAfter: number) {
  return new Response(JSON.stringify({ error: "Trop de requetes, reessayez dans un instant." }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) },
  });
}
