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

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Storage not configured. Add Upstash env vars in Netlify." }) };
  }

  try {
    const body = JSON.parse(event.body);
    // Tag by survey type: r4r:ranked:* or r4r:ff1:*
    const type = body.surveyType === "ff1" ? "ff1" : "ranked";
    const key = `r4r:${type}:${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    await redis("SET", key, JSON.stringify({ ...body, ts: new Date().toISOString() }));
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("Submit error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
