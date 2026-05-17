import './style.css'

// API configuratie
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

// Functie om populaire films op te halen
async function fetchPopularMovies(totalMovies = 30) {
  try {
    const pagesNeeded = Math.ceil(totalMovies / 20)
    const allMovies = []

    for (let page = 1; page <= pagesNeeded; page++) {
      const response = await fetch(
        `${API_BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      allMovies.push(...data.results)
    }

    return allMovies.slice(0, totalMovies)
  } catch (error) {
    console.error('Fout bij ophalen films:', error)
    return []
  }
}

// Functie om één film-card als HTML te maken (arrow function)
const createMovieCard = (movie) => {
  // Ternary operator: als er geen poster is, toon placeholder
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : 'https://placehold.co/500x750?text=No+Poster'

  // Jaar uit release_date halen (eerste 4 karakters)
  const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'

  // Rating afronden op 1 decimaal
  const rating = movie.vote_average.toFixed(1)

  return `
    <article class="movie-card">
      <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" />
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-meta">
          <span class="movie-year">${year}</span>
          <span class="movie-rating">⭐ ${rating}</span>
        </div>
        <p class="movie-overview">${movie.overview || 'Geen beschrijving beschikbaar.'}</p>
      </div>
    </article>
  `
}

// Functie om alle films te renderen
function renderMovies(movies) {
  const grid = document.querySelector('#movies-grid')
  // Array method .map() + template literals
  grid.innerHTML = movies.map(createMovieCard).join('')
}

// Startpunt van de app
async function init() {
  const app = document.querySelector('#app')
  app.innerHTML = `
    <header class="header">
      <h1>🎬 Movie Discovery</h1>
      <p class="subtitle">Verken de populairste films van het moment</p>
    </header>
    <main>
      <div id="movies-grid" class="movies-grid">
        <p class="loading">Films laden...</p>
      </div>
    </main>
  `

  const movies = await fetchPopularMovies(30)

  if (movies.length === 0) {
    document.querySelector('#movies-grid').innerHTML =
      '<p class="error">Geen films gevonden. Check je API key.</p>'
    return
  }

  renderMovies(movies)
}

init()
