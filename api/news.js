

export default async function handler(req, res) {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured on server.' });
    }


    const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&language=en&pageSize=20&apiKey=${apiKey}`;

    try {
        const fetchResponse = await fetch(newsApiUrl);
        const data = await fetchResponse.json();

        if (data.status === 'error') {
            throw new Error(data.message);
        }

        // We only send the essential data to the front-end
        const articles = data.articles.map(article => ({
            title: article.title,
            url: article.url
        }));

        res.status(200).json({ articles });

    } catch (error) {
        console.error("News API Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch news from the provider.' });
    }
}