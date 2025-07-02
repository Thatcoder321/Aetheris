import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Rate limit settings
const MAX_REQUESTS_PER_IP = 12;     
const WINDOW_SECONDS = 60 * 60;    

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown';


  const key = `ratelimit:${ip}`;

  try {
    const current = await redis.get(key);

    if (current !== null && parseInt(current) >= MAX_REQUESTS_PER_IP) {
      return res.status(429).json({ error: 'Too many requests. Try again later.' });
    }


    const pipeline = redis.pipeline();
    pipeline.incr(key);
    if (!current) pipeline.expire(key, WINDOW_SECONDS);
    await pipeline.exec();

  } catch (err) {
    console.error("Redis error:", err);
    return res.status(500).json({ error: 'Rate limiter failed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Missing message in request body' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant named Aetheris." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("GPT request failed:", err);
    res.status(500).json({ error: "Failed to communicate with GPT" });
  }
}