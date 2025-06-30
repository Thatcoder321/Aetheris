

export default async function handler(req, res) {
    const apiKey = process.env.AETHERIS_WEATHER_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Weather API key not configured on server.' });
    }


    const { city } = req.body;
    if (!city) {
        return res.status(400).json({ error: 'City parameter is required from the client.' });
    }


    const weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&days=3&aqi=no&alerts=no&q=${encodeURIComponent(city)}`;

    try {

        const fetchResponse = await fetch(weatherApiUrl);
        const data = await fetchResponse.json();

        if (data.error) {
            console.error("Error from WeatherAPI:", data.error.message);
            throw new Error(data.error.message);
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Full Weather API Error:", error);
        res.status(500).json({ error: 'Failed to fetch weather data.' });
    }
}