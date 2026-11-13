
module.exports = async (req, res) => {
    try {
        const apiKey = process.env.GNEWS_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                articles: [],
                error: "API key missing"
            });
        }

        const category = req.query.category || "general";
        const lang = req.query.lang || "en";

        // Fallback is needed only for these combinations
        const needsFallback =
            (lang === "pa" &&
                ["technology", "health"].includes(category)) ||
            (lang === "gu" && category === "technology");

        const fetchNews = async (selectedCategory) => {
            const params = new URLSearchParams({
                category: selectedCategory,
                lang: lang,
                max: "10",
                apikey: apiKey
            });

            if (lang !== "pa" && lang !== "es") {
                params.set("country", "in");
            }

            const response = await fetch(
                `https://gnews.io/api/v4/top-headlines?${params}`
            );

            const data = await response.json();

            return {
                ok: response.ok,
                data: data
            };
        };

        // First request: selected category
        const result = await fetchNews(category);

        // If API itself fails, don't waste another request
        if (!result.ok) {
            return res.status(200).json({
                articles: [],
                sourceCategory: category,
                apiUnavailable: true
            });
        }

        // If category news exists, return it
        if (result.data.articles?.length > 0) {
            return res.status(200).json({
                ...result.data,
                sourceCategory: category
            });
        }

        // Only affected language/category combinations use General fallback
        if (needsFallback) {
            const generalResult = await fetchNews("general");

            if (
                generalResult.ok &&
                generalResult.data.articles?.length > 0
            ) {
                return res.status(200).json({
                    ...generalResult.data,
                    sourceCategory: "general",
                    fallback: true
                });
            }
        }

        return res.status(200).json({
            articles: [],
            sourceCategory: category
        });

    }catch (error) {
    console.error("GNEWS ERROR:", error);

    return res.status(500).json({
        articles: [],
        error: error.message
    });

    }
};
