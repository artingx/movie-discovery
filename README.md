# 🎬 Movie Discovery

Een interactieve Single Page Application gebouwd voor het vak **Web Advanced**. Deze applicatie laat gebruikers de populairste films verkennen via de TMDB API, met filteren, zoeken, sorteren en het opslaan van favorieten.

🔗 **Live demo:** https://movie-discovery-sepia.vercel.app/
📂 **GitHub:** https://github.com/artingx/movie-discovery

---

## 📑 Inhoud

- [Functionaliteiten](#-functionaliteiten)
- [API](#-api)
- [Installatie](#-installatie)
- [Folderstructuur](#-folderstructuur)
- [Technische vereisten](#-technische-vereisten)
- [Screenshots](#-screenshots)
- [Bronnen](#-bronnen)
- [AI-log](#-ai-log)

---

## ✨ Functionaliteiten

### Dataverzameling & -weergave
- 30 films opgehaald via de TMDB API (verdeeld over 2 paginas)
- Grid-weergave met poster, titel, jaar, rating, beschrijving en favoriet-knop (6 elementen per kaart)
- Detail-modal met genres, runtime, cast, tagline en trailer-link

### Interactiviteit
- 🔍 **Zoekfunctie** op filmtitel (live tijdens typen)
- 📊 **Sorteren** op populariteit, titel (A-Z), rating of releasedatum
- ⭐ **Filter** op minimum rating (slider 0-10)
- 🔄 **Reset filters** in één klik

### Personalisatie
- ❤️ **Favorieten** opslaan en verwijderen (bewaard in LocalStorage tussen sessies)
- 🌓 **Theme switcher** (dark/light mode, voorkeur bewaard)
- 📑 Aparte tab voor alleen favoriete films

### Gebruikerservaring
- Responsive design (mobiel, tablet, desktop)
- Fade-in animaties via Observer API
- Modal sluit via ESC-toets of klik buiten content
- Live form validation met visuele feedback

---

## 🌐 API

- **The Movie Database (TMDB)**: https://www.themoviedb.org/
- **Endpoint:** `https://api.themoviedb.org/3/movie/popular` (lijst)
- **Endpoint:** `https://api.themoviedb.org/3/movie/{id}` (details + cast + videos)
- **Documentation:** https://developer.themoviedb.org/docs

---

## 📦 Installatie

### Vereisten
- [Node.js](https://nodejs.org/) (v18 of hoger)
- [npm](https://www.npmjs.com/)
- Gratis TMDB API-key: https://www.themoviedb.org/signup

### Stappen

1. **Clone de repository**
```bash
   git clone https://github.com/artingx/movie-discovery.git
   cd movie-discovery
```

2. **Installeer dependencies**
```bash
   npm install
```

3. **Maak een `.env` bestand** in de root van het project:    

VITE_TMDB_API_KEY=jouw_tmdb_api_key_hier


4. **Start de dev server**
```bash
   npm run dev
```

5. **Open** [http://localhost:5173](http://localhost:5173) in je browser.

---

## 📁 Folderstructuur

movie-discovery/
├── docs/
│   ├── screenshots/        # Screenshots van de applicatie
│   └── ai-log/             # AI-chatlog
├── public/                 # Statische bestanden
├── src/
│   ├── main.js             # Hoofdlogica (alle JavaScript)
│   └── style.css           # Alle styling
├── .env                    # API-key (niet in git)
├── .gitignore
├── index.html              # Entry-point
├── package.json
├── README.md
└── vite.config.js

---

## ✅ Technische vereisten

Hieronder een overzicht van waar elk vereiste concept in de code terug te vinden is.

### DOM manipulatie
| Concept | Bestand | Locatie in code |
|---|---|---|
| Elementen selecteren (`querySelector`, `querySelectorAll`) | `src/main.js` | overal — bv. functie `renderMovies()` en `setupEventListeners()` |
| Elementen manipuleren (`innerHTML`, `textContent`, `classList`) | `src/main.js` | functies `init()`, `renderMovies()`, `openMovieModal()` |
| Events aan elementen koppelen (`addEventListener`) | `src/main.js` | functie `setupEventListeners()` |

### Modern JavaScript
| Concept | Bestand | Locatie in code |
|---|---|---|
| Constanten (`const`) | `src/main.js` | bovenaan bestand (`API_KEY`, `API_BASE_URL`, `IMAGE_BASE_URL`, `STORAGE_KEY`, `THEME_KEY`) |
| Template literals | `src/main.js` | functie `createMovieCard()` en API-URLs in `fetchPopularMovies()` |
| Iteratie over arrays (`for`, `forEach`) | `src/main.js` | `for`-loop in `fetchPopularMovies()`, `forEach` in `setupEventListeners()` en `observeCards()` |
| Array methods (`.filter`, `.map`, `.sort`, `.find`, `.some`, `.slice`, `.push`) | `src/main.js` | functies `getFilteredMovies()` en `toggleFavorite()` |
| Arrow functions | `src/main.js` | `createMovieCard = (movie) => {...}` en alle event handlers |
| Ternary operator (`? :`) | `src/main.js` | functie `createMovieCard()` (poster-fallback) en `toggleTheme()` |
| Callback functions | `src/main.js` | callbacks doorgegeven aan `addEventListener` in `setupEventListeners()` |
| Promises | `src/main.js` | impliciet via `async` functies — `fetchPopularMovies()` en `fetchMovieDetails()` geven Promises terug |
| Async / await | `src/main.js` | `async function fetchPopularMovies()`, `async function fetchMovieDetails()`, `async function init()`, `async function openMovieModal()` |
| Observer API | `src/main.js` | `IntersectionObserver` in functie `observeCards()` (fade-in animatie van cards) |

### Data & API
| Concept | Locatie |
|---|---|
| Fetch | functies `fetchPopularMovies()` en `fetchMovieDetails()` in `src/main.js` |
| JSON parsen | `await response.json()` in beide fetch-functies |
| JSON weergeven | `createMovieCard()` rendert film-objecten naar HTML |

### Opslag & validatie
| Concept | Locatie |
|---|---|
| LocalStorage | functies `getFavorites()`, `saveFavorites()`, `getTheme()`, `setTheme()` in `src/main.js` |
| Formulier validatie | functie `validateSuggestionForm()` in `src/main.js` (regex voor email + minimum lengte) |

### Styling & layout
| Concept | Locatie |
|---|---|
| HTML layout (CSS Grid + Flexbox) | `src/style.css` — selectors `.movies-grid`, `.controls`, `.modal-grid`, `.tabs` |
| Responsive design | `src/style.css` — `@media` queries onderaan |
| Gebruiksvriendelijke elementen | Hartje-knoppen (`fav-btn`), reset-knop, close-knop (`modal-close`), icoontjes (☀️ 🌙 ❤️ ⭐) |

### Tooling & structuur
- Project opgezet met **Vite**
- Gescheiden mappen: `src/` (code), `public/` (statische assets), `docs/` (documentatie + screenshots)
- Build-output: `npm run build` produceert `dist/` folder
- Meerdere commits per onderdeel en per dag (zie GitHub commit history)
- Live deployment via **Vercel** met environment variable voor API-key