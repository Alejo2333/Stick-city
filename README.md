Stick City
A browser-based open-world life simulation game built with HTML, CSS, and vanilla JavaScript.
Features
- Explore the city and interact with characters
- Work, earn money, and buy homes, vehicles, and items
- Complete missions and unlock achievements
- Use an in-game phone, including a link to the developer's GitHub
- Save progress locally
How to Play
Download or clone the repository and open index.html in a browser. No installation required.

Project Structure
The scripts are plain `<script>` files that share one global scope, so every file can use variables and functions from the others. `index.html` loads them in order; keep that order, because a file can only run code at load time that uses things defined in itself or earlier files. Code that should run once at startup goes at the end of `js/main.js`.

```
index.html            page markup; loads the CSS and JS below
css/
  base.css            core layout, full-screen pages, HUD
  mobile.css          touch and small-screen tweaks, zoom
  ui.css              menus, building panel, buttons, toast, phone
  casino.css          casino table animations
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
  systems/market.js   stocks, prices, news
  ui/phone.js         phone apps, email, messages
  world/pickups.js    cash and gem pickups
  systems/events.js   life log, random events, death, birthdays
  data/lifesim.js     story, achievements, vehicles, shop items, furniture
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
```

Where to add things
- A new casino game: add a function in `js/city/casino.js` built on `casinoScreen` and `casinoRound`, then add a button for it in `casinoFloor`. Styles go in `css/casino.css`.
- A new Life Hub screen: write it with `cityScreen` in the matching `js/city/` file and add a button in `cityHub` (`js/city/hub.js`).
- New items, vehicles, achievements or story chapters: add entries to the lists in `js/data/lifesim.js`.
- A new JS file: add a `<script src>` line to `index.html` after every file it uses at load time.
