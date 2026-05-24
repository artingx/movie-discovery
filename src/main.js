import './style.css'

// === API configuratie ===
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

// === Globale state ===
let allMovies = []
let currentView = 'all'
let currentFilters = {
  search: '',
  sort: 'popularity',
  minRating: 0
}

// === LocalStorage helpers ===
const STORAGE_KEY = 'movieDiscoveryFavorites'
const THEME_KEY = 'movieDiscoveryTheme'

function getFavorites() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
}

function isFavorite(movieId) {
  return getFavorites().some(movie => movie.id === movieId)
}

function toggleFavorite(movie) {
  const favorites = getFavorites()
  const exists = favorites.find(m => m.id === movie.id)
  if (exists) {
    saveFavorites(favorites.filter(m => m.id !== movie.id))
  } else {
    favorites.push(movie)
    saveFavorites(favorites)
  }
}

// === Theme switcher ===
function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark'
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(THEME_KEY, theme)
  const btn = document.querySelector('#theme-toggle')
  if (btn) btn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark'
}

function toggleTheme() {
  const current = getTheme()
  setTheme(current === 'dark' ? 'light' : 'dark')
}

// === API calls ===
async function fetchPopularMovies(totalMovies = 30) {
  try {
    const pagesNeeded = Math.ceil(totalMovies / 20)
    const allFetched = []
    for (let page = 1; page <= pagesNeeded; page++) {
      const response = await fetch(
        `${API_BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
      )
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
      const data = await response.json()
      allFetched.push(...data.results)
    }
    return allFetched.slice(0, totalMovies)
  } catch (error) {
    console.error('Fout bij ophalen films:', error)
    return []
  }
}

async function fetchMovieDetails(movieId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=credits,videos`
    )
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Fout bij ophalen details:', error)
    return null
  }
}

// === Filtering ===
function getFilteredMovies() {
  const sourceList = currentView === 'favorites' ? getFavorites() : allMovies

  let result = sourceList.filter(movie =>
    movie.title.toLowerCase().includes(currentFilters.search.toLowerCase())
  )
  result = result.filter(movie => movie.vote_average >= currentFilters.minRating)

  result.sort((a, b) => {
    if (currentFilters.sort === 'title') return a.title.localeCompare(b.title)
    if (currentFilters.sort === 'rating') return b.vote_average - a.vote_average
    if (currentFilters.sort === 'date') return new Date(b.release_date) - new Date(a.release_date)
    return b.popularity - a.popularity
  })

  return result
}

// === Rendering ===
const createMovieCard = (movie) => {
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : 'https://placehold.co/500x750?text=No+Poster'
  const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'
  const rating = movie.vote_average.toFixed(1)
  const favClass = isFavorite(movie.id) ? 'is-favorite' : ''
  const language = movie.original_language ? movie.original_language.toUpperCase() : 'N/A'
  const voteCount = movie.vote_count ? movie.vote_count.toLocaleString() : '0'

  return `
    <article class="movie-card ${favClass}" data-movie-id="${movie.id}">
      <button class="fav-btn" data-movie-id="${movie.id}" title="Toevoegen aan favorieten">
        ${isFavorite(movie.id) ? '❤️' : '🤍'}
      </button>
      <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" />
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-meta">
          <span class="movie-year">📅 ${year}</span>
          <span class="movie-rating">⭐ ${rating}</span>
        </div>
        <div class="movie-meta-secondary">
          <span class="movie-language">🌐 ${language}</span>
          <span class="movie-votes">👥 ${voteCount}</span>
        </div>
        <p class="movie-overview">${movie.overview || 'Geen beschrijving beschikbaar.'}</p>
      </div>
    </article>
  `
}


// === Observer API: fade-in cards als ze in beeld komen ===
function observeCards() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.movie-card').forEach(card => {
    observer.observe(card)
  })
}

