import './style.css'


const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'


let allMovies = []
let currentFilters = {
  search: '',
  sort: 'popularity',
  minRating: 0
}


async function fetchPopularMovies(totalMovies = 30) {
  try {
    const pagesNeeded = Math.ceil(totalMovies / 20)
    const allFetched = []

    for (let page = 1; page <= pagesNeeded; page++) {
      const response = await fetch(
        `${API_BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      allFetched.push(...data.results)
    }

    return allFetched.slice(0, totalMovies)
  } catch (error) {
    console.error('Fout bij ophalen films:', error)
    return []
  }
}


function getFilteredMovies() {
  
  let result = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(currentFilters.search.toLowerCase())
  )

  
  result = result.filter(movie => movie.vote_average >= currentFilters.minRating)

 
  result.sort((a, b) => {
    if (currentFilters.sort === 'title') {
      return a.title.localeCompare(b.title)
    } else if (currentFilters.sort === 'rating') {
      return b.vote_average - a.vote_average
    } else if (currentFilters.sort === 'date') {
      return new Date(b.release_date) - new Date(a.release_date)
    }
    
    return b.popularity - a.popularity
  })

  return result
}


const createMovieCard = (movie) => {
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : 'https://placehold.co/500x750?text=No+Poster'
  const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'
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

function renderMovies() {
  const grid = document.querySelector('#movies-grid')
  const filtered = getFilteredMovies()
  const counter = document.querySelector('#results-counter')

  counter.textContent = `${filtered.length} film${filtered.length !== 1 ? 's' : ''} gevonden`

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty">Geen films gevonden met deze filters.</p>'
    return
  }

  grid.innerHTML = filtered.map(createMovieCard).join('')
}


function setupEventListeners() {
  
  const searchInput = document.querySelector('#search-input')
  searchInput.addEventListener('input', (event) => {
    currentFilters.search = event.target.value
    renderMovies()
  })

  
  const sortSelect = document.querySelector('#sort-select')
  sortSelect.addEventListener('change', (event) => {
    currentFilters.sort = event.target.value
    renderMovies()
  })

  
  const ratingSlider = document.querySelector('#rating-slider')
  const ratingValue = document.querySelector('#rating-value')
  ratingSlider.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value)
    currentFilters.minRating = value
    ratingValue.textContent = value.toFixed(1)
    renderMovies()
  })

  
  const resetBtn = document.querySelector('#reset-filters')
  resetBtn.addEventListener('click', () => {
    currentFilters = { search: '', sort: 'popularity', minRating: 0 }
    searchInput.value = ''
    sortSelect.value = 'popularity'
    ratingSlider.value = 0
    ratingValue.textContent = '0.0'
    renderMovies()
  })
}


async function init() {
  const app = document.querySelector('#app')
  app.innerHTML = `
    <header class="header">
      <h1>🎬 Movie Discovery</h1>
      <p class="subtitle">Verken de populairste films van het moment</p>
    </header>

    <section class="controls">
      <div class="control-group search-group">
        <label for="search-input">Zoeken</label>
        <input type="search" id="search-input" placeholder="Zoek een film op titel..." />
      </div>

      <div class="control-group">
        <label for="sort-select">Sorteer op</label>
        <select id="sort-select">
          <option value="popularity">Populariteit</option>
          <option value="title">Titel (A-Z)</option>
          <option value="rating">Rating (hoogste eerst)</option>
          <option value="date">Releasedatum (nieuwste eerst)</option>
        </select>
      </div>

      <div class="control-group">
        <label for="rating-slider">Min. rating: <span id="rating-value">0.0</span></label>
        <input type="range" id="rating-slider" min="0" max="10" step="0.5" value="0" />
      </div>

      <button id="reset-filters" class="reset-btn">Reset filters</button>
    </section>

    <p id="results-counter" class="results-counter"></p>

    <main>
      <div id="movies-grid" class="movies-grid">
        <p class="loading">Films laden...</p>
      </div>
    </main>
  `

  allMovies = await fetchPopularMovies(30)

  if (allMovies.length === 0) {
    document.querySelector('#movies-grid').innerHTML =
      '<p class="error">Geen films gevonden. Check je API key.</p>'
    return
  }

  setupEventListeners()
  renderMovies()
}

init()
