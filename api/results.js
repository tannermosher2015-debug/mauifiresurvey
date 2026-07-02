// Vercel serverless function — survey results (members-only). Ported from the
// Netlify function; reads the same Upstash Redis keys, data untouched.
const redis = async (...args) => {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const data = await res.json();
  return data.result;
};

const fetchByPrefix = async (prefix) => {
  const keys = await redis("KEYS", `r4r:${prefix}:*`);
  if (!keys || keys.length === 0) return [];
  const values = await redis("MGET", ...keys);
  return values
    .filter(Boolean)
    .map((v) => { try { return JSON.parse(v); } catch { return null; } })
    .filter(Boolean);
};

const ALLOWED_ORIGINS = ["https://mauifirepulse.com", "https://www.mauifirepulse.com"];
const corsOrigin = (req) => {
  const o = req.headers.origin;
  return ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", corsOrigin(req));
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-member-pass");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(500).json({ error: "Storage not configured." });
  }

  // ── Members-only gate (FAIL-CLOSED) ──
  // If MEMBER_PASSWORD is not configured, refuse to serve results rather than exposing
  // them publicly. Once set, the caller must present the matching x-member-pass header.
  const required = process.env.MEMBER_PASSWORD;
  if (!required) {
    return res.status(500).json({ error: "Results are not configured yet." });
  }
  const provided = req.headers["x-member-pass"] || "";
  if (provided !== required) {
    return res.status(401).json({ error: "Members only. Enter the member password." });
  }

  // Lightweight credential check for the login screen (no payload).
  if (req.query && req.query.check) {
    return res.status(200).json({ ok: true });
  }

  try {
    const [ranked, ff1] = await Promise.all([
      fetchByPrefix("ranked"),
      fetchByPrefix("ff1"),
    ]);

    return res.status(200).json({
      ranked,
      ff1,
      totalRanked: ranked.length,
      totalFF1: ff1.length,
      total: ranked.length + ff1.length,
    });
  } catch (err) {
    console.error("Results error:", err);
    return res.status(500).json({ error: "Could not load results. Please try again." });
  }
};
