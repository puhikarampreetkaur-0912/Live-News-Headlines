module.exports = async(req, res) => {
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
    token: apiKey
});

if (lang !== "pa" && lang !== "es") {
    params.set("country", "in");
}

        const url = `https://gnews.io/api/v4/top-headlines?${params}`;

        const response = await fetch(url);
        const data = await response.json();

        return res.status(response.status).json(data);

    } catch (error) {
        return res.status(500).json({
            error: "Unable to fetch news",
            details: error.message
        });
    }
};
