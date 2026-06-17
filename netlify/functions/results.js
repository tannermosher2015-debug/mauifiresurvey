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

exports.handler = async () => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Storage not configured." }) };
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
