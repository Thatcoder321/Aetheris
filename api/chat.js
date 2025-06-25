

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


module.exports = async (req, res) => {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Get the conversation history from the front-end's request
    const { history } = req.body;

    if (!history || history.length === 0) {
      return res.status(400).json({ error: 'No message history provided.' });
    }

    const completion = await openai.chat.completions.create({
      messages: history, // Send the whole conversation for context
      model: 'gpt-4o-mini',
    });

    // Send the AI's reply message back to the front-end
    res.status(200).json({ reply: completion.choices[0].message });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to connect to the AI service.' });
  }
};