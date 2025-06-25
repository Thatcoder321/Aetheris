// This file uses the modern ES Module 'import' syntax.
import OpenAI from 'openai';

// Initialize the OpenAI client with the secret key from Vercel's environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This is the main handler function for the Vercel serverless environment
export default async function handler(req, res) {
  // We only allow POST requests for security
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // The front-end now sends a simple 'message' string
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'No message provided.' });
    }

    // We can build the history here on the server for simplicity
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful and concise assistant.' },
        { role: 'user', content: message }
      ],
      model: 'gpt-4o-mini',
    });

    // Send the AI's response content directly back to the front-end
    res.status(200).json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to connect to the AI service.' });
  }
}