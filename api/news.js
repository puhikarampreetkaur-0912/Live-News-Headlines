
module.exports = async (req, res) => {
    try {
        const apiKey = process.env.GNEWS_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "GNews API key is missing"
            });
        }

        const category = req.query.category || "general";
        const lang = req.query.lang || "en";

        const needsFallback =
            (lang === "pa" && ["technology", "health"].includes(category)) ||
            (lang === "gu" && category === "technology");

        const fetchNews = async (selectedCategory, query = null) => {
            const params = new URLSearchParams({
                lang: lang,
                max: "10",
                apikey: apiKey
            });

            if (query) {
                params.set("q", query);
            } else {
                params.set("category", selectedCategory);
            }

            if (lang !== "pa" && lang !== "es") {
                params.set("country", "in");
            }

            const endpoint = query ? "search" : "top-headlines";

            const response = await fetch(
                `https://gnews.io/api/v4/${endpoint}?${params}`
            );

            const data = await response.json();

            return {
                ok: response.ok,
                data: data
            };
        };

        // 1. Selected category news
        let result = await fetchNews(category);

        // 2. Punjabi search fallback
        if (
            lang === "pa" &&
            ["technology", "health"].includes(category) &&
            (!result.ok || !result.data.articles?.length)
        ) {
            const query = category === "technology"
                ? "ਤਕਨਾਲੋਜੀ OR ਤਕਨੀਕ OR ਕੰਪਿਊਟਰ OR ਮੋਬਾਈਲ"
                : "ਸਿਹਤ OR ਬਿਮਾਰੀ OR ਹਸਪਤਾਲ OR ਦਵਾਈ";

            const searchResult = await fetchNews(category, query);

            if (searchResult.ok && searchResult.data.articles?.length) {
                result = searchResult;
            }
        }

        // 3. General news fallback
        if (
            needsFallback &&
            (!result.ok || !result.data.articles?.length)
        ) {
            const generalResult = await fetchNews("general");

            if (generalResult.ok && generalResult.data.articles?.length) {
                result = generalResult;
            }
        }

        // 4. Return final result
        if (!result.ok) {
            return res.status(200).json({
                articles: [],
                totalArticles: 0
            });
        }

        return res.status(200).json(result.data);

    } catch (error) {
        return res.status(200).json({
            articles: [],
            totalArticles: 0
        });
    }
};
