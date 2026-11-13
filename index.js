
let currentCategory = "general";
let currentLang = "en";

const cards = document.querySelectorAll(".cat-card");

function toggleTheme() {
    document.body.classList.toggle("light-mode");
}

function changeLanguage() {
    currentLang = document.getElementById("language").value;
    getNews(currentCategory);
}

function selectCategory(event, category) {
    currentCategory = category;

    cards.forEach(c => c.classList.remove("active"));
    event.currentTarget.classList.add("active");

    event.currentTarget.scrollIntoView({
        behavior: "smooth",
        inline: "center"
    });

    getNews(category);
}

// Fetch news from API
async function fetchNews(category) {
    try {
        const response = await fetch(
            `/api/news?category=${category}&lang=${currentLang}`
        );

        const data = await response.json();

        if (!response.ok) return [];

        return data.articles || [];
    } catch (error) {
        console.log("News API unavailable:", error);
        return [];
    }
}

// Demo cards only when API quota is exhausted
function showDemoNews(container) {
    const demoArticles = [
        {
            title: "Technology is transforming the way people live and work",
            description: "Explore the latest developments in technology and innovation."
        },
        {
            title: "Global developments and important events around the world",
            description: "Stay informed with this sample news preview."
        },
        {
            title: "Business and innovation continue to shape the future",
            description: "Discover important topics in business and the economy."
        }
    ];

    container.innerHTML = "";

    demoArticles.forEach(article => {
        const card = document.createElement("div");
        card.className = "news-card";

        card.innerHTML = `
            <div style="padding:15px">
                <small>DEMO NEWS PREVIEW</small>
                <h4>${article.title}</h4>
                <p>${article.description}</p>
            </div>
        `;

        container.appendChild(card);
    });
}

// Display news
async function getNews(category) {
    const container = document.getElementById("news-container");

    container.innerHTML = "";

    // First try selected category
    let articles = await fetchNews(category);

    // If category news is unavailable, try General News
    if (articles.length === 0 && category !== "general") {
        articles = await fetchNews("general");
    }

    // Show real news if available
    if (articles.length > 0) {
        articles.forEach(article => {
            const card = document.createElement("div");
            card.className = "news-card";

            const img = document.createElement("img");
            img.src = article.image || "https://via.placeholder.com/300";
            img.alt = "News image";

            const heading = document.createElement("h4");
            heading.textContent = article.title || "News";

            const link = document.createElement("a");
            link.href = article.url || "#";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Read More";

            card.appendChild(img);
            card.appendChild(heading);
            card.appendChild(link);

            container.appendChild(card);
        });

        return;
    }

    // If API is unavailable, show demo cards instead of errors
    showDemoNews(container);
}

getNews("general");
