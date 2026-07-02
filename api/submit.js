// Vercel serverless function — survey submission. Ported from the Netlify
// function; storage stays in Upstash Redis (unchanged), data is untouched.
const crypto = require("crypto");

const RL_LIMIT = 8;      // max submissions per network (hashed IP) per window — generous so station-mates sharing one connection aren't blocked
const RL_WINDOW = 3600;  // seconds

// Fields we persist — the union of both survey definitions (js/survey.js, js/ff1-survey.js).
// Anything not on this list is dropped so a crafted request can't dump arbitrary keys into
// storage. Add new question ids here when the surveys change.
const ALLOWED_FIELDS = new Set([
  "surveyType",
  // ranked survey
  "rank", "workedEngine", "reached288", "hoursWorked", "shortfallReason",
  "awareRestriction", "restrictionImpact", "shiftsMissed", "awareTA", "taConsistency",
  "supportChange", "priority", "biggestChange", "otherComments",
  // ff1 survey
  "yearsOnDept", "hasTAd", "r4rAwareness", "everRelocated", "relocationTime",
  "crewSafety", "back12Burden", "easierShifts", "negativeImpact", "awareTAPolicy",
  "taExperience", "taDoubleStandard", "policyFairness", "voiceWeight", "comfortSpeakingUp",
  "ff1Change", "ff1Comments",
  // shared
  "apparatus", "priorities",
]);

// Keep only allowlisted fields and bound each value, so no single field can be huge and
// no unexpected key is stored verbatim.
function sanitize(body) {
  const out = {};
  for (const k of Object.keys(body)) {
    if (!ALLOWED_FIELDS.has(k)) continue;
    const v = body[k];
    if (typeof v === "string") out[k] = v.slice(0, 2000);
    else if (typeof v === "number" || typeof v === "boolean") out[k] = v;
    else if (Array.isArray(v)) out[k] = v.filter((x) => typeof x === "string").slice(0, 20).map((x) => x.slice(0, 200));
  }
  return out;
}

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
const corsOrigin = (req) => {
  const o = req.headers.origin;
  return ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
};
const clientIp = (req) => {
  const h = req.headers;
  return (h["x-forwarded-for"] || "").split(",")[0].trim() || h["x-real-ip"] || "unknown";
};
// One-way hash, used ONLY as an ephemeral rate-limit counter key — never stored with a response, so responses stay anonymous.
const ipHash = (ip) => crypto.createHash("sha256").update("mfd:" + ip).digest("hex").slice(0, 16);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", corsOrigin(req));
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(500).json({ error: "Storage not configured. Add Upstash env vars in Vercel." });
  }

  // Reject oversized payloads (junk / storage abuse)
  if (Number(req.headers["content-length"] || 0) > 20000) {
    return res.status(413).json({ error: "Payload too large" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body || "{}"); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
  }
  body = body || {};
  if (body.surveyType !== "ranked" && body.surveyType !== "ff1") {
    return res.status(400).json({ error: "Invalid surveyType" });
  }
  const type = body.surveyType;

  // ── Bot / flood limit: generous per-network cap. FAIL-CLOSED — if the limiter can't
  // be checked (Redis error) we reject rather than accept an unthrottled write. ──
  try {
    const rlKey = `r4r:rl:${ipHash(clientIp(req))}`;
    const count = await redis("INCR", rlKey);
    if (count === 1) await redis("EXPIRE", rlKey, RL_WINDOW);
    if (typeof count === "number" && count > RL_LIMIT) {
      return res.status(429).json({ error: "Too many submissions from this network. Please try again later." });
    }
  } catch (e) {
    console.error("Rate-limit check failed (rejecting submission):", e);
    return res.status(503).json({ error: "Service temporarily unavailable. Please try again shortly." });
  }

  try {
    const key = `r4r:${type}:${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    await redis("SET", key, JSON.stringify({ ...sanitize(body), surveyType: type, ts: new Date().toISOString() }));
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Submit error:", err);
    return res.status(500).json({ error: "Could not save your response. Please try again." });
  }
};
