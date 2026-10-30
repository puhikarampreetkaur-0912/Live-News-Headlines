const apikey = "faf493a6f72a5a48f42b1211b8ef1ec6";
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

function getNews(category) {

    fetch(`/api/news?category=${category}&lang=${currentLang}`)
        .then(res => res.json())
        .then(data => {

            const container = document.getElementById("news-container");
            container.innerHTML = "";

            // ✅ HANDLE ERROR
            if (!data.articles || data.articles.length === 0) {
                container.innerHTML = "<h2 style='color:white'>⚠️ No news found (API limit / language issue)</h2>";
                return;
            }

            data.articles.forEach(article => {

                const card = document.createElement("div");
                card.className = "news-card";

                card.innerHTML = `
                    <img src="${article.image || 'https://via.placeholder.com/300'}">
                    <h4>${article.title}</h4>
                    <a href="${article.url}" target="_blank">Read More</a>
                `;

                container.appendChild(card);
            });

        })
        .catch(err => {
            console.log(err);
            document.getElementById("news-container").innerHTML =
                "<h2 style='color:red'>❌ Error loading news</h2>";
        });
}


//git test 

getNews("general");