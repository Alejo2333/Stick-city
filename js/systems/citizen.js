// Stick Citizen mode: rewind to an earlier day and keep the same future.
// Each life has a seed, and everything rolled when a day turns over comes from
// that seed instead of Math.random, so replaying a day gives the same result.
var CITIZEN_KEY = DEV_MODE ? "stickCityDevCitizen" : "stickCityCitizen",
  REWIND_KEY = KEY + "Rewind",
  REWOUND_KEY = KEY + "Rewound",
  REWIND_DAYS = 7,
  REWIND_MAX_CHARS = 2000000, // leaves localStorage room for the main save
  citizenOn = false;
try {
  citizenOn = localStorage.getItem(CITIZEN_KEY) === "1";
} catch (e) {}
if (!S.seed) S.seed = 1 + Math.floor(Math.random() * 4294967295);

function fateRandom(label) {
  var text = S.seed + ":" + label,
    h = 2166136261;
  for (var i = 0; i < text.length; i++)
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return function () {
    h = (h + 0x6d2b79f5) | 0;
    var t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Runs fn with Math.random drawing from the fixed stream named by label.
function withFate(label, fn) {
  var real = Math.random;
  Math.random = fateRandom(label);
  try {
    return fn();
  } finally {
    Math.random = real;
  }
}

function rewindPoints() {
  try {
    var list = JSON.parse(localStorage.getItem(REWIND_KEY) || "[]");
    return list.filter(function (point) {
      return point.seed === S.seed && point.day < S.day;
    });
  } catch (e) {
    return [];
  }
}
function rewindStore(list) {
  while (
    list.length > 1 &&
    list.reduce(function (total, point) {
      return total + point.save.length;
    }, 0) > REWIND_MAX_CHARS
  )
    list.shift();
  while (list.length) {
    try {
      localStorage.setItem(REWIND_KEY, JSON.stringify(list));
      return;
    } catch (e) {
      list.shift();
    }
  }
}
// Called just before a day turns over, so rewinding lands on the night before
// with everything the player did that day still in place.
function rewindCapture() {
  if (!citizenOn) return;
  var list = rewindPoints();
  list.push({
    seed: S.seed,
    day: S.day,
    age: S.age,
    cash: S.cash,
    save: JSON.stringify(saveData()),
  });
  rewindStore(list.slice(-REWIND_DAYS));
}
// Reloading is what clears traffic, drops, and anything else from the later day.
function rewindTo(point) {
  try {
    localStorage.setItem(KEY, point.save);
    localStorage.setItem(
      REWIND_KEY,
      JSON.stringify(
        rewindPoints().filter(function (other) {
          return other.day < point.day;
        }),
      ),
    );
    sessionStorage.setItem(REWOUND_KEY, String(point.day));
  } catch (e) {
    console.error("Could not rewind:", e);
    say("Time would not rewind in this browser.");
    return;
  }
  location.reload();
}
function rewindResume() {
  var day = null;
  try {
    day = sessionStorage.getItem(REWOUND_KEY);
    sessionStorage.removeItem(REWOUND_KEY);
  } catch (e) {}
  if (!day || !S.life.created || S.life.ended) return;
  closeMenu();
  say("⏪ Back to Day " + day + ". The future has not changed.");
}
function citizenToggle(d) {
  var b = mbtn(d, "🌟", "", function () {
    citizenOn = !citizenOn;
    try {
      localStorage.setItem(CITIZEN_KEY, citizenOn ? "1" : "0");
    } catch (e) {}
    menu(onTitle);
  });
  b.lastChild.textContent = "Stick Citizen: " + (citizenOn ? "on" : "off");
}
// Shortcut for the daily reports, where the player has just seen the future.
function rewindButton(d) {
  if (!citizenOn) return;
  var last = rewindPoints().pop();
  if (last)
    mbtn(d, "⏪", "Rewind to Day " + last.day, function () {
      rewindTo(last);
    });
}
function rewindScreen() {
  var points = rewindPoints().reverse();
  mshow(
    "⏪ Rewind time",
    [
      points.length
        ? "Go back to the night before any of these days ended. You keep what you know, but everything else returns to how it was. Coins, stocks and the weather will play out the same way."
        : "Nothing to rewind to yet. Finish a day with Stick Citizen on and it will appear here.",
    ],
    function (d) {
      points.forEach(function (point) {
        mbtn(
          d,
          "⏪",
          "Day " +
            point.day +
            " · Age " +
            point.age +
            " · $" +
            Math.round(point.cash).toLocaleString("en-US"),
          function () {
            rewindTo(point);
          },
        );
      });
      mbtn(d, "⬅️", "Back", function () {
        menu(false);
      });
    },
  );
}
