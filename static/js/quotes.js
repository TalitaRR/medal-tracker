const QUOTES_URL = "./data/quotes.json";
const FAVORITES_KEY = "medal-tracker-favorite-quotes-v1";

let quotes = [];
let favorites = [];

document.addEventListener("DOMContentLoaded", async () => {
    const featuredText = document.getElementById("featured-quote-text");
    const featuredAuthor = document.getElementById("featured-quote-author");
    const randomButton = document.getElementById("random-quote");
    const quotesGrid = document.getElementById("quotes-grid");
    const quoteCount = document.getElementById("quote-count");
    const errorMessage = document.getElementById("quotes-error");
    const addQuoteForm = document.getElementById("add-quote-form");
    const newQuoteText = document.getElementById("new-quote-text");
    const newQuoteAuthor = document.getElementById("new-quote-author");

    try {
        const response = await fetch(QUOTES_URL);

        if (!response.ok) {
            throw new Error("Could not load quotes.");
        }

        quotes = await response.json();
        const savedQuotes = JSON.parse(localStorage.getItem("medal-tracker-custom-quotes-v1") || "[]");
        quotes = [...quotes, ...savedQuotes];

        if (!Array.isArray(quotes)) {
            throw new Error("Invalid quotes file.");
        }

        favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");

        renderRandomQuote();
        renderQuotes();

        quoteCount.textContent = `${quotes.length} quotes`;

    } catch (error) {
        console.error(error);
        featuredText.textContent = "Inspiration is on its way.";
        featuredAuthor.textContent = "";
        quotesGrid.innerHTML = "";
        errorMessage.hidden = false;
    }

    randomButton.addEventListener("click", renderRandomQuote);

    quotesGrid.addEventListener("click", event => {
        const button = event.target.closest(".favorite-toggle");

        if (!button) return;

        const id = button.dataset.id;

        if (favorites.includes(id)) {
            favorites = favorites.filter(favorite => favorite !== id);
        } else {
            favorites.push(id);
        }

        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        renderQuotes();
    });

    function renderRandomQuote() {
        if (quotes.length === 0) return;

        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];

        featuredText.textContent = quote.text;
        featuredAuthor.textContent = quote.author
            ? `— ${quote.author}`
            : "";
    }

    function renderQuotes() {
        const columns = [
            document.getElementById("quotes-column-1"),
            document.getElementById("quotes-column-2")
        ];

        columns.forEach(column => column.innerHTML = "");

        quotes.forEach((quote, index) => {
            const id = String(quote.id);

            const image = quote.image
                ? `<img class="quote-card-image"
                        src="${escapeHtml(quote.image)}"
                        alt=""
                        loading="lazy">`
                : "";

            const card = document.createElement("article");

            card.className = "quote-card";

            card.innerHTML = `
                ${image}
    
                <div class="quote-card-content">
                    <div class="quote-card-top">
                        <span class="quote-card-mark">“</span>
                    </div>
    
                    <p class="quote-card-text">
                        ${escapeHtml(quote.text)}
                    </p>
    
                    <p class="quote-card-author">
                        ${quote.author ? `— ${escapeHtml(quote.author)}` : ""}
                    </p>
                </div>
            `;

            columns[index % 2].appendChild(card);
        });
    }

    addQuoteForm.addEventListener("submit", event => {
        event.preventDefault();

        const text = newQuoteText.value.trim();
        const author = newQuoteAuthor.value.trim();
    
        if (!text) return;

        const newQuote = {
            id: `custom-${Date.now()}`,
            text,
            author
        };

        quotes.push(newQuote);

        const savedQuotes = JSON.parse(
            localStorage.getItem("medal-tracker-custom-quotes-v1") || "[]"
        );

        savedQuotes.push(newQuote);

        localStorage.setItem(
            "medal-tracker-custom-quotes-v1",
            JSON.stringify(savedQuotes)
        );

        renderQuotes();

        quoteCount.textContent = `${quotes.length} quotes`;

        addQuoteForm.reset();
    });

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[c]));
    }
});