

export default async function handler(req, res) {

    const apiKey = process.env.AETHERIS_WEATHER_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Weather API key not configured on server.' });
    }

    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ error: 'City parameter is required.' });
    }

    const weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&days=3&aqi=no&alerts=no`;

    try {
        const fetchResponse = await fetch(weatherApiUrl, {
             // Pass the city in the request body as a POST request
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ q: city }),
        });
        const data = await fetchResponse.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Weather API Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch weather data.' });
    }
}