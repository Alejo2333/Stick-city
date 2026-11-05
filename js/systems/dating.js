// StickMatch, the phone's dating app. Adults only: the player must be 18 and
// every profile is generated at 18 or older. Matches are ordinary life people,
// so they use the relationship screen and can become partners and parents.
var DATE_PER_DAY = 5,
  DATE_CONFIRM_FROM = 1000,
  DATE_SWIPE_AT = 80,
  DATE_NAMES = {
    woman: ["Ava", "Bea", "Cleo", "Dana", "Elsa", "Faye", "Gia", "Hana", "Iris", "June", "Kira", "Lena", "Maya", "Nora", "Opal", "Priya"],
    man: ["Abe", "Ben", "Cole", "Dev", "Eli", "Finn", "Gabe", "Hugo", "Ivan", "Jace", "Kai", "Leo", "Marco", "Nate", "Omar", "Pedro"],
    nonbinary: ["Alex", "Blair", "Casey", "Drew", "Emery", "Quinn", "Rowan", "Sage"],
  },
  DATE_SEEK = { everyone: "Everyone", woman: "Women", man: "Men" },
  DATE_BIO_START = [
    "Looking for someone to get lost in the city with.",
    "Will judge you by your coffee order.",
    "Dog person, open to negotiations.",
    "Probably at the arcade right now.",
    "Here for good talks and bad karaoke.",
    "My mom thinks I should get out more.",
    "I cook, you do the dishes.",
    "Terrible at texting back, great in person.",
    "Saving up for a mansion, accepting help.",
    "Always down for a walk in the rain.",
    "I know every bench in Stick City.",
    "Still recovering from my last stock tip.",
  ],
  DATE_BIO_END = [
    "Bring snacks.",
    "Tell me your worst joke.",
    "My plants are doing fine, thanks.",
    "Yes, I will race you to the bus stop.",
    "First round of nachos is on me.",
    "I take trivia night too seriously.",
    "Ask me about my favorite pigeon.",
    "Looking for a co-pilot, not a passenger.",
    "My playlist needs an intervention.",
    "Let's skip the small talk.",
    "I promise I'm funnier in person.",
    "Sunset walks are not negotiable.",
  ],
  DATE_INTERESTS = [
    "Arcades", "Baking", "Cycling", "Karaoke", "Hiking", "Thrifting", "Chess", "Live music",
    "Street food", "Gardening", "Movies", "Dogs", "Cats", "Painting", "Running", "Road trips",
    "Board games", "Stocks", "Photography", "Beach days",
  ],
  // What each personality notices most in the player.
  DATE_VALUES = {
    curious: ["smarts", function () { return S.int; }],
    thoughtful: ["smarts", function () { return S.int; }],
    kind: ["kindness", function () { return S.k * 2; }],
    bold: ["charisma", function () { return S.cha; }],
  },
  // id, title, emoji, cost, hours, affection, happiness, great story, flat story
  DATE_VENUES = [
    ["park", "Sunset park walk", "🌇", 0, 1, 3, 2,
      "You walked until the street lights came on, and neither of you checked the time.",
      "It was a nice walk, though the pigeons did most of the talking."],
    ["cafe", "Corner cafe", "☕", 35, 2, 6, 3,
      "One coffee turned into three, and {n} is already planning the next one.",
      "The coffee was good. The conversation needed a little more sugar."],
    ["arcade", "Arcade night", "🕹️", 70, 2, 8, 5,
      "You lost every game on purpose. {n} noticed, and laughed about it all night.",
      "{n} won every round and would not stop mentioning it."],
    ["rooftop", "Rooftop dinner", "🌃", 240, 3, 12, 7,
      "The whole city glittered below you, and {n} said it was their favorite night in years.",
      "The view was lovely, but the wind stole both of your napkins and most of the mood."],
    ["getaway", "Weekend getaway", "🧳", 1200, 4, 20, 12,
      "Two days, one bad map and no regrets. {n} kept a photo of you both.",
      "The hotel lost your booking, but you both made a decent story of it."],
  ],
  // Screen state only; everything that matters is saved in S.life.
  dateUi = {};

