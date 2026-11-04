var CAREERS = [
  [
    "Entrepreneur",
    "Build a business empire, own properties, and earn passive income.",
    "💼",
  ],
  [
    "City Hero",
    "Help neighbors, improve your reputation, and lead the city.",
    "🛡️",
  ],
  [
    "Free Spirit",
    "Explore, make friends, and create the life you want.",
    "🌈",
  ],
];
var MISSIONS = [
  [
    "firstjob",
    "First paycheck",
    "Complete a paid shift",
    40,
    function () {
      return S.jobsDone >= 1;
    },
  ],
  [
    "scholar",
    "Back to school",
    "Reach INT 5",
    55,
    function () {
      return S.int >= 5;
    },
  ],
  [
    "strong",
    "Get stronger",
    "Reach STR 5",
    55,
    function () {
      return S.str >= 5;
    },
  ],
  [
    "social",
    "People person",
    "Talk to 5 citizens",
    70,
    function () {
      return S.talksDone >= 5;
    },
  ],
  [
    "traveler",
    "City explorer",
    "Visit 8 buildings",
    100,
    function () {
      return Object.keys(S.placesVisited).length >= 8;
    },
  ],
  [
    "driver",
    "On the road",
    "Own a vehicle",
    100,
    function () {
      return !!S.vehicle;
    },
  ],
  [
    "designer",
    "Home designer",
    "Own 3 pieces of furniture",
    85,
    function () {
      return Object.keys(S.furniture).length >= 3;
    },
  ],
  [
    "owner",
    "Business owner",
    "Own your first business",
    180,
    function () {
      return Object.keys(S.businesses).length >= 1;
    },
  ],
  [
    "landlord",
    "Property investor",
    "Own an apartment",
    180,
    function () {
      return !!S.owns.apartment;
    },
  ],
  [
    "wealth",
    "First thousand",
    "Hold $1,000 in cash or bank",
    120,
    function () {
      return S.cash + S.bank >= 1000;
    },
  ],
  [
    "friend",
    "Trusted citizen",
    "Reach karma 15",
    90,
    function () {
      return S.k >= 15;
    },
  ],
  [
    "leader",
    "City leader",
    "Become President of Stick City",
    500,
    function () {
      return !!S.won;
    },
  ],
];
function fmtCash(n) {
  return "$" + Math.floor(n).toLocaleString("en-US");
}
function cityNotice(t) {
  say(t);
  addLog(t);
  save();
}
function citySpend(cost) {
  if (S.cash < cost) {
    say("Not enough money. Need " + fmtCash(cost) + ".");
    return false;
  }
  S.cash -= cost;
  S.lifetimeSpent += cost;
  save();
  return true;
}
function cityBuy(key, title, price, dest) {
  if (dest[key]) {
    say("You already own " + title + ".");
    return;
  }
  if (!citySpend(price)) return;
  dest[key] = 1;
  cityNotice("Purchased " + title + " for " + fmtCash(price) + "!");
}
var overnightMsg = "";
function cityNewDay() {
  var w = ["Sunny", "Sunny", "Cloudy", "Rain", "Rain", "Fog", "Storm"];
  S.weather = S.forecast || "Sunny";
  S.seasonsSeen[seasonName()] = 1;
  S.moneyPeak = Math.max(S.moneyPeak, S.cash + S.bank);
  S.forecast = w[Math.floor(Math.random() * w.length)];
  var msgs = [],
    income = 0;
  var rates = {
    cafe: 28,
    delivery: 38,
    arcade: 44,
    store: 52,
    factory: 80,
  };
  Object.keys(S.businesses).forEach(function (k) {
    income += (rates[k] || 0) * (1 + (S.businessUpgrades[k] || 0));
  });
  if (income) {
    S.cash += income;
    S.lifetimeEarned += income;
    S.lifetimeBusiness += income;
    msgs.push(
      "Your businesses earned " + fmtCash(income) + " overnight.",
    );
  }
  var rent = (S.owns.apartment ? 18 : 0) + (S.owns.townhouse ? 42 : 0);
  if (rent) {
    S.cash += rent;
    S.lifetimeEarned += rent;
    S.lifetimeRent += rent;
    msgs.push("Rental income: " + fmtCash(rent) + ".");
  }
  if (S.day % 7 === 0)
    msgs.push(
      "🎪 Seasonal city festival! Visit the Cafe for the community fair.",
    );
  if (["Rain", "Storm"].indexOf(S.weather) >= 0) {
    S.weatherEvents++;
    if (S.weather === "Storm" && Math.random() < 0.4) {
      S.en = Math.max(1, S.en - 2);
      msgs.push("Thunderstorm! You lost 2 energy.");
    }
  }
  if (S.weather === "Sunny") {
    S.hap = Math.min(100, S.hap + 1);
  }
  if (S.career === "Free Spirit") {
    S.hap = Math.min(100, S.hap + 2);
  }
  if (S.career === "City Hero" && S.k >= 10) {
    S.k += 1;
  }
  if (S.weather === "Fog")
    msgs.push("Heavy fog makes driving slower today.");
  if (S.day % 15 === 1)
    msgs.push("🍃 " + seasonName() + " has arrived in Stick City!");
  S.daily = { day: S.day, work: 0, talk: 0, explore: 0 };
  if (S.driving && !S.vehicle) S.driving = false;
  overnightMsg = msgs.join(" ");
  if (overnightMsg) {
    say(overnightMsg);
    addLog(overnightMsg);
  }
  return { business: income, rent: rent, notices: msgs.slice() };
}
function cityReward(id) {
  var m = MISSIONS.filter(function (q) {
    return q[0] === id;
  })[0];
  if (!m || S.missionClaimed[id] || !m[4]()) return;
  S.missionClaimed[id] = 1;
  S.cash += m[3];
  S.lifetimeEarned += m[3];
  S.hap = Math.min(100, S.hap + 3);
  cityNotice("🏆 " + m[1] + " complete! +" + fmtCash(m[3]));
  cityMissions();
}
function cityScreen(title, description, builder, back) {
  // The graveyard and family tree open from the death screen and return to it.
  var ended = !!(S.life && S.life.ended);
  paused = true;
  onTitle = ended;
  keys = {};
  held = {};
  mshow(title, [description], function (d) {
    builder(d);
    mbtn(d, "⬅️", "Back", function () {
      if (ended) lifeEndScreen();
      else if (back) back();
      else if (cityBackTo) {
        var b = cityBackTo;
        closeMenu();
        enter(b);
      } else cityHub();
    });
    if (!ended) mbtn(d, "▶️", "Return to city", closeMenu);
  });
}
function cityHub() {
  if (cityHubFromPhone) {
    mn.hidden = true;
    phn.hidden = false;
    pv = "hub";
    phRender();
    return;
  }
  cityScreen(
    "🌆 Life Hub",
    "Day " +
      S.day +
      " · " +
      S.weather +
      " · " +
      S.career +
      " · " +
      fmtCash(S.cash),
    function (d) {
      mbtn(d, "📖", "Story chapters", cityStory);
      mbtn(d, "🌱", "Life story & Age", lifeHubScreen);
      mbtn(d, "🎯", "Missions & rewards", cityMissions);
      mbtn(d, "📅", "Daily challenges", cityDaily);
      mbtn(d, "🧭", "Choose life path", cityCareer);
      mbtn(d, "🏠", "Real estate & furniture", cityHomes);
      mbtn(d, "🏢", "Own a business", cityBusinesses);
      mbtn(d, "🚗", "Garage & vehicles", cityGarage);
      mbtn(d, "👕", "Customize outfit", cityOutfits);
      mbtn(d, "🗺️", "Travel guide & weather", cityTravel);
      mbtn(d, "🎲", "City minigames", cityGames);
      mbtn(d, "🏆", "Achievements", cityAchievements);
      mbtn(d, "🛍️", "Visit local shops", cityShops);
      mbtn(d, "👥", "Neighbors", cityNeighborhood);
      mbtn(d, "🎪", "Seasonal festival", citySeasonalEvent);
    },
    function () {
      menu(false);
    },
  );
}
function cityMissions() {
  cityScreen(
    "🎯 Missions",
    "Complete goals and claim rewards. " +
      MISSIONS.filter(function (m) {
        return S.missionClaimed[m[0]];
      }).length +
      "/" +
      MISSIONS.length +
      " complete",
    function (d) {
      MISSIONS.forEach(function (m) {
        var claimed = !!S.missionClaimed[m[0]],
          ready = m[4]();
        var b = mbtn(
          d,
          claimed ? "✅" : ready ? "🎁" : "🔒",
          m[1] +
            " — " +
            (claimed
              ? "Done"
              : ready
                ? "Claim " + fmtCash(m[3])
                : m[2]),
          function () {
            cityReward(m[0]);
          },
        );
        b.disabled = claimed || !ready;
      });
    },
  );
}
function cityDaily() {
  if (S.daily.day !== S.day)
    S.daily = { day: S.day, work: 0, talk: 0, explore: 0 };
  cityScreen(
    "📅 Daily Challenges",
    "Daily objectives reset each morning. Finish all three for $75 and +3 karma.",
    function (d) {
      [
        ["work", "Complete a job", 1],
        ["talk", "Talk to three residents", 3],
        ["explore", "Enter two buildings", 2],
      ].forEach(function (a) {
        mbtn(
          d,
          (S.daily[a[0]] || 0) >= a[2] ? "✅" : "⌛",
          a[1] +
            " (" +
            Math.min(a[2], S.daily[a[0]] || 0) +
            "/" +
            a[2] +
            ")",
          function () {
            cityDaily();
          },
        );
      });
      var all =
        (S.daily.work || 0) >= 1 &&
        (S.daily.talk || 0) >= 3 &&
        (S.daily.explore || 0) >= 2;
      var b = mbtn(
        d,
        "🎁",
        S.daily.claimed
          ? "Reward already collected"
          : "Claim $75 daily reward",
        function () {
          if (!all || S.daily.claimed) return;
          S.daily.claimed = 1;
          S.cash += 75;
          S.k += 3;
          cityNotice("Daily challenge completed! +$75 and +3 karma.");
          cityDaily();
        },
      );
      b.disabled = !all || !!S.daily.claimed;
    },
  );
}
function cityCareer() {
  cityScreen(
    "🧭 Your Life Path",
    "Choose the kind of life you want to lead. You can change it later.",
    function (d) {
      CAREERS.forEach(function (c) {
        mbtn(
          d,
          c[2],
          c[0] + (S.career === c[0] ? " ✓" : ""),
          function () {
            S.career = c[0];
            cityNotice("Life path: " + c[0]);
            cityHub();
          },
        );
      });
    },
  );
}
