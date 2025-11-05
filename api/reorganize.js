

import { Redis } from '@upstash/redis';


const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const MAX_REQUESTS_PER_IP = 10;     
const WINDOW_SECONDS = 60 * 60; 


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }


  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const key = `ratelimit:reorganize:${ip}`; 

  try {
    const current = await redis.get(key);
    if (current !== null && parseInt(current) >= MAX_REQUESTS_PER_IP) {
      return res.status(429).json({ error: 'Too many reorganization requests. Try again later.' });
    }
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    if (current === null) pipeline.expire(key, WINDOW_SECONDS);
    await pipeline.exec();
  } catch (err) {
    console.error("Redis error in Reorganize API:", err);

  }

  const { currentLayout, viewport, userPrompt } = req.body;
  if (!currentLayout || !viewport || !userPrompt) {
    return res.status(400).json({ error: 'Missing required parameters for reorganization.' });
  }

  const prompt = `You are an expert UI/UX layout designer for a dashboard called Aetheris. Your task is to reorganize a user's widgets based on their request.
  - The dashboard is a grid that is 12 columns wide.
  - The user's screen size is ${viewport.width}px wide by ${viewport.height}px tall.
  - You must only change the x, y, w (width), and h (height) properties for the widgets provided. Do NOT add or remove any widgets.
  - Do NOT allow widgets to overlap. The sum of a widget's x and w cannot exceed 12.
  
  --- WIDGET GUIDE ---
  This guide describes the nature of each widget. Use this information to make intelligent layout decisions.
  - 'greeting': A wide, short banner widget. Best placed at the top (y: 0) with a large width (e.g., w: 12).
  - 'clock': A small, compact, squarish widget. Flexible position. (e.g., w: 4, h: 2).
  - 'weather': A small, compact, squarish widget, similar to the clock. (e.g., w: 4, h: 2).
  - 'todo': A TALL, vertical widget. It needs more height (h) than width (w) to display a list of tasks. (e.g., w: 4, h: 5).
  - 'ai-chat': A LARGE, primary widget. It needs significant width and height to be usable for conversations. This is often the main widget. (e.g., w: 7, h: 5).
  --- END GUIDE ---
  
  - Prioritize the user's request, but also apply good design principles based on the Widget Guide. For example, do not give the 'todo' widget a small height.
  - Your response MUST be ONLY a single, valid JSON object in the format: { "layout": [...] }. The value for the "layout" key must be the JSON array of the new widget positions. Do not include any other text, explanations, or markdown.`;
  

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const newLayout = JSON.parse(data.choices[0].message.content);
    res.status(200).json(newLayout);

  } catch (err) {
    console.error("Reorganize GPT request failed:", err);
    res.status(500).json({ error: "Failed to generate new layout." });
  }
}