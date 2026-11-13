
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

    cards.forEach(card => card.classList.remove("active"));
    event.currentTarget.classList.add("active");

    event.currentTarget.scrollIntoView({
        behavior: "smooth",
        inline: "center"
    });

    getNews(category);
}

// Display news using existing CSS classes
function displayNews(articles) {
    const container = document.getElementById("news-container");
    container.innerHTML = "";

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
}

async function getNews(category) {
    const container = document.getElementById("news-container");

    try {
        const response = await fetch(
            `/api/news?category=${encodeURIComponent(category)}&lang=${encodeURIComponent(currentLang)}`
        );

        const data = await response.json();
        let articles = data.articles || [];

        // Save actual General news for offline backup
        if (
            articles.length > 0 &&
            data.sourceCategory === "general"
        ) {
            localStorage.setItem(
                `generalNews_${currentLang}`,
                JSON.stringify(articles)
            );
        }

        // Display actual API news
        if (articles.length > 0) {
            displayNews(articles);
            return;
        }

    } catch (error) {
        console.log("News API unavailable:", error);
    }

    // Use previously saved REAL General news if available
    const savedNews = localStorage.getItem(
        `generalNews_${currentLang}`
    );

    if (savedNews) {
        try {
            const savedArticles = JSON.parse(savedNews);

            if (savedArticles.length > 0) {
                displayNews(savedArticles);
                return;
            }
        } catch (error) {
            console.log("Saved news unavailable");
        }
    }

    // No fake cards and no error message
    container.innerHTML = "";
}

getNews("general");
