
module.exports = async (req, res) => {
    try {
        const apiKey = process.env.GNEWS_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "API key missing" });
        }

        const category = req.query.category || "general";
        const lang = req.query.lang || "en";

        const fetchNews = async (cat, searchQuery = null) => {
            const params = new URLSearchParams({
                lang: lang,
                max: "10",
                apikey: apiKey
            });

            if (searchQuery) {
                params.set("q", searchQuery);
            } else {
                params.set("category", cat);
            }

            if (lang !== "pa" && lang !== "es") {
                params.set("country", "in");
            }

            const endpoint = searchQuery ? "search" : "top-headlines";

            const response = await fetch(
                `https://gnews.io/api/v4/${endpoint}?${params}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    data: result
                };
            }

            return result;
        };

        // First try selected category
        let data = await fetchNews(category);

        // Punjabi Technology / Health search fallback
        if (
            lang === "pa" &&
            ["technology", "health"].includes(category) &&
            (!data.articles || data.articles.length === 0)
        ) {
            const query = category === "technology"
                ? "ਤਕਨਾਲੋਜੀ OR ਤਕਨੀਕ OR ਕੰਪਿਊਟਰ OR ਮੋਬਾਈਲ"
                : "ਸਿਹਤ OR ਬਿਮਾਰੀ OR ਹਸਪਤਾਲ OR ਦਵਾਈ";

            data = await fetchNews(category, query);
        }

        // If still empty, use General news for affected languages only
        if (
            (!data.articles || data.articles.length === 0) &&
            (
                (lang === "pa" && ["technology", "health"].includes(category)) ||
                (lang === "gu" && category === "technology")
            )
        ) {
            data = await fetchNews("general");
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(error.status || 500).json(
            error.data || {
                error: "Unable to fetch news",
                details: error.message
            }
        );
    }
};
