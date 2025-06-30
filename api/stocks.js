

export default async function handler(req, res) {

    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Stock API key not configured.' });
    }

    const { symbols } = req.body;
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
        return res.status(400).json({ error: 'A list of stock symbols is required.' });
    }


    const symbolsToFetch = symbols.slice(0, 10);
    const stockData = [];

    try {

        await Promise.all(symbolsToFetch.map(async (symbol) => {
            const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
            const fetchResponse = await fetch(apiUrl);
            const data = await fetchResponse.json();


            if (data.c !== undefined) {
                stockData.push({
                    symbol: symbol.toUpperCase(),
                    price: parseFloat(data.c).toFixed(2),
                    change: parseFloat(data.d).toFixed(2),
                    changePercent: parseFloat(data.dp).toFixed(2)
                });
            }
        }));

        res.status(200).json({ stocks: stockData });

    } catch (error) {
        console.error("Stock API Error:", error);
        res.status(500).json({ error: 'Failed to fetch stock data.' });
    }
}