function renderMovies() {
  const grid = document.querySelector('#movies-grid')
  const filtered = getFilteredMovies()
  const counter = document.querySelector('#results-counter')

  counter.textContent = `${filtered.length} film${filtered.length !== 1 ? 's' : ''} gevonden`

  if (filtered.length === 0) {
    const emptyMessage = currentView === 'favorites'
      ? 'Je hebt nog geen favorieten. Klik op het hartje bij een film om hem toe te voegen!'
      : 'Geen films gevonden met deze filters.'
    grid.innerHTML = `<p class="empty">${emptyMessage}</p>`
    return
  }

  grid.innerHTML = filtered.map(createMovieCard).join('')
  observeCards()
}

// === Modal voor details ===
async function openMovieModal(movieId) {
  const modal = document.querySelector('#movie-modal')
  const modalContent = document.querySelector('#modal-content')

  modal.classList.add('open')
  modalContent.innerHTML = '<p class="loading">Details laden...</p>'

  const details = await fetchMovieDetails(movieId)

  if (!details) {
    modalContent.innerHTML = '<p class="error">Kon details niet ophalen.</p>'
    return
  }

  const posterUrl = details.poster_path
    ? `${IMAGE_BASE_URL}${details.poster_path}`
    : 'https://placehold.co/500x750?text=No+Poster'

  const genres = details.genres.map(g => g.name).join(', ') || 'Onbekend'
  const runtime = details.runtime ? `${details.runtime} min` : 'Onbekend'
  const cast = details.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'Onbekend'
  const trailer = details.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
  const favText = isFavorite(details.id) ? '❤️ Verwijder uit favorieten' : '🤍 Voeg toe aan favorieten'

  modalContent.innerHTML = `
    <button class="modal-close" id="modal-close">✕</button>
    <div class="modal-grid">
      <img src="${posterUrl}" alt="${details.title}" class="modal-poster" />
      <div class="modal-info">
        <h2>${details.title}</h2>
        <p class="modal-tagline">${details.tagline || ''}</p>
        <div class="modal-stats">
          <span>📅 ${details.release_date || 'N/A'}</span>
          <span>⭐ ${details.vote_average.toFixed(1)}</span>
          <span>⏱ ${runtime}</span>
        </div>
        <p class="modal-genres"><strong>Genres:</strong> ${genres}</p>
        <p class="modal-cast"><strong>Cast:</strong> ${cast}</p>
        <p class="modal-overview">${details.overview || 'Geen beschrijving beschikbaar.'}</p>
        <div class="modal-actions">
          <button class="fav-btn-big" data-movie-id="${details.id}">${favText}</button>
          ${trailer ? `<a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank" class="trailer-btn">▶ Trailer</a>` : ''}
        </div>
      </div>
    </div>
  `

  document.querySelector('#modal-close').addEventListener('click', closeMovieModal)
  document.querySelector('.fav-btn-big').addEventListener('click', () => {
    toggleFavorite({
      id: details.id,
      title: details.title,
      poster_path: details.poster_path,
      release_date: details.release_date,
      vote_average: details.vote_average,
      overview: details.overview,
      popularity: details.popularity
    })
    openMovieModal(movieId)
    renderMovies()
  })
}

function closeMovieModal() {
  document.querySelector('#movie-modal').classList.remove('open')
}

// === Suggestion form validation ===
function validateSuggestionForm() {
  const name = document.querySelector('#sug-name')
  const email = document.querySelector('#sug-email')
  const movie = document.querySelector('#sug-movie')
  const feedback = document.querySelector('#form-feedback')

  // Reset visuele feedback
  ;[name, email, movie].forEach(input => input.classList.remove('invalid'))
  feedback.textContent = ''
  feedback.className = 'form-feedback'

  const errors = []

  // Naam: minstens 2 karakters
  if (name.value.trim().length < 2) {
    errors.push('Naam moet minstens 2 karakters bevatten.')
    name.classList.add('invalid')
  }

  // Email: regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    errors.push('Geef een geldig email-adres in.')
    email.classList.add('invalid')
  }

  // Film: minstens 2 karakters
  if (movie.value.trim().length < 2) {
    errors.push('Geef een filmtitel in.')
    movie.classList.add('invalid')
  }

  if (errors.length > 0) {
    feedback.innerHTML = errors.map(e => `• ${e}`).join('<br>')
    feedback.classList.add('error')
    return false
  }

  feedback.textContent = `✓ Bedankt ${name.value.trim()}! We bekijken je suggestie "${movie.value.trim()}".`
  feedback.classList.add('success')
  name.value = ''
  email.value = ''
  movie.value = ''
  return true
}

// === Event handlers ===
function setupEventListeners() {
  document.querySelector('#search-input').addEventListener('input', (event) => {
    currentFilters.search = event.target.value
    renderMovies()
  })

  document.querySelector('#sort-select').addEventListener('change', (event) => {
    currentFilters.sort = event.target.value
    renderMovies()
  })

  const ratingSlider = document.querySelector('#rating-slider')
  const ratingValue = document.querySelector('#rating-value')
  ratingSlider.addEventListener('input', (event) => {
    currentFilters.minRating = parseFloat(event.target.value)
    ratingValue.textContent = currentFilters.minRating.toFixed(1)
    renderMovies()
  })

  document.querySelector('#reset-filters').addEventListener('click', () => {
    currentFilters = { search: '', sort: 'popularity', minRating: 0 }
    document.querySelector('#search-input').value = ''
    document.querySelector('#sort-select').value = 'popularity'
    ratingSlider.value = 0
    ratingValue.textContent = '0.0'
    renderMovies()
  })

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      currentView = btn.dataset.view
      renderMovies()
    })
  })

  document.querySelector('#movies-grid').addEventListener('click', (event) => {
    const favBtn = event.target.closest('.fav-btn')
    const card = event.target.closest('.movie-card')

    if (favBtn) {
      event.stopPropagation()
      const movieId = parseInt(favBtn.dataset.movieId)
      const movie = allMovies.find(m => m.id === movieId) || getFavorites().find(m => m.id === movieId)
      if (movie) {
        toggleFavorite(movie)
        renderMovies()
      }
      return
    }

    if (card) {
      const movieId = parseInt(card.dataset.movieId)
      openMovieModal(movieId)
    }
  })

  document.querySelector('#movie-modal').addEventListener('click', (event) => {
    if (event.target.id === 'movie-modal') closeMovieModal()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMovieModal()
  })

  // Theme toggle
  document.querySelector('#theme-toggle').addEventListener('click', toggleTheme)

  // Suggestion form
  document.querySelector('#suggestion-form').addEventListener('submit', (event) => {
    event.preventDefault()
    validateSuggestionForm()
  })
}

// === Init ===
async function init() {
  const app = document.querySelector('#app')
  app.innerHTML = `
    <header class="header">
      <div class="header-top">
        <h1>🎬 Movie Discovery</h1>
        <button id="theme-toggle" class="theme-btn">☀️ Light</button>
      </div>
      <p class="subtitle">Verken de populairste films van het moment</p>
    </header>

    <nav class="tabs">
      <button class="tab-btn active" data-view="all">Alle films</button>
      <button class="tab-btn" data-view="favorites">❤️ Favorieten</button>
    </nav>

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

    <section class="suggestion-section">
      <h2>💡 Suggereer een film</h2>
      <p class="suggestion-intro">Mis je een film? Laat het ons weten!</p>
      <form id="suggestion-form" class="suggestion-form" novalidate>
        <div class="form-row">
          <label for="sug-name">Naam *</label>
          <input type="text" id="sug-name" placeholder="Jouw naam" required minlength="2" />
        </div>
        <div class="form-row">
          <label for="sug-email">Email *</label>
          <input type="email" id="sug-email" placeholder="jouw@email.be" required />
        </div>
        <div class="form-row">
          <label for="sug-movie">Film titel *</label>
          <input type="text" id="sug-movie" placeholder="Bijv. Inception" required minlength="2" />
        </div>
        <button type="submit" class="submit-btn">Verstuur suggestie</button>
        <p id="form-feedback" class="form-feedback"></p>
      </form>
    </section>

    <div id="movie-modal" class="modal">
      <div id="modal-content" class="modal-content"></div>
    </div>
  `

  setTheme(getTheme())
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
