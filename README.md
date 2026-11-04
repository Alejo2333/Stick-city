Stick City
A browser-based open-world life simulation game built with HTML, CSS, and vanilla JavaScript.
Features
- Explore the city and interact with characters
- Work, earn money, and buy homes, vehicles, and items
- Complete missions and unlock achievements
- Use an in-game phone, including a link to the developer's GitHub
- Create a life from birth and age up one year with each in-game day, building relationships, education, a career, assets, and a legacy
- Review one combined daily life report with market headlines, business and rental income, bank interest, investment gains or losses, stat changes, and a price graph for each stock or coin you own
- Keep old saves by continuing at their current age; family history and achievements are stored separately from the active save
- Turn on Stick Citizen mode to rewind up to 7 days; the market, news, and weather replay exactly the same, so you can act on what you saw
- Save progress locally
How to Play
Download or clone the repository and open index.html in a browser. No installation required.

Development
Open `index.dev.html` to use the development tools. It has controls for editing player stats, changing stock/crypto prices and volatility, adjusting casino odds and payouts, advancing a day, triggering world and age-eligible life events, setting age and life stats, advancing one day of life, and returning to spawn. Dev settings, saves, and legacy life records use separate local storage from production; open `index.html` for the normal game.

The dev page is not access-controlled. Exclude `index.dev.html`, `js/dev.js`, and `css/dev.css` from any public production deployment.

Project Structure
The scripts are plain `<script>` files that share one global scope, so every file can use variables and functions from the others. `index.html` loads them in order; keep that order, because a file can only run code at load time that uses things defined in itself or earlier files. Code that should run once at startup goes at the end of `js/main.js`.

```
index.html            production page; loads the game CSS and JS
index.dev.html        development page; enables tools and an isolated save
css/
  base.css            core layout, full-screen pages, HUD
  mobile.css          touch and small-screen tweaks, zoom
  ui.css              menus, building panel, buttons, toast, phone
  casino.css          casino table animations
  dev.css             development tools panel
  motion.css          reduced-motion overrides (keep last)
js/
  core/state.js       canvas, constants, save state S, save(), items, jobs
  data/buildings.js   city blocks and the building list D
  world/map.js        roads, map generation, collision
  world/cars.js       traffic and the player's car
  world/scenery.js    props, pets, sky, neon and street lights
  world/npcs.js       NPCs, police, conversations
  core/effects.js     sound, floating text, screen feedback, night tint
  ui/backpack.js      backpack screen, message toast
  systems/citizen.js  Stick Citizen rewind, seeded randomness for day rollovers
  systems/market.js   stocks, prices, news
  ui/report.js        daily report screen and price charts
  ui/phone.js         phone apps, email, messages
  ui/creator.js       StickTube, StickStream and StickTok phone apps
  world/pickups.js    cash and gem pickups
  systems/events.js   life log, random events, death, birthdays
  data/lifesim.js     story, achievements, vehicles, shop items, furniture
  systems/life.js     life creation, annual progression, relationships, school, careers, activities, justice, and legacy
  city/social.js      story screen, shops, election, festival, neighbors
  city/hub.js         careers, missions, Life Hub, daily challenges
  city/property.js    homes, businesses, garage, outfits, travel
  city/minigames.js   city minigames
  city/casino.js      casino games
  city/achievements.js achievements and weather screens
  systems/time.js     day cycle, actions, entering and leaving buildings
  render/world.js     drawing the city
  render/player.js    drawing the player and room interiors
  render/hud.js       HUD and minimap
  ui/menu.js          menu helpers (mbtn, mshow) and the title/pause menu
  main.js             game loop, input, zoom, startup
  dev.js              dev-only test controls (loaded only by index.dev.html)
```

Where to add things
- A new casino game: add a function in `js/city/casino.js` built on `casinoScreen` and `casinoRound`, then add a button for it in `casinoFloor`. Styles go in `css/casino.css`.
- A new Life Hub screen: write it with `cityScreen` in the matching `js/city/` file and add a button in `cityHub` (`js/city/hub.js`).
- New items, vehicles, achievements or story chapters: add entries to the lists in `js/data/lifesim.js`.
- Life events, careers, and cartoonish justice scenarios: add entries to the data lists in `js/data/lifesim.js`. New life events should define an age-stage or an `ok()` eligibility check when needed.
- The Life Hub app opens the life simulator. Each in-game day adds one year of age and shows one combined life and financial report, including price graphs for owned investments, followed by at most one eligible life event. No separate birthday celebration is shown.
- Completed lives, family records, legacy achievements, and challenge selection use separate browser storage so starting a new game does not erase them.
- Creator apps: extend StickTube, StickStream or StickTok in `js/ui/creator.js`; their progress and profiles are stored in `S.cr`.
- A new JS file: add a `<script src>` line to `index.html` after every file it uses at load time.
