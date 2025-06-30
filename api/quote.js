

export default async function handler(req, res) {
    try {
        const response = await fetch('https://zenquotes.io/api/random');
        if (!response.ok) {
            throw new Error(`ZenQuotes API responded with status: ${response.status}`);
        }
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Quote API proxy error:", error);
        res.status(500).json({ error: 'Failed to fetch quote.' });
    }
}