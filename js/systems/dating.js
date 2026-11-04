// StickMatch, the phone's dating app. Adults only: the player must be 18 and
// every profile is generated at 18 or older. Matches are ordinary life people,
// so they use the relationship screen and can become partners and parents.
var DATE_PER_DAY = 5,
  DATE_NAMES = {
    woman: ["Ava", "Bea", "Cleo", "Dana", "Elsa", "Faye", "Gia", "Hana", "Iris", "June", "Kira", "Lena", "Maya", "Nora", "Opal", "Priya"],
    man: ["Abe", "Ben", "Cole", "Dev", "Eli", "Finn", "Gabe", "Hugo", "Ivan", "Jace", "Kai", "Leo", "Marco", "Nate", "Omar", "Pedro"],
    nonbinary: ["Alex", "Blair", "Casey", "Drew", "Emery", "Quinn", "Rowan", "Sage"],
  },
  DATE_ICONS = { woman: "👩", man: "👨", nonbinary: "🧑" },
  DATE_SEEK = { everyone: "Everyone", woman: "Women", man: "Men" },
  DATE_BIOS = [
    "Looking for someone to get lost in the city with.",
    "Will judge you by your coffee order.",
    "Dog person. Open to negotiations.",
    "Probably at the arcade right now.",
    "Here for good talks and bad karaoke.",
    "My mom thinks I should get out more.",
    "I cook. You do the dishes.",
    "Terrible at texting back, great in person.",
    "Saving up for a mansion. Accepting help.",
    "Always down for a walk in the rain.",
  ];

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
        bio: pick(DATE_BIOS),
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
function datingPage() {
  if (S.age < 18)
    return '<div class="card">StickMatch is only for adults. Come back when you turn 18.</div>';
  var st = datingState(),
    profile = st.deck[0],
    h =
      '<div class="card">Show me: <b>' +
      DATE_SEEK[st.seek] +
      "</b>" +
      pb("dateSeek", "", "Change") +
      "</div>";
  if (profile)
    h +=
      '<div class="card" style="text-align:center"><div style="font-size:54px;line-height:1.2">' +
      DATE_ICONS[profile.gender] +
      '</div><div style="font-weight:700;font-size:20px">' +
      esc(profile.name) +
      ", " +
      profile.age +
      '</div><div style="margin:4px 0 10px">' +
      esc(profile.personality) +
      " · " +
      esc(profile.bio) +
      "</div>" +
      pb("dateLike", "", "❤️ Like") +
      pb("datePass", "", "✖ Pass") +
      "</div>";
  else
    h +=
      '<div class="card">That is everyone for today. New people join tomorrow.</div>';
  var matches = datingMatches();
  h +=
    '<div class="card"><b>Your matches</b>' +
    (matches.length ? "" : "<div>No matches yet. Keep swiping!</div>") +
    matches
      .map(function (person) {
        return pb(
          "dateOpen",
          person.id,
          (person.name === S.partner ? "💞 " : "💘 ") +
            esc(person.name) +
            ", " +
            person.age +
            " · affection " +
            Math.round(person.affection),
        );
      })
      .join("") +
    "</div>";
  return h;
}
PA.dateSeek = function () {
  var st = datingState(),
    order = Object.keys(DATE_SEEK);
  st.seek = order[(order.indexOf(st.seek) + 1) % order.length];
  st.deck = datingDeal(st.seek, st.left);
};
PA.datePass = function () {
  var st = datingState();
  st.deck.shift();
  st.left--;
  save();
};
PA.dateLike = function () {
  var st = datingState(),
    profile = st.deck.shift();
  if (S.age < 18 || !profile) return;
  st.left--;
  var odds = 0.35 + S.cha * 0.01 + (S.life.looks || 0) / 200;
  if (Math.random() < Math.min(0.9, odds)) {
    profile.role = "match";
    profile.affection = 8;
    delete profile.bio;
    lifeAddPerson(profile);
    lifeNote("Matched with " + profile.name + " on StickMatch.", "relationship");
    pmsg = "It's a match! Say hi to " + profile.name + ".";
  } else pmsg = profile.name + " didn't like you back.";
  save();
};
PA.dateOpen = function (id) {
  cityHubFromPhone = true;
  phn.hidden = true;
  lifePersonScreen(id);
};

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
  mbtn(d, "🍽️", "Go on a date ($30)", function () {
    if (!citySpend(30)) return;
    adv(2);
    hp(3);
    lifeChangeAffection(person, 6);
    lifeNote("Went on a date with " + person.name + ".", "relationship");
    again();
  }).disabled = S.cash < 30;
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