function datingReset() {
  dateUi = {
    tab: "discover",
    note: "",
    ghost: null,
    matched: "",
    profile: "",
    plan: "",
    result: null,
  };
}
datingReset();
function datingState() {
  if (!S.life.dating) S.life.dating = { seek: "everyone", day: 0, left: 0, deck: [] };
  var st = S.life.dating;
  if (st.day !== S.day) {
    st.day = S.day;
    st.left = DATE_PER_DAY;
    st.deck = datingDeal(st.seek, st.left);
  }
  return st;
}
function datingNameFree(name) {
  return (
    !S.life.people.some(function (person) {
      return person.name === name;
    }) &&
    !NP.some(function (npc) {
      return npc.name === name;
    })
  );
}
function datingDeal(seek, count) {
  return withFate("dating:" + S.day + ":" + seek, function () {
    var deck = [],
      lo = Math.max(18, S.age - 8),
      hi = Math.max(lo, S.age + 8);
    for (var i = 0; i < count; i++) {
      var gender =
          seek !== "everyone"
            ? seek
            : pick(["woman", "man", "woman", "man", "nonbinary"]),
        names = DATE_NAMES[gender].filter(function (name) {
          return (
            datingNameFree(name) &&
            !deck.some(function (other) {
              return other.name === name;
            })
          );
        });
      if (!names.length) continue;
      deck.push({
        id: "match-" + S.life.lifeCount + "-" + S.day + "-" + i,
        name: pick(names),
        gender: gender,
        age: lo + Math.floor(Math.random() * (hi - lo + 1)),
        personality: pick(["curious", "kind", "bold", "thoughtful"]),
      });
    }
    return deck;
  });
}
function datingMatches() {
  return S.life.people.filter(function (person) {
    return (
      person.alive &&
      person.age >= 18 &&
      (person.role === "match" || person.name === S.partner)
    );
  });
}
function datingMatch(id) {
  return datingMatches().filter(function (person) {
    return person.id === id;
  })[0];
}
// Bios and interests come from the person's id, so they never change.
function datingBio(person) {
  return kitPick(DATE_BIO_START, person.id, "bio1") + " " + kitPick(DATE_BIO_END, person.id, "bio2");
}
function datingInterests(person) {
  var first = kitHash(person.id + ":likes") % DATE_INTERESTS.length;
  return [0, 7, 13].map(function (step) {
    return DATE_INTERESTS[(first + step) % DATE_INTERESTS.length];
  });
}
// Compatibility decides the odds of matching and how well dates go.
function datingCompat(person) {
  var value = DATE_VALUES[person.personality] || DATE_VALUES.curious,
    trait = Math.max(0, value[1]()),
    score =
      20 +
      (kitHash(person.id + ":spark") % 25) +
      Math.min(30, S.cha * 0.3) +
      Math.min(15, (S.life.looks || 0) * 0.15) +
      Math.min(20, trait * 0.2);
  return Math.max(5, Math.min(99, Math.round(score)));
}
function datingMe() {
  return kitPortrait("me-" + S.life.lifeCount + "-" + S.life.name);
}
function datingHeader(title, canGoBack) {
  return (
    '<div class="sm-head">' +
    kitButton("dateBack", "", "‹", "sm-back", false, canGoBack ? "Back" : "Close StickMatch") +
    '<div class="sm-brand">' +
    (title ? esc(title) : '<i aria-hidden="true">♥</i> StickMatch') +
    "</div></div>"
  );
}
function datingHearts(left) {
  var hearts = "";
  for (var i = 0; i < DATE_PER_DAY; i++)
    hearts += '<i class="' + (i < left ? "on" : "") + '">♥</i>';
  return (
    '<div class="sm-left" role="img" aria-label="' +
    left +
    ' profiles left today"><span aria-hidden="true">' +
    hearts +
    "</span><small>" +
    left +
    " left today</small></div>"
  );
}
function datingCard(person, cls, extra) {
  var value = DATE_VALUES[person.personality] || DATE_VALUES.curious,
    compat = datingCompat(person);
  return (
    '<article class="sm-card ' +
    (cls || "") +
    '"' +
    (extra || "") +
    ">" +
    '<div class="sm-stamp sm-stamp-like" aria-hidden="true">LIKE</div><div class="sm-stamp sm-stamp-pass" aria-hidden="true">PASS</div>' +
    '<div class="sm-card-top">' +
    kitPortrait(person.id, "sm-photo") +
    "<div><h3>" +
    esc(person.name) +
    ", " +
    person.age +
    '</h3><div class="sm-kind">' +
    esc(person.personality || "") +
    "</div></div></div>" +
    '<p class="sm-bio">' +
    esc(datingBio(person)) +
    '</p><div class="sm-chips">' +
    datingInterests(person)
      .map(function (interest) {
        return kitChip(interest);
      })
      .join("") +
    "</div>" +
    kitBar("Compatibility", compat, 100, "sm-compat") +
    '<small class="sm-why">Notices your ' +
    value[0] +
    " most.</small></article>"
  );
}
function datingDiscover(st) {
  var profile = st.deck[0],
    next = st.deck[1],
    h = '<div class="kit-seg" role="group" aria-label="Show me">';
  Object.keys(DATE_SEEK).forEach(function (key) {
    h += kitButton("dateSeek", key, DATE_SEEK[key], st.seek === key ? "on" : "");
  });
  h += "</div>" + datingHearts(st.left);
  if (dateUi.note)
    h += '<div class="sm-note" role="status">' + esc(dateUi.note) + "</div>";
  if (!profile && !dateUi.ghost)
    return (
      h +
      kitEmpty(
        "That's everyone for today",
        "New people join tomorrow. In the meantime, check in with your matches.",
        kitButton("dateTab", "matches", "See your matches", "sm-main"),
      )
    );
  h += '<div class="sm-deck">';
  if (next) h += datingCard(next, "sm-under", ' aria-hidden="true"');
  if (profile) h += datingCard(profile, "sm-top", "");
  if (dateUi.ghost)
    h += datingCard(
      dateUi.ghost.person,
      "sm-ghost sm-fly-" + dateUi.ghost.dir,
      ' aria-hidden="true" style="--sx:' + dateUi.ghost.x + 'px"',
    );
  h += "</div>";
  if (profile)
    h +=
      '<div class="sm-actions">' +
      kitButton("datePass", "", "✕", "sm-round sm-pass", false, "Pass on " + profile.name) +
      kitButton("dateLike", "", "♥", "sm-round sm-like", false, "Like " + profile.name) +
      "</div>";
  else
    h += kitEmpty(
      "That's everyone for today",
      "New people join tomorrow.",
      kitButton("dateTab", "matches", "See your matches", "sm-main"),
    );
  return h;
}
function datingMatchesTab() {
  var matches = datingMatches();
  if (!matches.length)
    return kitEmpty(
      "No matches yet",
      "Like a few profiles in Discover. Better charisma and looks raise your compatibility.",
      kitButton("dateTab", "discover", "Start browsing", "sm-main"),
    );
  return (
    '<div class="kit-list">' +
    matches
      .map(function (person) {
        var partner = person.name === S.partner;
        return kitRow(
          "dateOpen",
          person.id,
          kitPortrait(person.id),
          person.name + ", " + person.age,
          (partner ? "Your partner · " : "") + "Affection " + Math.round(person.affection),
          partner ? "♥" : "›",
        );
      })
      .join("") +
    "</div>"
  );
}
function datingCelebrate(person) {
  return (
    '<div class="sm-celebrate" role="status"><div class="sm-burst" aria-hidden="true">' +
    "<i>♥</i><i>♥</i><i>♥</i><i>♥</i><i>♥</i><i>♥</i></div>" +
    "<h2>It's a match!</h2><p>You and " +
    esc(person.name) +
    ' liked each other.</p><div class="sm-pair">' +
    datingMe() +
    kitPortrait(person.id) +
    "</div>" +
    kitButton("datePlan", person.id, "Plan a date", "sm-main") +
    kitButton("dateKeep", "", "Keep browsing", "sm-quiet") +
    "</div>"
  );
}
function datingProfile(person) {
  var partner = person.name === S.partner;
  return (
    datingHeader(person.name, true) +
    datingCard(person, "sm-flat", "") +
    kitBar("Affection", person.affection, 100, "sm-affection") +
    kitButton("datePlan", person.id, "🍽️ Plan a date", "sm-main") +
    kitButton("dateMore", person.id, "More with " + esc(person.name), "sm-quiet") +
    (partner ? "" : kitButton("dateUnmatch", person.id, "Unmatch", "sm-danger"))
  );
}
function datingPlanner(person) {
  var seen = doneToday("date-" + person.id),
    h =
      datingHeader("Date with " + person.name, true) +
      (seen
        ? '<div class="sm-note" role="status">You already saw ' +
          esc(person.name) +
          " today. Try again tomorrow.</div>"
        : '<p class="sm-lead">Where to? You have ' + fmtCash(S.cash) + ".</p>") +
      '<div class="kit-list">';
  DATE_VENUES.forEach(function (venue) {
    var cost = venue[3],
      broke = S.cash < cost;
    h += kitRow(
      "dateGo",
      venue[0],
      '<span class="sm-venue" aria-hidden="true">' + venue[2] + "</span>",
      venue[1],
      broke ? "Needs " + fmtCash(cost) : venue[4] + (venue[4] === 1 ? " hour" : " hours") + " · +" + venue[5] + " affection",
      cost ? fmtCash(cost) : "Free",
      seen || broke,
    );
  });
  return h + "</div>";
}
function datingResult(result) {
  return (
    '<div class="sm-result" role="status"><div class="sm-result-art" aria-hidden="true">' +
    result.icon +
    "</div><h2>" +
    (result.great ? "That went really well" : "That was all right") +
    "</h2><p>" +
    esc(result.story) +
    "</p>" +
    kitDeltas(result.deltas) +
    kitButton("dateDone", "", "Done", "sm-main") +
    "</div>"
  );
}
function datingPage() {
  if (phRenderedView !== "date") datingReset();
  if (S.age < 18)
    return (
      datingHeader("", false) +
      kitEmpty("StickMatch is for adults", "Come back when you turn 18.")
    );
  var ghost = dateUi.ghost,
    person = datingMatch(dateUi.matched || dateUi.plan || dateUi.profile),
    h;
  if (dateUi.result) h = datingHeader("", true) + datingResult(dateUi.result);
  else if (dateUi.matched && person) h = datingCelebrate(person);
  else if (dateUi.plan && person) h = datingPlanner(person);
  else if (dateUi.profile && person) h = datingProfile(person);
  else {
    h =
      datingHeader("", false) +
      '<div class="kit-tabs" role="group" aria-label="StickMatch sections">' +
      kitButton("dateTab", "discover", "Discover", dateUi.tab === "discover" ? "on" : "") +
      kitButton("dateTab", "matches", "Matches · " + datingMatches().length, dateUi.tab === "matches" ? "on" : "") +
      "</div>" +
      (dateUi.tab === "matches" ? datingMatchesTab() : datingDiscover(datingState()));
  }
  if (ghost) dateUi.ghost = null;
  return h;
}
function datingDecide(dir, x) {
  var st = datingState(),
    profile = st.deck[0];
  if (S.age < 18 || !profile) return;
  st.deck.shift();
  st.left--;
  dateUi.note = "";
  dateUi.ghost = { person: profile, dir: dir, x: Math.round(x) || 0 };
  if (dir === "right") {
    var odds = Math.min(0.9, 0.25 + datingCompat(profile) * 0.0065);
    if (Math.random() < odds) {
      profile.role = "match";
      profile.affection = 8;
      lifeAddPerson(profile);
      lifeNote("Matched with " + profile.name + " on StickMatch.", "relationship");
      dateUi.matched = profile.id;
      dateUi.ghost = null;
      sfx("up");
    } else dateUi.note = profile.name + " passed this time.";
  }
  save();
}
PA.dateBack = function () {
  if (dateUi.result) {
    dateUi.result = null;
    return;
  }
  if (dateUi.plan) {
    dateUi.plan = "";
    return;
  }
  if (dateUi.profile) {
    dateUi.profile = "";
    return;
  }
  pv = "home";
};
PA.dateTab = function (tab) {
  dateUi.tab = tab === "matches" ? "matches" : "discover";
  dateUi.note = "";
};
PA.dateSeek = function (seek) {
  if (!DATE_SEEK[seek]) return;
  var st = datingState();
  st.seek = seek;
  st.deck = datingDeal(seek, st.left);
  dateUi.note = "";
  save();
};
PA.datePass = function () {
  datingDecide("left", 0);
};
PA.dateLike = function () {
  datingDecide("right", 0);
};
PA.dateKeep = function () {
  dateUi.matched = "";
};
PA.dateOpen = function (id) {
  dateUi.profile = id;
};
PA.datePlan = function (id) {
  dateUi.matched = "";
  dateUi.profile = id;
  dateUi.plan = id;
};
PA.dateMore = function (id) {
  cityHubFromPhone = true;
  phn.hidden = true;
  lifePersonScreen(id);
};
PA.dateUnmatch = function (id) {
  var person = datingMatch(id);
  if (!person) return;
  kitConfirm(
    "Unmatch " + person.name + "?",
    "They'll leave your matches for good.",
    "Unmatch",
    function () {
      S.life.people = S.life.people.filter(function (other) {
        return other !== person;
      });
      lifeNote("Unmatched with " + person.name + ".", "relationship");
      dateUi.profile = "";
      dateUi.tab = "matches";
      save();
      phRender();
    },
  );
  return false;
};
function datingTakeDate(person, venue) {
  if (S.age < 18 || person.age < 18 || doneToday("date-" + person.id)) return;
  if (!citySpend(venue[3])) return;
  var great = withFate("date:" + S.day + ":" + person.id, function () {
      return Math.random() < 0.5 + datingCompat(person) * 0.004;
    }),
    affection = great ? venue[5] : Math.ceil(venue[5] / 2),
    happiness = great ? venue[6] : Math.ceil(venue[6] / 2),
    story = venue[great ? 7 : 8].replace("{n}", person.name),
    deltas = [
      { text: "+" + affection + " Affection", good: true },
      { text: "+" + happiness + " Happiness", good: true },
    ];
  if (venue[3]) deltas.push({ text: "-" + fmtCash(venue[3]), good: false });
  markDone("date-" + person.id);
  hp(happiness);
  lifeChangeAffection(person, affection);
  lifeNote(venue[1] + " with " + person.name + ". " + story, "relationship");
  dateUi.result = { icon: venue[2], great: great, story: story, deltas: deltas };
  dateUi.plan = "";
  sfx(great ? "up" : "spend");
  save();
  adv(venue[4]);
}
PA.dateGo = function (key) {
  var person = datingMatch(dateUi.plan),
    venue = DATE_VENUES.filter(function (item) {
      return item[0] === key;
    })[0];
  if (!person || !venue) return;
  if (venue[3] >= DATE_CONFIRM_FROM) {
    kitConfirm(
      venue[1] + "?",
      "This costs " + fmtCash(venue[3]) + ". You have " + fmtCash(S.cash) + ".",
      "Book it",
      function () {
        datingTakeDate(person, venue);
        if (!phn.hidden) phRender();
      },
    );
    return false;
  }
  datingTakeDate(person, venue);
};
PA.dateDone = function () {
  dateUi.result = null;
};
// Opens the date planner from the relationship screen.
function datingOpenPlanner(id) {
  closeMenu();
  phone();
  pv = "date";
  phRenderedView = "date";
  datingReset();
  dateUi.profile = id;
  dateUi.plan = id;
  phRender();
}

