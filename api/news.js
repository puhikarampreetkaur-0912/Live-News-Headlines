
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

        const params = new URLSearchParams({
            category: category,
            lang: lang,
            apikey: apiKey
        });

        if (lang !== "pa" && lang !== "es") {
            params.set("country", "in");
        }

        // First try normal category headlines
        const url =
            `https://gnews.io/api/v4/top-headlines?${params}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // Punjabi Technology and Health search fallback
        if (
            lang === "pa" &&
            ["technology", "health"].includes(category) &&
            (!data.articles || data.articles.length === 0)
        ) {
            const query =
                category === "technology"
                    ? "ਤਕਨਾਲੋਜੀ OR ਤਕਨੀਕ OR ਕੰਪਿਊਟਰ OR ਮੋਬਾਈਲ"
                    : "ਸਿਹਤ OR ਬਿਮਾਰੀ OR ਹਸਪਤਾਲ OR ਦਵਾਈ";

            const searchParams = new URLSearchParams({
                q: query,
                lang: "pa",
                max: "10",
                apikey: apiKey
            });

            const searchResponse = await fetch(
                `https://gnews.io/api/v4/search?${searchParams}`
            );

            const searchData = await searchResponse.json();

            if (!searchResponse.ok) {
                return res.status(searchResponse.status).json(searchData);
            }

            // If Punjabi search has news, show it
            if (searchData.articles && searchData.articles.length > 0) {
                return res.status(200).json(searchData);
            }
        }

        // General news fallback for only the affected categories
        const needsGeneralFallback =
            (lang === "pa" &&
                ["technology", "health"].includes(category)) ||
            (lang === "gu" && category === "technology");

        if (
            needsGeneralFallback &&
            (!data.articles || data.articles.length === 0)
        ) {
            const generalParams = new URLSearchParams({
                category: "general",
                lang: lang,
                apikey: apiKey
            });

            if (lang !== "pa" && lang !== "es") {
                generalParams.set("country", "in");
            }

            const generalResponse = await fetch(
                `https://gnews.io/api/v4/top-headlines?${generalParams}`
            );

            const generalData = await generalResponse.json();

            if (!generalResponse.ok) {
                return res.status(generalResponse.status).json(generalData);
            }

            return res.status(200).json(generalData);
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({
            error: "Unable to fetch news",
            details: error.message
        });
    }
};
