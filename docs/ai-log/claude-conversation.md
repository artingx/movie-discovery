# AI Chatlog

## Tool gebruikt
- **Claude (Anthropic)** — via claude.ai
- Model: Claude Opus 4.7

## Doel van AI-gebruik
Tijdens dit project werd Claude ingezet als hulpmiddel voor:
- **Planning**: opstellen van een tijdsplanning en feature-prioritering
- **Conceptuele uitleg**: vragen over Observer API, async/await, LocalStorage-patronen, event delegation
- **Code-suggesties**: opvragen van voorbeeldstructuren voor bv. de modal en het filtersysteem
- **Debugging**: hulp bij foutmeldingen tijdens Vite-setup en Git-push problemen
- **Documentatie**: opzet van de README-structuur

## Belangrijke principes
- Alle code werd zelf nagelezen voor het werd toegevoegd
- Concepten die ik niet begreep heb ik teruggevraagd in mijn eigen woorden
- Code werd waar nodig aangepast om bij de rest van het project te passen
- AI werd **niet** gebruikt om de opdracht volledig te laten genereren

## Onderwerpen per sessie

### Sessie 1 — Projectopzet (22 mei)
- API-keuze: vergelijking tussen TMDB, Brussel Open Data, PokéAPI
- TMDB API-key aanvragen
- Vite project opzetten met Vanilla JavaScript
- GitHub-repo aanmaken en eerste commit
- Eerste API-call naar `/movie/popular` endpoint
- Film-grid met posters en CSS Grid layout

### Sessie 2 — Interactiviteit (22 mei)
- Zoekbalk met live filtering op titel
- Sorteer-dropdown (4 manieren)
- Rating-slider met `input` event
- Filter-logica met chained `.filter()` en `.sort()`
- Reset-knop voor alle filters

### Sessie 3 — Details + favorieten (23 mei)
- Modal-pattern voor detail-weergave
- Tweede API-call met `append_to_response` voor cast en videos
- LocalStorage-helpers (`getFavorites`, `saveFavorites`)
- Tabs voor "Alle films" vs "Favorieten"
- Event delegation op de grid-container
- ESC-toets om modal te sluiten

### Sessie 4 — Afwerking (23 - 24 mei)
- Theme switcher met `data-theme` attribuut en CSS variables
- IntersectionObserver voor fade-in animatie van cards
- Formulier-validatie met regex (email) en minimum-lengtes
- README structureren

### Sessie 5 — Deployment + documentatie (24 mei)
- Vercel deployment met environment variable
- README finetuning met locatie van elk concept
- AI-log opstellen
- Final check tegen rubriek

## Volledige chat
link: https://claude.ai/share/05d0da37-d4fb-4a07-8e1c-55ca99a9fbcf
 