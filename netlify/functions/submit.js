const crypto = require("crypto");

const RL_LIMIT = 8;      // max submissions per network (hashed IP) per window — generous so station-mates sharing one connection aren't blocked
const RL_WINDOW = 3600;  // seconds

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

const ALLOWED_ORIGINS = ["https://mauifirepulse.com", "https://www.mauifirepulse.com"];
const corsOrigin = (event) => {
  const o = event.headers && (event.headers.origin || event.headers.Origin);
  return ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
};
const clientIp = (event) => {
  const h = event.headers || {};
  return h["x-nf-client-connection-ip"] || (h["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
};
// One-way hash, used ONLY as an ephemeral rate-limit counter key — never stored with a response, so responses stay anonymous.
const ipHash = (ip) => crypto.createHash("sha256").update("mfd:" + ip).digest("hex").slice(0, 16);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": corsOrigin(event),
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Storage not configured. Add Upstash env vars in Netlify." }) };
  }

  // Reject oversized payloads (junk / storage abuse)
  if (event.body && event.body.length > 20000) {
    return { statusCode: 413, headers, body: JSON.stringify({ error: "Payload too large" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }
  if (body.surveyType !== "ranked" && body.surveyType !== "ff1") {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid surveyType" }) };
  }
  const type = body.surveyType;

  // ── Bot / flood limit: generous per-network cap. FAIL-OPEN — an infra hiccup must never block a real member. ──
  try {
    const rlKey = `r4r:rl:${ipHash(clientIp(event))}`;
    const count = await redis("INCR", rlKey);
    if (count === 1) await redis("EXPIRE", rlKey, RL_WINDOW);
    if (typeof count === "number" && count > RL_LIMIT) {
      return { statusCode: 429, headers, body: JSON.stringify({ error: "Too many submissions from this network. Please try again later." }) };
    }
  } catch (e) {
    console.error("Rate-limit check failed (allowing submission):", e);
  }

  try {
    const key = `r4r:${type}:${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    await redis("SET", key, JSON.stringify({ ...body, ts: new Date().toISOString() }));
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("Submit error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