// Dragging the top card works like pressing Like or Pass.
var dateDrag = null;
phn.addEventListener("pointerdown", function (e) {
  var card = e.target.closest && e.target.closest(".sm-top");
  if (!card || (e.pointerType === "mouse" && e.button !== 0)) return;
  dateDrag = { card: card, id: e.pointerId, x: e.clientX, dx: 0 };
  card.setPointerCapture(e.pointerId);
  card.classList.add("sm-dragging");
});
phn.addEventListener("pointermove", function (e) {
  if (!dateDrag || e.pointerId !== dateDrag.id) return;
  dateDrag.dx = e.clientX - dateDrag.x;
  var card = dateDrag.card;
  card.style.setProperty("--sx", dateDrag.dx + "px");
  card.classList.toggle("sm-show-like", dateDrag.dx > 24);
  card.classList.toggle("sm-show-pass", dateDrag.dx < -24);
});
function datingDragEnd(e) {
  if (!dateDrag || e.pointerId !== dateDrag.id) return;
  var drag = dateDrag;
  dateDrag = null;
  drag.card.classList.remove("sm-dragging", "sm-show-like", "sm-show-pass");
  if (e.type === "pointerup" && Math.abs(drag.dx) >= DATE_SWIPE_AT) {
    sfx("click");
    datingDecide(drag.dx > 0 ? "right" : "left", drag.dx);
    phRender();
  } else drag.card.style.removeProperty("--sx");
}
phn.addEventListener("pointerup", datingDragEnd);
phn.addEventListener("pointercancel", datingDragEnd);

