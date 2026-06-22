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
const corsOrigin = (event) => {
  const o = event.headers && (event.headers.origin || event.headers.Origin);
  return ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
};

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": corsOrigin(event),
    "Access-Control-Allow-Headers": "Content-Type, x-member-pass",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Storage not configured." }) };
  }

  // ── Members-only gate ──
  // Protection activates only once MEMBER_PASSWORD is set in Netlify env vars.
  // Until then this behaves exactly as before (open) so deploying never locks members out.
  const required = process.env.MEMBER_PASSWORD;
  const provided = (event.headers && (event.headers["x-member-pass"] || event.headers["X-Member-Pass"])) || "";
  if (required && provided !== required) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Members only — enter the member password." }) };
  }

  // Lightweight credential check for the login screen (no payload).
  if (event.queryStringParameters && event.queryStringParameters.check) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  try {
    const [ranked, ff1] = await Promise.all([
      fetchByPrefix("ranked"),
      fetchByPrefix("ff1"),
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ranked,
        ff1,
        totalRanked: ranked.length,
        totalFF1: ff1.length,
        total: ranked.length + ff1.length,
      }),
    };
  } catch (err) {
    console.error("Results error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
