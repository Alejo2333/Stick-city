var mn = document.getElementById("mn"),
  paused = true,
  onTitle = false;
function hasSv() {
  try {
    return !!localStorage.getItem(KEY);
  } catch (e) {
    return false;
  }
}
function mbtn(d, ic, t, fn) {
  var b = document.createElement("button"),
    a = document.createElement("span"),
    x = document.createElement("span");
  a.className = "ico";
  a.textContent = ic;
  x.textContent = t;
  b.appendChild(a);
  b.appendChild(x);
  b.style.setProperty("--i", d.children.length);
  b.onclick = function () {
    sfx("click");
    fn();
  };
  d.appendChild(b);
  return b;
}
// Skip the intro animation when a visible screen re-renders the same page.
function keepStill(box, panel, key) {
  if (!box.hidden && box.dataset.k === key)
    panel.classList.add("still");
  box.dataset.k = key;
}
// The game reads `hidden` synchronously, so closing flips it right away and
// a throwaway copy plays the exit animation on top.
function closeFx(box, cls) {
  if (box.hidden || !motionOk) return;
  var c = box.cloneNode(true);
  c.removeAttribute("id");
  c.querySelectorAll("[id]").forEach(function (el) {
    el.removeAttribute("id");
  });
  c.classList.add("closing");
  if (cls) c.classList.add(cls);
  c.setAttribute("aria-hidden", "true");
  c.inert = true;
  box.parentNode.appendChild(c);
  c.scrollTop = box.scrollTop;
  setTimeout(function () {
    c.remove();
  }, 240);
}
// Snapshots scroll and focus so re-rendering a page leaves the player in place.
function holdPlace(box) {
  var at = [].indexOf.call(
      box.querySelectorAll("button"),
      document.activeElement,
    ),
    top = box.scrollTop;
  return function () {
    box.scrollTop = top;
    var b = box.querySelectorAll("button")[at];
    if (!b || b.disabled) b = box.querySelector("button:not(:disabled)");
    if (b) b.focus({ preventScroll: true });
  };
}
function mshow(title, lines, build) {
  var place = !mn.hidden && mn.dataset.k === title ? holdPlace(mn) : null;
  mn.innerHTML = "";
  var panel = document.createElement("div");
  panel.className = "screen-panel";
  keepStill(mn, panel, title);
  var h = document.createElement("h1");
  h.textContent = title;
  panel.appendChild(h);
  var copy = document.createElement("div");
  copy.className = "screen-copy";
  lines.forEach(function (l) {
    if (typeof l !== "string") return copy.appendChild(l);
    var q = document.createElement("p");
    q.textContent = l;
    copy.appendChild(q);
  });
  panel.appendChild(copy);
  var d = document.createElement("div");
  d.className = "menu";
  build(d);
  panel.appendChild(d);
  mn.appendChild(panel);
  if (title === "Stick City" || title === "Paused") {
    var github = document.createElement("a");
    github.className = "github-credit";
    github.href = "https://github.com/Alejo2333";
    github.target = "_blank";
    github.rel = "noopener noreferrer";
    github.textContent = "⌘ GitHub · Alejo2333 ↗";
    github.setAttribute(
      "aria-label",
      "Visit Alejo2333 on GitHub (opens in a new tab)",
    );
    mn.appendChild(github);
  }
  mn.hidden = false;
  if (place) return place();
  var f = mn.querySelector("button:not(:disabled)");
  if (f) f.focus();
}
function closeMenu() {
  closeFx(mn);
  mn.hidden = true;
  cityHubFromPhone = false;
  cityBackTo = null;
  cityBackLife = null;
  paused = false;
  onTitle = false;
}
function hhmm() {
  var h = Math.floor(S.t),
    m = Math.floor((S.t - h) * 60);
  return (
    (h % 12 || 12) +
    ":" +
    (m < 10 ? "0" : "") +
    m +
    (h >= 12 ? " PM" : " AM")
  );
}
function sub(t, title, lines) {
  mshow(title, lines, function (d) {
    mbtn(d, "⬅️", "Back", function () {
      menu(t);
    });
  });
}
function menu(t) {
  if (t && S.life && S.life.ended) return lifeEndScreen();
  paused = true;
  onTitle = t;
  cityBackTo = null;
  keys = {};
  held = {};
  bp.hidden = true;
  var sure = false,
    sv2 = hasSv();
  mshow(
    t ? "Stick City" : "Paused",
    t
      ? [
          sv2
            ? S.life && S.life.created
              ? "Continue " +
                S.life.name +
                "'s story at age " +
                S.age +
                "."
              : "Continue your existing city save at age " + S.age + "."
            : "Create a life story, explore the city, and shape your future. Your age and memories will grow year by year.",
        ]
      : ["Day " + S.day + ", " + hhmm() + ". $" + S.cash + " in cash."],
    function (d) {
      mbtn(
        d,
        "▶",
        t
          ? sv2
            ? "Continue"
            : "Create a life"
          : "Resume",
        t && !sv2
          ? lifeCharacterCreate
          : t && sv2 && !(S.life && S.life.created)
            ? lifeContinueLegacy
            : closeMenu,
      );
      if (!t)
        mbtn(d, "📊", "Your stats", function () {
          sub(false, "Your stats", [
            "HP " +
              Math.round(S.en) +
              "/" +
              MAXE +
              "   Cash $" +
              S.cash +
              "   Bank $" +
              S.bank,
            "STR " +
              S.str +
              "   INT " +
              S.int +
              "   CHA " +
              S.cha +
              "   Karma " +
              S.k,
            "Wanted: " +
              (S.heat >= 0.3
                ? "★".repeat(Math.min(5, Math.ceil(S.heat)))
                : "no"),
            "Weapon: " +
              (S.wpn && S.inv[S.wpn] ? ITEMS[S.wpn].n : "none") +
              "   Partner: " +
              (S.partner || "none"),
            "Home: " +
              (S.mansion ? "Mansion" : "Apartment") +
              (S.won ? "   ★ President" : ""),
            "Delivery: " + (S.quest ? S.quest.to : "none"),
          ]);
        });
      if (!t)
        mbtn(d, "📖", "Life story", function () {
          sub(
            false,
            "Life story",
            ["Age " + S.age + "   Happiness " + S.hap + "/100"].concat(
              S.log.length
                ? S.log.slice(-8).reverse()
                : ["Nothing yet. Turn 19 to see events."],
            ),
          );
        });
      if (!t && citizenOn) mbtn(d, "⏪", "Rewind time", rewindScreen);
      citizenToggle(d);
      if (!t)
        mbtn(d, "💾", "Save now", function () {
          save();
          closeMenu();
          say("Game saved.");
        });
      var sb = mbtn(
        d,
        muted ? "🔇" : "🔊",
        muted ? "Sound: off" : "Sound: on",
        function () {
          muted = !muted;
          try {
            localStorage.setItem("stickCityMute", muted ? "1" : "0");
          } catch (e) {}
          sb.firstChild.textContent = muted ? "🔇" : "🔊";
          sb.lastChild.textContent = muted ? "Sound: off" : "Sound: on";
        },
      );
      mbtn(d, "❓", "How to play", function () {
        sub(t, "How to play", [
          "Walk with the arrow keys or WASD, or on a touchscreen drag the joystick in the lower-left corner. Walk into a door to go inside. Near someone, press E or tap Talk to start a conversation.",
          "Zoom with the mouse wheel, the + and − keys (0 resets), the + / − buttons, or by pinching the screen.",
          "M opens this menu, I your backpack, P your phone. Esc leaves a building or closes a window.",
          "Jobs pay more as your stats rise, and karma decides which jobs you can take.",
          "Crimes can get you wanted. Cops chase you; pay at the Police Station to clear it.",
          "Progress saves automatically. Use the Life Hub app on your phone to choose a career, claim missions, buy businesses, decorate, drive, and fast-travel.",
          "Turn on Stick Citizen in this menu to rewind up to " +
            REWIND_DAYS +
            " days. The future stays the same, so a coin that spiked will spike again.",
        ]);
      });
      if (!t || sv2) {
        var nb = mbtn(d, "✨", "New game", function () {
          if (!sure) {
            sure = true;
            nb.lastChild.textContent = "Erase save? Tap again";
            return;
          }
          try {
            localStorage.removeItem(KEY);
          } catch (e) {}
          location.reload();
        });
      }
      if (!t)
        mbtn(d, "🏠", "Title screen", function () {
          save();
          menu(true);
        });
    },
  );
}
