// Simulated book collection
let myLibrary = JSON.parse(localStorage.getItem("myLibrary")) || [];

// Switch between sections
function showSection(sectionId) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
  if (sectionId === "librarySection") renderLibrary();
  if (sectionId === "genresSection") renderGenres();
}

// Render My Library
function renderLibrary() {
  const libraryDiv = document.getElementById("library");
  libraryDiv.innerHTML = "";
  myLibrary.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${book.thumbnail}" alt="cover"/>
      <h4>${book.title}</h4>
      <p>${book.authors}</p>
      <p><strong>${book.genre || "Unknown"}</strong></p>
    `;
    libraryDiv.appendChild(card);
  });
}

// Render Genres
function renderGenres() {
  const container = document.getElementById("genresContainer");
  container.innerHTML = "";

  const genres = {};
  myLibrary.forEach(book => {
    const genre = book.genre || "Unknown";
    if (!genres[genre]) genres[genre] = [];
    genres[genre].push(book);
  });

  for (const genre in genres) {
    const section = document.createElement("div");
    section.className = "genre-section";
    section.innerHTML = `<h3>${genre}</h3>`;

    const booksDiv = document.createElement("div");
    booksDiv.className = "genre-books";

    genres[genre].forEach(book => {
      const card = document.createElement("div");
      card.className = "book-card";
      card.innerHTML = `
        <img src="${book.thumbnail}" alt="cover"/>
        <h4>${book.title}</h4>
        <p>${book.authors}</p>
      `;
      booksDiv.appendChild(card);
    });

    section.appendChild(booksDiv);
    container.appendChild(section);
  }
}

// Search Books (Google Books API)
async function searchBook() {
  const query = document.getElementById("searchInput").value;
  if (!query) return;

  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
  const data = await res.json();

  const resultsDiv = document.getElementById("searchResults");
  resultsDiv.innerHTML = "";

  (data.items || []).forEach(item => {
    const book = {
      title: item.volumeInfo.title || "No Title",
      authors: (item.volumeInfo.authors || []).join(", "),
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || "",
      genre: item.volumeInfo.categories ? item.volumeInfo.categories[0] : "Unknown"
    };

    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${book.thumbnail}" alt="cover"/>
      <h4>${book.title}</h4>
      <p>${book.authors}</p>
      <p><strong>${book.genre}</strong></p>
      <button onclick='addBook(${JSON.stringify(book).replace(/"/g, '&quot;')})'>Add</button>
    `;
    resultsDiv.appendChild(card);
  });
}

// Add book to library
function addBook(book) {
  myLibrary.push(book);
  localStorage.setItem("myLibrary", JSON.stringify(myLibrary));
  alert(`${book.title} added to your library!`);
  renderLibrary();
}