function datingCanConceive(person) {
  if (S.life.expecting) return false;
  var me = S.life.gender;
  if ((me === "girl" && person.gender === "woman") || (me === "boy" && person.gender === "man"))
    return false;
  var carrier =
    me === "girl" ? S.age : me === "boy" ? person.age : Math.min(S.age, person.age);
  return carrier <= 49;
}
function datingNight(person, tryingForBaby) {
  if (S.age < 18 || person.age < 18 || doneToday("night-" + person.id)) return;
  markDone("night-" + person.id);
  adv(2);
  hp(5);
  lifeChangeAffection(person, 4);
  lifeNote("You and " + person.name + " spent the night together.", "relationship");
  if (datingCanConceive(person) && Math.random() < (tryingForBaby ? 0.45 : 0.04)) {
    S.life.expecting = { with: person.name };
    lifeNote("A baby is on the way with " + person.name + "! It arrives next year.", "family");
  } else if (tryingForBaby) lifeNote("No baby news this time.", "family");
  if (S.partner && S.partner !== person.name && Math.random() < 0.25) {
    var partner = lifePerson(S.partner);
    if (partner) {
      partner.role = "friend";
      lifeChangeAffection(partner, -40);
    }
    lifeNote(S.partner + " found out about " + person.name + " and left you.", "family");
    S.partner = "";
    S.life.flags.engaged = 0;
    S.life.flags.married = 0;
    hp(-15);
  }
}
// Added to the relationship screen for partners and app matches.
function datingButtons(d, person) {
  if (S.age < 18 || person.age < 18) return;
  var isPartner = S.partner === person.name;
  if (!isPartner && person.role !== "match") return;
  function again() {
    save();
    lifePersonScreen(person.id);
  }
  mbtn(d, "🍽️", "Plan a date", function () {
    datingOpenPlanner(person.id);
  });
  var ready = isPartner || person.affection >= 15,
    spent = doneToday("night-" + person.id),
    night = mbtn(
      d,
      "🌙",
      ready ? "Spend the night" : "Spend the night (needs affection 15)",
      function () {
        datingNight(person, false);
        again();
      },
    );
  night.disabled = !ready || spent;
  if (isPartner && datingCanConceive(person))
    mbtn(d, "🍼", "Try for a baby", function () {
      datingNight(person, true);
      again();
    }).disabled = spent;
  if (person.role === "match")
    mbtn(d, "🚫", "Unmatch", function () {
      S.life.people = S.life.people.filter(function (other) {
        return other !== person;
      });
      lifeNote("Unmatched with " + person.name + ".", "relationship");
      save();
      lifeRelationshipsScreen();
    });
}
function datingBirth() {
  if (!S.life.expecting) return;
  var other = S.life.expecting.with;
  S.life.expecting = null;
  var child = lifeAddChild(other);
  lifeRecord("Welcomed baby " + child.name + " into the world with " + other + "!", "family");
  hp(10);
}
