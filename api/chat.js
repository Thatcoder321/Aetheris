// This is your proven, working, dependency-free API code
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { message } = req.body; // Simpler way to get the message
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