var LIFE_KEY = DEV_MODE ? "stickCityDevLegacy1" : "stickCityLegacy1",
  LIFE_NEXT_KEY = DEV_MODE ? "stickCityDevNextLife1" : "stickCityNextLife1";

function lifeInit() {
  if (!S.life || typeof S.life !== "object") S.life = {};
  var l = S.life;
  if (!Array.isArray(l.feed)) l.feed = [];
  if (!Array.isArray(l.people)) l.people = [];
  if (!Array.isArray(l.family)) l.family = [];
  if (!Array.isArray(l.children)) l.children = [];
  if (!Array.isArray(l.pets)) l.pets = [];
  if (!Array.isArray(l.criminalRecord)) l.criminalRecord = [];
  if (!Array.isArray(l.illnesses)) l.illnesses = [];
  if (!Array.isArray(l.habits)) l.habits = [];
  if (!l.flags || typeof l.flags !== "object") l.flags = {};
  if (!l.assets || typeof l.assets !== "object") l.assets = {};
  if (!Number.isFinite(l.assets.jewelry)) l.assets.jewelry = 0;
  if (!Number.isFinite(l.assets.jewelryAge)) l.assets.jewelryAge = 0;
  if (!Number.isFinite(l.assets.insured)) l.assets.insured = 0;
  if (!l.school || typeof l.school !== "object") l.school = {};
  if (!Number.isFinite(l.school.universityYears)) l.school.universityYears = 0;
  if (!Number.isFinite(l.health)) l.health = 75;
  if (!Number.isFinite(l.looks)) l.looks = 50;
  if (!Number.isFinite(l.debt)) l.debt = 0;
  if (!Number.isFinite(l.prisonYears)) l.prisonYears = 0;
  if (!Number.isFinite(l.pension)) l.pension = 0;
  if (!Number.isFinite(l.jobYears)) l.jobYears = 0;
  if (!Number.isFinite(l.jobShifts)) l.jobShifts = 0;
  if (!Number.isFinite(l.vehicleWear)) l.vehicleWear = 0;
  if (!Number.isFinite(l.homeWear)) l.homeWear = 0;
  if (!l.homeAges || typeof l.homeAges !== "object") {
    l.homeAges = {};
    ["apartment", "townhouse", "mansion"].forEach(function (key) {
      var owned =
        key === "mansion" ? S.mansion : S.owns && S.owns[key];
      if (owned)
        l.homeAges[key] = Math.round(l.homeWear / 0.005);
    });
  }
  if (!l.vehicleAges || typeof l.vehicleAges !== "object") {
    l.vehicleAges = {};
    Object.keys(S.garage || {}).forEach(function (key) {
      if (S.garage[key])
        l.vehicleAges[key] = Math.round(l.vehicleWear / 0.03);
    });
  }
  if (!l.mortgages || typeof l.mortgages !== "object") l.mortgages = {};
  if (!Number.isFinite(l.petCount)) l.petCount = 0;
  if (!Number.isFinite(l.lifeCount)) l.lifeCount = 1;
  if (!Number.isFinite(l.year)) l.year = 0;
  if (l.created && !l.ended && l.alive !== false) l.alive = true;
}
function lifeStage(age) {
  if (age <= 2) return "baby";
  if (age <= 12) return "child";
  if (age <= 17) return "teen";
  if (age <= 64) return "adult";
  return "senior";
}
function lifeLabel(stage) {
  return {
    baby: "Baby",
    child: "Child",
    teen: "Teen",
    adult: "Adult",
    senior: "Senior",
  }[stage] || "Adult";
}
function lifeRecord(text, type) {
  lifeInit();
  var entry = {
    age: Math.max(0, Number(S.age) || 0),
    day: Math.max(1, Number(S.day) || 1),
    text: String(text),
    type: type || "life",
  };
  S.life.feed.push(entry);
  if (S.life.feed.length > 500) {
    // Everyday city notes go first so milestones outlive them.
    var drop = S.life.feed.findIndex(function (item) {
      return item.type === "city";
    });
    S.life.feed.splice(Math.max(0, drop), 1);
  }
}
function lifeCaptureLog(text) {
  lifeRecord(text, "city");
}
function lifeNote(text, type) {
  addLog(text);
  if (type && S.life.feed.length)
    S.life.feed[S.life.feed.length - 1].type = type;
}
function lifeBarValue(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}
function lifeHomeWear(key) {
  var age = S.life.homeAges[key];
  return Number.isFinite(age)
    ? Math.min(0.3, age * 0.005)
    : S.life.homeWear || 0;
}
function lifeVehicleWear(key) {
  var age = S.life.vehicleAges[key];
  return Number.isFinite(age)
    ? Math.min(0.9, age * 0.03)
    : S.life.vehicleWear || 0;
}
function lifeProgressNode(parent, label, value, max, color) {
  var wrap = document.createElement("div"),
    row = document.createElement("div"),
    name = document.createElement("span"),
    amount = document.createElement("span"),
    bar = document.createElement("progress");
  wrap.className = "life-stat";
  row.className = "life-stat-label";
  name.textContent = label;
  amount.textContent = Math.round(value) + "/" + max;
  row.appendChild(name);
  row.appendChild(amount);
  bar.max = max;
  bar.value = Math.max(0, Math.min(max, value));
  bar.setAttribute("aria-label", label + " " + amount.textContent);
  if (color) bar.style.setProperty("--life-progress", color);
  wrap.appendChild(row);
  wrap.appendChild(bar);
  parent.appendChild(wrap);
}
function lifeStatsScreen() {
  cityScreen(
    "📊 Life Stats",
    lifeLabel(lifeStage(S.age)) +
      " · Age " +
      S.age +
      " · Day " +
      S.day +
      " · Energy is separate from health.",
    function (d) {
      lifeProgressNode(d, "Happiness", lifeBarValue(S.hap), 100, "#f59e0b");
      lifeProgressNode(
        d,
        "Health",
        lifeBarValue(S.life.health),
        100,
        "#e34f4f",
      );
      lifeProgressNode(d, "Smarts", lifeBarValue(S.int), 100, "#477de8");
      lifeProgressNode(
        d,
        "Looks",
        lifeBarValue(S.life.looks),
        100,
        "#d34f9a",
      );
      lifeProgressNode(d, "Daily energy", lifeBarValue(S.en * 4), 100, "#39a66d");
      mbtn(d, "📰", "Open lifetime feed", lifeFeedScreen);
    },
  );
}
function lifeAddPerson(person) {
  lifeInit();
  var found = S.life.people.filter(function (p) {
    return p.id === person.id;
  })[0];
  if (found) return found;
  person.affection = Number(person.affection) || 0;
  person.alive = person.alive !== false;
  person.age = Math.max(0, Number(person.age) || 0);
  S.life.people.push(person);
  return person;
}
function lifePerson(name) {
  lifeInit();
  var person = S.life.people.filter(function (p) {
    return p.id === name || p.name === name;
  })[0];
  if (person) return person;
  var npc = typeof NP !== "undefined"
    ? NP.filter(function (n) {
        return n.name === name && !n.cop && !n.amb;
      })[0]
    : null;
  if (!npc) return null;
  person = lifeAddPerson({
    id: name,
    name: name,
    role: S.life.job ? "coworker" : "friend",
    age: npc.age || Math.max(0, S.age),
    personality: ["curious", "kind", "bold", "thoughtful"][
      Math.floor(Math.random() * 4)
    ],
    affection: lvl(name),
    npc: 1,
  });
  return person;
}
function lifeFamilyStart(name, age) {
  var other = name.replace(/[^A-Za-z0-9]/g, "") || "Player";
  age = Math.max(0, Number(age) || 0);
  return [
    {
      id: "parent-1",
      name: "Ari " + other,
      role: "parent",
      age: age + 28,
      personality: "patient",
      affection: 10,
    },
    {
      id: "parent-2",
      name: "Tavi " + other,
      role: "parent",
      age: age + 30,
      personality: "curious",
      affection: 10,
    },
    {
      id: "sibling",
      name: "Kai " + other,
      role: "sibling",
      age: Math.max(0, age + Math.floor(Math.random() * 11) - 5),
      personality: "playful",
      affection: 6,
    },
  ];
}
function lifeSetNewCharacter(profile) {
  lifeInit();
  var l = {
    created: 1,
    alive: true,
    name: profile.name,
    gender: profile.gender,
    birthplace: profile.birthplace,
    parentName: profile.parentName || "",
    stage: "baby",
    health: profile.health,
    looks: profile.looks,
    family: [],
    people: [],
    children: [],
    feed: [],
    flags: {},
    assets: { jewelry: 0, jewelryAge: 0, insured: 0 },
    homeAges: {},
    vehicleAges: {},
    school: { grade: 1, years: 0, universityYears: 0, gpa: 2 },
    criminalRecord: [],
    illnesses: [],
    habits: [],
    debt: 0,
    prisonYears: 0,
    pension: 0,
    job: "",
    jobLevel: 0,
    jobYears: 0,
    jobShifts: 0,
    retired: 0,
    vehicleWear: 0,
    homeWear: 0,
    mortgages: {},
    petCount: 0,
    lifeCount: 1,
    year: 0,
    challenge: profile.challenge || "",
  };
  l.family = profile.parentName
    ? [
        {
          id: "legacy-parent-" + profile.parentName,
          name: profile.parentName,
          role: "parent",
          age: profile.parentAge || 60,
          personality: "remembered",
          affection: 30,
          alive: false,
        },
      ]
    : lifeFamilyStart(profile.name, 0);
  l.family.forEach(function (p) {
    l.people.push(p);
  });
  if (l.challenge === "social") {
    l.people.push({
      id: "neighbor-" + profile.name,
      name: "Rin",
      role: "friend",
      age: 1,
      personality: "kind",
      affection: 15,
    });
  }
  S.life = l;
  var legacy = lifeLegacyRead();
  legacy.challenges.selected = l.challenge;
  lifeLegacyWrite(legacy);
  S.age = 0;
  S.day = 1;
  S.cash = 100 + Math.max(0, Math.round(profile.inheritedCash || 0));
  S.bank = 0;
  S.hap = 60;
  S.en = MAXE;
  S.str = profile.str;
  S.int = profile.int;
  S.cha = profile.cha;
  S.k = 0;
  S.lv = S.lv || {};
  S.x = 600;
  S.y = 600;
  S.t = 6;
  l.lifeCount = lifeLegacyRead().lives.length + 1;
  if (l.challenge === "frugal") S.cash = 50;
  l.people.forEach(function (p) {
    S.lv[p.name] = p.affection;
  });
  lifeNote(profile.name + " was born in " + profile.birthplace + ".", "birth");
  lifeNote(
    "A new life began. Family: " +
      l.family.map(function (p) {
        return p.name;
      }).join(" and ") +
      ".",
    "family",
  );
  save();
  menu(false);
  closeMenu();
  say("Welcome, " + profile.name + "! Your life story begins.");
}
function lifeCharacterCreate() {
  LIFE_DRAFT = null;
  lifeCharacterForm();
}
function lifeCharacterForm() {
  paused = true;
  onTitle = true;
  keys = {};
  held = {};
  bp.hidden = true;
  var choices = lifeLegacyRead().challenges || {};
  mshow(
    "✨ Create a life",
    [
      "Choose a name, gender, and birthplace. Your starting family and skills are randomized.",
    ],
    function (d) {
      var nameLabel = document.createElement("label"),
        name = document.createElement("input"),
        genderLabel = document.createElement("label"),
        gender = document.createElement("select"),
        placeLabel = document.createElement("label"),
        place = document.createElement("select"),
        challengeLabel = document.createElement("label"),
        challenge = document.createElement("select");
      nameLabel.htmlFor = "life-name";
      nameLabel.textContent = "Name";
      name.id = "life-name";
      name.maxLength = 18;
      name.placeholder = "2–18 letters";
      name.autocomplete = "off";
      name.className = "life-input";
      genderLabel.htmlFor = "life-gender";
      genderLabel.textContent = "Gender";
      gender.id = "life-gender";
      [
        ["girl", "Girl"],
        ["boy", "Boy"],
        ["nonbinary", "Nonbinary"],
      ].forEach(function (a) {
        var option = document.createElement("option");
        option.value = a[0];
        option.textContent = a[1];
        gender.appendChild(option);
      });
      gender.className = "life-input";
      placeLabel.htmlFor = "life-place";
      placeLabel.textContent = "Birthplace";
      place.id = "life-place";
      ["Stick City", "Sunberry Bay", "Acorn Point"].forEach(function (a) {
        var option = document.createElement("option");
        option.value = a;
        option.textContent = a;
        place.appendChild(option);
      });
      place.className = "life-input";
      challengeLabel.htmlFor = "life-challenge";
      challengeLabel.textContent = "Challenge run";
      challenge.id = "life-challenge";
      [
        ["", "Standard life"],
        ["frugal", "Frugal: begin with $50"],
        ["scholar", "Scholar: extra study growth"],
        ["social", "Social: begin with a friendly neighbor"],
      ].forEach(function (a) {
        var option = document.createElement("option");
        option.value = a[0];
        option.textContent = a[1];
        option.selected = choices.selected === a[0];
        challenge.appendChild(option);
      });
      challenge.className = "life-input";
      var error = document.createElement("small");
      error.id = "life-create-error";
      error.className = "life-error";
      error.setAttribute("role", "alert");
      [
        [nameLabel, name],
        [genderLabel, gender],
        [placeLabel, place],
        [challengeLabel, challenge],
      ].forEach(function (field) {
        var wrap = document.createElement("div");
        wrap.className = "life-field";
        wrap.appendChild(field[0]);
        wrap.appendChild(field[1]);
        d.appendChild(wrap);
      });
      d.appendChild(error);
      var start = mbtn(d, "🌱", "Start life", function () {
        var value = name.value.trim();
        if (!/^[\p{L}][\p{L} '-]{1,17}$/u.test(value)) {
          error.textContent =
            "Enter a 2–18 character name using letters, spaces, apostrophes, or hyphens.";
          name.focus();
          return;
        }
        var profile = {
          name: value,
          gender: gender.value,
          birthplace: place.value,
          challenge: challenge.value,
          str: 15 + Math.floor(Math.random() * 36),
          int: 15 + Math.floor(Math.random() * 36),
          cha: 15 + Math.floor(Math.random() * 36),
          health: 65 + Math.floor(Math.random() * 31),
          looks: 25 + Math.floor(Math.random() * 61),
        };
        lifeSetNewCharacter(profile);
      });
      start.classList.add("life-primary");
      mbtn(d, "⬅️", "Back to title", function () {
        menu(true);
      });
    },
  );
  var input = document.getElementById("life-name");
  if (input) input.focus();
}
function lifeContinueLegacy() {
  lifeInit();
  S.life.created = 1;
  S.life.alive = true;
  S.life.name = S.life.name || "Resident";
  S.life.gender = S.life.gender || "unspecified";
  S.life.birthplace = S.life.birthplace || "Stick City";
  S.life.stage = lifeStage(S.age);
  if (!S.life.family.length) {
    S.life.family = lifeFamilyStart(S.life.name, S.age);
    S.life.family.forEach(lifeAddPerson);
  }
  lifeRecord(
    "Continued an existing save at age " +
      S.age +
      ". New character details can be updated later.",
    "milestone",
  );
  save();
  closeMenu();
  say("Welcome back. Your existing age and progress are preserved.");
}
function lifeEventEligible(event) {
  if (!event || !Array.isArray(event.choices) || !event.choices.length)
    return false;
  if (event.stage && event.stage !== "any" && event.stage !== S.life.stage)
    return false;
  if (event.once && S.life.flags[event.once || event.id]) return false;
  if (event.followup && S.life.flags["seen:" + event.followup]) return false;
  if (typeof event.ok === "function") {
    try {
      return !!event.ok();
    } catch (error) {
      console.error("Life event eligibility failed:", event.id, error);
      return false;
    }
  }
  return true;
}
function lifePickEvent() {
  var events = LIFE_EVENTS.filter(lifeEventEligible);
  if (!events.length) return null;
  return events[Math.floor(Math.random() * events.length)];
}
function lifeApplyEventEffect(effect) {
  effect = effect || {};
  if (effect.happiness) hp(effect.happiness);
  if (effect.health)
    S.life.health = lifeBarValue(S.life.health + effect.health);
  if (effect.smarts) S.int = lifeBarValue(S.int + effect.smarts);
  if (effect.charisma) S.cha += effect.charisma;
  if (effect.looks) S.life.looks = lifeBarValue(S.life.looks + effect.looks);
  if (effect.cash) {
    S.cash += effect.cash < 0 ? Math.max(effect.cash, -S.cash) : effect.cash;
  }
  if (effect.karma) S.k += effect.karma;
  if (effect.relationship) {
    var person = S.life.people.filter(function (p) {
      return p.alive && p.role !== "child";
    })[0];
    if (person) lifeChangeAffection(person, effect.relationship);
  }
  if (effect.flag) S.life.flags[effect.flag] = 1;
}
function lifeShowEvent(event, after) {
  if (!event) {
    say("No age-appropriate life events are available this year.");
    if (after) after();
    return;
  }
  paused = true;
  onTitle = true;
  keys = {};
  held = {};
  bp.hidden = true;
  mshow("📖 " + event.title, ["A moment in your life has arrived."], function (d) {
    event.choices.forEach(function (choice) {
      mbtn(d, "▶", choice.label, function () {
        try {
          lifeApplyEventEffect(choice.effect);
          if (event.once) S.life.flags[event.once || event.id] = 1;
          if (event.followup)
            S.life.flags["seen:" + event.followup] = 1;
          lifeNote(
            event.title + ": " + choice.label + ".",
            "event",
          );
          save();
          closeMenu();
          if (after) after();
        } catch (error) {
          console.error("Life event choice failed:", event.id, choice.label, error);
          closeMenu();
          say(
            "That life choice could not be completed: " +
              (error && error.message ? error.message : String(error)),
          );
        }
      });
    });
  });
}
function lifeYearSummary(days, report) {
  var event = lifePickEvent(),
    cutoffDay = S.day - days,
    highlights = S.life.feed
      .filter(function (entry) {
        return (
          entry.day > cutoffDay &&
          entry.text !== overnightMsg &&
          ["city", "family", "finance"].indexOf(entry.type) >= 0
        );
      })
      .map(function (entry) {
        return entry.text;
      })
      .slice(-6),
    facts = [];
  if (S.life.school.years)
    facts.push([
      "🎓 School",
      "Grade " +
        (S.life.school.grade || 1) +
        " · GPA " +
        Number(S.life.school.gpa || 2).toFixed(1),
    ]);
  if (S.life.job)
    facts.push([
      "💼 Work",
      S.life.job +
        " · level " +
        (S.life.jobLevel + 1) +
        " · " +
        S.life.jobShifts +
        " shifts",
    ]);
  if (S.life.pension)
    facts.push(["🧓 Pension", "$" + S.life.pension + "/year"]);
  if (S.life.children.length)
    facts.push([
      "👪 Family",
      S.life.children
        .map(function (p) {
          return p.name + " (" + p.age + ")";
        })
        .join(", "),
    ]);
  if (S.life.illnesses.length)
    facts.push(["🩺 Health", S.life.illnesses.join(", ")]);
  if (S.life.habits.length)
    facts.push(["🌱 Wellbeing", S.life.habits.join(", ")]);
  if (event) facts.push(["✨ Coming up", event.title]);
  mshow(
    "📊 Day " + S.day + " report",
    [
      reportNode(report, {
        life: true,
        tags: [
          S.life.name + " · Age " + S.age + " · " + lifeLabel(S.life.stage),
          (WEATHER_ICON[S.weather] || "🌤") + " " + S.weather,
          seasonName(),
        ],
        highlights: highlights,
        facts: facts,
      }),
    ],
    function (d) {
      if (event)
        mbtn(d, "✨", "Choose today's life event", function () {
          lifeShowEvent(event);
        });
      rewindButton(d);
      mbtn(d, "📰", "Read the life feed", lifeFeedScreen);
      mbtn(d, "▶", "Return to the city", closeMenu);
    },
  );
}
function lifeAgeUp() {
  lifeInit();
  if (!S.life.created) {
    say("Start a new life or continue an existing save to age up.");
    return;
  }
  if (!S.life.alive) {
    say("This life has ended.");
    return;
  }
  newDay();
}
function lifeOnBirthday(options) {
  lifeInit();
  S.life.year++;
  S.life.stage = lifeStage(S.age);
  var oldStage = lifeStage(Math.max(0, S.age - 1));
  lifeRecord(
    "Turned " + S.age + " and entered the " + lifeLabel(S.life.stage) + " stage.",
    "birthday",
  );
  if (oldStage !== S.life.stage)
    lifeRecord("Life stage changed to " + lifeLabel(S.life.stage) + ".", "stage");

  S.life.people.forEach(function (person) {
    if (person.alive && person.age >= 0) person.age++;
  });
  S.life.children = S.life.people.filter(function (person) {
    return person.alive && person.role === "child";
  });
  datingBirth();
  if (S.life.school.enrolled) {
    S.life.school.gpa = Math.max(
      1,
      Math.min(4, Number(S.life.school.gpa || 2) + (S.int >= 50 ? 0.2 : -0.05)),
    );
    if (S.life.school.level === "university") {
      S.life.school.universityYears++;
    } else {
      S.life.school.years++;
      S.life.school.grade = Math.min(12, (S.life.school.grade || 1) + 1);
    }
    if (
      S.life.school.level === "university" &&
      S.life.school.universityYears >= 4
    ) {
      S.life.school.level = "graduate";
      S.life.school.enrolled = 0;
      S.life.flags.degree = 1;
      lifeRecord("Graduated from Stick City University.", "milestone");
    }
    if (S.age >= 13 && S.life.school.level === "primary school") {
      S.life.school.level = "high school";
      lifeRecord("Started high school.", "school");
    }
  }
  if (S.age >= 18 && S.life.school.level === "high school") {
    S.life.school.level = "high school graduate";
    S.life.school.enrolled = 0;
    S.life.flags.highSchoolDiploma = 1;
    lifeRecord("Graduated from high school.", "milestone");
  }
  if (S.life.job && !S.life.retired) {
    S.life.jobYears++;
    if (S.life.jobShifts >= 3 && S.life.jobYears % 2 === 0) {
      S.life.jobLevel++;
      lifeRecord("Earned a promotion at " + S.life.job + ".", "career");
    }
  }
  if (S.life.retired && S.life.pension) {
    S.cash += S.life.pension;
    S.lifetimeEarned += S.life.pension;
    lifeRecord("Received a $" + S.life.pension + " retirement pension.", "career");
  }
  ["apartment", "townhouse", "mansion"].forEach(function (key) {
    var owned = key === "mansion" ? S.mansion : S.owns[key];
    if (owned) S.life.homeAges[key] = (S.life.homeAges[key] || 0) + 1;
  });
  Object.keys(S.garage || {}).forEach(function (key) {
    if (S.garage[key])
      S.life.vehicleAges[key] = (S.life.vehicleAges[key] || 0) + 1;
  });
  S.life.assets.jewelryAge = (S.life.assets.jewelryAge || 0) + 1;
  if (S.life.assets.jewelry)
    S.life.assets.jewelry = Math.max(
      0,
      Math.round(S.life.assets.jewelry * 0.99),
    );
  if (S.life.debt > 0) S.life.debt = Math.ceil(S.life.debt * 1.08);
  Object.keys(S.life.mortgages).forEach(function (key) {
    S.life.mortgages[key] = Math.ceil(S.life.mortgages[key] * 1.08);
  });

  var yearlyTax =
    (S.owns.apartment ? 7 : 0) +
    (S.owns.townhouse ? 17 : 0) +
    (S.mansion ? 30 : 0) +
    Math.floor((S.life.assets.jewelry || 0) * 0.01);
  if (yearlyTax > 0) {
    var paidTax = Math.min(S.cash, yearlyTax);
    S.cash -= paidTax;
    S.life.taxDue = yearlyTax - paidTax;
    if (S.life.taxDue) S.life.debt += S.life.taxDue;
    lifeRecord(
      paidTax === yearlyTax
        ? "Paid $" + paidTax + " in annual property and asset taxes."
        : "Annual taxes of $" + yearlyTax + " are due; $" + paidTax + " was paid.",
      "finance",
    );
  }
  if (S.life.illnesses.length && Math.random() < 0.65) {
    S.life.health = lifeBarValue(S.life.health - 8);
    lifeRecord("An untreated illness affected health this year.", "health");
  } else if (S.life.health > 80) {
    S.life.health = lifeBarValue(S.life.health + 2);
  }
  if (S.life.health < 25 && !S.life.illnesses.length) {
    S.life.illnesses.push("a lingering cold");
    lifeRecord("A lingering cold needs care.", "health");
  }
  if (
    S.age >= 13 &&
    S.hap < 25 &&
    !S.life.habits.length &&
    Math.random() < 0.05
  ) {
    S.life.habits.push("compulsive late-night scrolling");
    lifeRecord(
      "A stressful year contributed to an unhealthy screen-time habit. Support and care are available.",
      "health",
    );
  }
  if (S.life.habits.length) {
    S.life.health = lifeBarValue(S.life.health - 3);
    hp(-2);
    lifeRecord("The screen-time habit affected your wellbeing this year.", "health");
  }
  if (S.life.prisonYears > 0) {
    S.life.prisonYears--;
    if (!S.life.prisonYears)
      lifeRecord("Your cartoonish sentence is complete.", "justice");
  }
  S.life.people.forEach(function (person) {
    if (
      !person.alive ||
      person.age < 72 ||
      Math.random() >= Math.min(0.18, 0.02 + (person.age - 72) * 0.01)
    )
      return;
    person.alive = false;
    lifeRecord(
      person.name + " passed away after a long life. The family held a small memorial.",
      "family",
    );
    if (person.role === "parent") {
      S.cash += 50;
      lifeRecord("Your family received a small $50 keepsake inheritance.", "finance");
    }
    if (person.name === S.partner) {
      S.partner = "";
      S.life.flags.engaged = 0;
      S.life.flags.married = 0;
    }
  });
  lifeCheckLegacyGoals();

  var oldAgeRisk =
    S.age < 70 ? 0 : Math.min(0.45, 0.01 + (S.age - 70) * 0.012);
  var healthRisk =
    S.life.health < 10 ? 0.08 : S.life.health < 25 ? 0.025 : 0;
  if (S.life.health < 5 && Math.random() < 0.08)
    return lifeDeath("illness");
  if (Math.random() < 0.003) {
    if (S.life.assets.insuredUntil >= S.life.year) {
      lifeRecord("Insurance covered a minor city accident.", "health");
    } else {
      S.life.health = lifeBarValue(S.life.health - 20);
      lifeRecord("A minor city accident required a quiet recovery.", "health");
    }
  }
  S.life.people.forEach(function (person) {
    if (
      person.alive &&
      person.role === "pet" &&
      person.age >= 12 &&
      Math.random() < 0.08
    ) {
      person.alive = false;
      lifeRecord(person.name + " passed away after a long, happy life.", "family");
    }
  });
  if (S.life.health <= 0) return lifeDeath("accident");
  if (S.age >= 70 && Math.random() < oldAgeRisk + healthRisk) {
    lifeNote(
      S.life.health < 25
        ? "Your life ended after a long illness."
        : "You died peacefully after a long life.",
      "death",
    );
    return lifeDeath(
      S.life.health < 25 ? "illness" : "old age",
    );
  }
  lifeNote(
    "A year passed: " +
      S.age +
      " candles, " +
      S.life.jobShifts +
      " career shifts completed.",
    "summary",
  );
  save();
  lifeYearSummary(options && options.days ? options.days : 1, options && options.report);
  currentLifeDayReport = null;
}
function lifeFeedScreen() {
  lifeInit();
  var feed = S.life.feed.slice().reverse();
  cityScreen(
    "📰 Life Feed",
    "Memories are grouped by age. " +
      feed.length +
      " recorded moments.",
    function (d) {
      if (!feed.length) {
        var empty = document.createElement("p");
        empty.textContent = "Your story is waiting to begin.";
        d.appendChild(empty);
        return;
      }
      var lastAge = -1;
      feed.slice(0, 100).forEach(function (entry) {
        if (entry.age !== lastAge) {
          lastAge = entry.age;
          var heading = document.createElement("h2");
          heading.className = "life-feed-age";
          heading.textContent = "Age " + lastAge;
          d.appendChild(heading);
        }
        var line = document.createElement("p");
        line.className = "life-feed-entry";
        line.textContent = "Day " + entry.day + " · " + entry.text;
        d.appendChild(line);
      });
      if (feed.length > 100) {
        var older = document.createElement("p");
        older.textContent = "Showing the 100 most recent moments.";
        d.appendChild(older);
      }
    },
  );
}
function lifePeopleScreen() {
  lifeInit();
  var discovered = NP.filter(function (n) {
    return n.name && !n.cop && !n.amb;
  });
  discovered.forEach(function (n) {
    if (S.lv[n.name] > 0) lifePerson(n.name);
  });
  cityScreen(
    "👥 Relationships",
    "People age and relationships change. Romance is available only when both characters are adults.",
    function (d) {
      S.life.people.forEach(function (person) {
        if (!person.alive) return;
        var button = mbtn(
          d,
          person.role === "parent"
            ? "🏠"
            : person.role === "child"
              ? "🧒"
              : person.role === "pet"
                ? "🐾"
                : person.role === "sibling"
                  ? "👧"
                  : "👤",
          person.name +
            " · " +
            person.role +
            " · age " +
            person.age +
            " · affection " +
            Math.round(person.affection),
          function () {
            lifePersonScreen(person.id);
          },
        );
        button.disabled = false;
      });
      discovered.forEach(function (npc) {
        if (
          S.life.people.some(function (person) {
            return person.id === npc.name && person.alive;
          })
        )
          return;
        mbtn(d, "👋", "Meet " + npc.name, function () {
          var person = lifePerson(npc.name);
          lifeRecord("Met " + npc.name + " in the city.", "relationship");
          save();
          lifePersonScreen(person.id);
        });
      });
      if (S.partner)
        mbtn(d, "💞", "Relationship with " + S.partner, function () {
          lifePersonScreen(S.partner);
        });
    },
  );
}
function lifeChangeAffection(person, amount) {
  person.affection = Math.max(0, Math.min(100, person.affection + amount));
  if (person.npc) S.lv[person.name] = person.affection;
}
function lifePersonScreen(id) {
  var person = lifePerson(id);
  if (!person) return;
  cityScreen(
    "👤 " + person.name,
    lifeLabel(lifeStage(person.age)) +
      " · age " +
      person.age +
      " · " +
      person.personality +
      " · " +
      person.role +
      ".",
    function (d) {
      lifeProgressNode(
        d,
        "Relationship",
        Math.round(person.affection),
        100,
        "#d34f9a",
      );
      (person.role === "pet"
        ? [
            ["🎾", "Play together", 4, 0],
            ["🦴", "Give a treat ($5)", 3, 5],
          ]
        : [
            ["💬", "Talk", 2, 0],
            ["🕰️", "Spend time together", 4, 0],
            ["🌷", "Give a small gift ($15)", 5, 15],
            ["💵", "Ask for help", 1, 0],
            ["🗯️", "Argue", -6, 0],
            ["💐", "Compliment", 3, 0],
          ]
      ).forEach(function (action) {
        var b = mbtn(d, action[0], action[1], function () {
          if (
            (action[1].indexOf("gift") >= 0 ||
              action[1].indexOf("treat") >= 0) &&
            !citySpend(action[3])
          )
            return;
          if (action[1] === "Ask for help") {
            var support =
              person.role === "parent" && person.affection >= 5
                ? 50
                : person.affection >= 20
                  ? 20
                  : 0;
            if (support && Math.random() < 0.7) {
              S.cash += support;
              lifeNote(
                person.name + " helped you with $" + support + ".",
                "relationship",
              );
            } else {
              lifeChangeAffection(person, -1);
              lifeNote(person.name + " could not help right now.", "relationship");
            }
          } else {
            lifeChangeAffection(person, action[2]);
            if (action[1] === "Argue") hp(-3);
            if (action[1] === "Compliment") hp(1);
            if (action[1] === "Spend time together") {
              hp(3);
              adv(1);
            }
            lifeNote(
              action[1] +
                " with " +
                person.name +
                ". Relationship " +
                (action[2] >= 0 ? "+" : "") +
                action[2] +
                ".",
              "relationship",
            );
          }
          save();
          lifePersonScreen(person.id);
        });
        if (
          action[1] === "Give a small gift ($15)" ||
          action[1] === "Give a treat ($5)"
        )
          b.disabled = S.cash < action[3];
      });
      var adultPair =
          S.age >= 18 &&
          person.age >= 18 &&
          ["parent", "child", "pet", "sibling"].indexOf(person.role) < 0,
        partner = S.partner === person.name;
      if (adultPair && !partner && !S.partner) {
        var ask = mbtn(
          d,
          "💌",
          person.affection < 15
            ? "Ask on a date (needs affection 15)"
            : "Ask on a friendly date",
          function () {
            if (S.age < 18 || person.age < 18 || person.affection < 15) return;
            adv(1);
            if (Math.random() < 0.65 + S.cha * 0.005) {
              S.partner = person.name;
              person.role = "partner";
              lifeChangeAffection(person, 5);
              lifeNote("Started dating " + person.name + ".", "relationship");
            } else {
              lifeChangeAffection(person, -2);
              lifeNote(person.name + " preferred to stay friends.", "relationship");
            }
            save();
            lifePersonScreen(person.id);
          },
        );
        ask.disabled = person.affection < 15;
      }
      if (adultPair && partner) {
        if ((S.lv[person.name] || person.affection) >= 30 && !S.life.flags.engaged) {
          mbtn(d, "💍", "Get engaged", function () {
            if (S.age < 18 || person.age < 18) return;
            S.life.flags.engaged = 1;
            lifeNote("Got engaged to " + person.name + ".", "relationship");
            save();
            lifePersonScreen(person.id);
          });
        }
        if (S.life.flags.engaged && !S.life.flags.married) {
          mbtn(d, "💒", "Get married", function () {
            if (S.age < 18 || person.age < 18) return;
            S.life.flags.married = 1;
            lifeNote("Married " + person.name + " in a small city ceremony.", "family");
            save();
            lifePersonScreen(person.id);
          });
        }
        if (S.life.flags.married) {
          mbtn(d, "👶", "Adopt a child ($200)", function () {
            lifeAdoptChild(person.name);
            save();
            lifePersonScreen(person.id);
          }).disabled = S.cash < 200;
        }
        mbtn(d, "💔", "Separate amicably", function () {
          S.partner = "";
          S.life.flags.married = 0;
          S.life.flags.engaged = 0;
          person.role = "friend";
          lifeChangeAffection(person, -5);
          lifeNote("Separated from " + person.name + ".", "family");
          save();
          lifeRelationshipsScreen();
        });
      }
      datingButtons(d, person);
      if (person.role === "child")
        mbtn(d, "📖", "Read a story together", function () {
          lifeChangeAffection(person, 3);
          hp(3);
          lifeNote("Read a story with " + person.name + ".", "family");
          save();
          lifePersonScreen(person.id);
        });
    },
    lifeRelationshipsScreen,
  );
}
function lifeRelationshipsScreen() {
  lifePeopleScreen();
}
function lifeAddChild(partnerName) {
  var number =
      S.life.people.filter(function (person) {
        return person.role === "child";
      }).length + 1,
    names = ["Milo", "Nia", "Jun", "Remy", "Ari", "Theo", "Luna", "Otis", "Wren", "Sol"].filter(function (name) {
      return !S.life.people.some(function (person) {
        return person.name === name;
      });
    }),
    child = lifeAddPerson({
      id: "child-" + S.life.lifeCount + "-" + number,
      name: names.length
        ? names[Math.floor(Math.random() * names.length)]
        : "Kid " + number,
      role: "child",
      age: 0,
      personality: ["curious", "kind", "bold", "thoughtful"][
        Math.floor(Math.random() * 4)
      ],
      affection: 10,
      parent: S.life.name,
      otherParent: partnerName || "",
    });
  S.life.children.push(child);
  return child;
}
function lifeAdoptChild(partnerName) {
  if (S.age < 18 || S.cash < 200) return false;
  S.cash -= 200;
  var child = lifeAddChild(partnerName);
  lifeNote("Welcomed " + child.name + " into the family by adoption.", "family");
  return child;
}
function lifeSchoolScreen() {
  lifeInit();
  var stage = lifeStage(S.age);
  cityScreen(
    "🎓 School & Learning",
    stage === "child" || stage === "teen"
      ? "School progress: grade " +
          (S.life.school.grade || 1) +
          " · GPA " +
          Number(S.life.school.gpa || 2).toFixed(1) +
          ". Smarts improve study results."
      : "Learning remains available at every age. Formal school follows your life stage.",
    function (d) {
      if (S.age >= 3 && S.age <= 17) {
        mbtn(
          d,
          "🏫",
          S.life.school.enrolled ? "Attend " + S.life.school.level : "Enroll in school",
          function () {
            S.life.school.enrolled = 1;
            S.life.school.level =
              S.age <= 12 ? "primary school" : "high school";
            lifeNote("Enrolled in " + S.life.school.level + ".", "school");
            lifeSchoolScreen();
          },
        );
        mbtn(d, "📚", "Study for two hours", lifeStudy);
      } else if (S.age >= 18 && S.age <= 25 && !S.life.flags.degree) {
        var uni = mbtn(
          d,
          "🏛️",
          S.life.school.level === "university"
            ? "University year " + (S.life.school.universityYears + 1)
            : "Enroll at Stick City University ($100)",
          function () {
            if (!S.life.school.enrolled && !citySpend(100)) return;
            S.life.school.enrolled = 1;
            S.life.school.level = "university";
            lifeNote("Started a year of university.", "school");
            lifeSchoolScreen();
          },
        );
        uni.disabled =
          !S.life.school.enrolled && S.cash < 100;
        mbtn(d, "📚", "Study for two hours", lifeStudy);
      } else {
        if (S.age < 3)
          mbtn(d, "🧸", "Early learning unlocks at age 3", function () {}).disabled = true;
        else
          mbtn(
            d,
            "📚",
            S.en < 3 ? "Study · needs 3 HP" : "Study a new subject",
            lifeStudy,
          ).disabled = S.en < 3;
      }
      if (S.life.school.level === "graduate")
        mbtn(d, "🎓", "Graduated · GPA " + Number(S.life.school.gpa).toFixed(1), function () {});
    },
  );
}
function lifeStudy() {
  if (S.en < 3) {
    say("You need 3 HP to study.");
    return;
  }
  S.en -= 2;
  var bonus = S.life.challenge === "scholar" ? 2 : 1;
  S.int = Math.min(100, S.int + bonus);
  S.life.school.gpa = Math.min(
    4,
    Number(S.life.school.gpa || 2) + (S.int >= 50 ? 0.12 : 0.06),
  );
  S.life.school.studied = (S.life.school.studied || 0) + 1;
  adv(2);
  hp(1);
  lifeNote("Studied and improved Smarts by " + bonus + ".", "school");
  save();
  lifeSchoolScreen();
}
function lifeCareerScreen() {
  lifeInit();
  cityScreen(
    "💼 School & Careers",
    S.life.job
      ? "Career: " +
          S.life.job +
          " · level " +
          (S.life.jobLevel + 1) +
          " · " +
          S.life.jobShifts +
          " shifts · " +
          (S.life.retired ? "retired" : "active") +
          "."
      : "Apply for an age-appropriate city career. Career locations use existing city buildings.",
    function (d) {
      if (S.age < 18) {
        mbtn(
          d,
          "🧒",
          S.age < 16 ? "Part-time work unlocks at 16" : "School first · careers at 18",
          function () {},
        ).disabled = true;
      }
      LIFE_CAREERS.forEach(function (job) {
        var meets =
            S.int >= (job.smarts || 0) &&
            S.cha >= (job.charisma || 0) &&
            S.str >= (job.strength || 0) &&
            S.k >= (job.karma || 0),
          lockedRecord =
            S.life.criminalRecord.length > 0 && job.recordRestricted,
          missing = [];
        if (S.int < (job.smarts || 0)) missing.push("INT " + job.smarts);
        if (S.cha < (job.charisma || 0)) missing.push("CHA " + job.charisma);
        if (S.str < (job.strength || 0)) missing.push("STR " + job.strength);
        if (S.k < (job.karma || 0)) missing.push("karma " + job.karma);
        var reason =
          S.age < 18
            ? "needs age 18"
            : S.life.prisonYears
              ? "unavailable while serving a sentence"
              : lockedRecord
                ? "record limits this role"
                : missing.length
                  ? "needs " + missing.join(", ")
                  : "";
        var label =
          job.title +
          " · $" +
          job.wage +
          "/shift · " +
          job.building +
          (job.special === "fame" && S.cr
            ? " · creator path"
            : "") +
          (reason ? " · " + reason : "");
        var button = mbtn(
          d,
          "📋",
          S.life.job === job.id ? "Current: " + label : "Apply: " + label,
          function () {
            if (S.age < 18 || S.life.prisonYears || !meets || lockedRecord)
              return;
            var chance = Math.min(
              0.9,
              0.5 +
                (S.int - (job.smarts || 0)) * 0.008 +
                (S.cha - (job.charisma || 0)) * 0.008 +
                S.life.school.gpa * 0.02,
            );
            if (job.special === "fame" && !S.cr.inf) chance *= 0.6;
            if (job.special === "business" && !Object.keys(S.businesses).length)
              chance *= 0.7;
            if (Math.random() < chance) {
              S.life.job = job.id;
              S.life.jobLevel = 0;
              S.life.jobYears = 0;
              S.life.retired = 0;
              lifeNote("Started work as a " + job.title + ".", "career");
              lifeWorkmate();
            } else {
              hp(-2);
              lifeNote("The interview did not lead to an offer for " + job.title + ".", "career");
            }
            save();
            lifeCareerScreen();
          },
        );
        button.disabled =
          S.age < 18 ||
          S.life.prisonYears > 0 ||
          !meets ||
          lockedRecord ||
          S.life.job === job.id;
      });
      if (S.life.job && !S.life.retired) {
        var current = LIFE_CAREERS.filter(function (job) {
          return job.id === S.life.job;
        })[0];
        mbtn(
          d,
          "📍",
          "Go to " + (current ? current.building : "your workplace"),
          lifeGoToWork,
        );
        mbtn(
          d,
          "🧰",
          "Work a shift at " + (current ? current.building : "your job"),
          lifeWorkShift,
        );
        mbtn(d, "🏖️", "Retire with a pension", lifeRetire);
      }
      if (S.life.retired)
        mbtn(d, "💰", "Annual pension: $" + S.life.pension, function () {});
      mbtn(d, "🎓", "School & study", lifeSchoolScreen);
    },
  );
}
function lifeWorkmate() {
  var person = S.life.people.filter(function (p) {
    return p.role === "coworker" && p.alive;
  })[0];
  if (!person) {
    var coworkers = NP.filter(function (n) {
      return n.name && !n.cop && !n.amb;
    });
    var name = coworkers[Math.floor(Math.random() * coworkers.length)];
    if (name) lifePerson(name.name).role = "coworker";
  }
}
function lifeGoToWork() {
  var job = LIFE_CAREERS.filter(function (j) {
      return j.id === S.life.job;
    })[0],
    building = job && B.filter(function (b) {
      return b.n === job.building;
    })[0];
  if (!building) {
    say("Your workplace is not available in this city.");
    return;
  }
  S.x = building.dx;
  S.y = building.dy + 85;
  lifeNote("Went to work at " + job.building + ".", "career");
  save();
  closeMenu();
}
function lifeWorkShift() {
  lifeInit();
  if (!S.life.job || S.life.retired || S.life.prisonYears) return;
  var job = LIFE_CAREERS.filter(function (j) {
      return j.id === S.life.job;
    })[0],
    pay = job ? Math.round(job.wage * (1 + S.life.jobLevel * 0.15)) : 0;
  if (!pay) return;
  S.cash += pay;
  S.lifetimeEarned += pay;
  S.life.jobShifts++;
  S.en = Math.max(1, S.en - 4);
  adv(4);
  hp(-1);
  if (S.life.jobShifts % 5 === 0) {
    var coworker = S.life.people.filter(function (p) {
      return p.role === "coworker";
    })[0];
    if (coworker) lifeChangeAffection(coworker, 1);
  }
  lifeNote("Worked a shift as " + job.title + " and earned $" + pay + ".", "career");
  lifeCheckLegacyGoals();
  save();
  lifeCareerScreen();
}
function lifeRetire() {
  if (!S.life.job || S.life.retired || S.age < 60) {
    say("Retirement is available from age 60.");
    return;
  }
  var job = LIFE_CAREERS.filter(function (j) {
    return j.id === S.life.job;
  })[0];
  S.life.retired = 1;
  S.life.pension = Math.max(
    20,
    Math.round((job ? job.wage : 40) * (0.5 + S.life.jobYears * 0.03)),
  );
  lifeNote("Retired with a yearly pension of $" + S.life.pension + ".", "career");
  save();
  lifeCareerScreen();
}
function lifeActivitiesScreen() {
  lifeInit();
  var minimumAge = [12, 3, 0, 8, 0, 18, 18, 18, 3, 18, 18, 18];
  cityScreen(
    "🎨 Activities & Wellbeing",
    "Choose healthy, non-graphic activities. Some take time, cost money, or carry a small risk.",
    function (d) {
      [
        ["🏋️", "Gym workout · $10", 10, 0],
        ["📚", "Library visit · free", 0, 1],
        ["🩺", "Visit the doctor · $40", 40, 2],
        ["🧘", "Meditate · free", 0, 3],
        ["🏖️", "Take a vacation · $120", 120, 4],
        ["✨", "Try a style refresh · $80", 80, 5],
        ["🎟️", "Enter a free city raffle · $5", 5, 6],
        ["🎵", "Go to a music night · $25", 25, 7],
        ["🧶", "Practice a hobby · $10", 10, 8],
        ["🐾", "Adopt a pet · $60", 60, 9],
        ["💎", "Buy jewelry · $100", 100, 10],
        ["🛡️", "Insure owned assets · $30", 30, 11],
      ].forEach(function (item, index) {
        var eligible = S.age >= minimumAge[index],
          affordable = S.cash >= item[2],
          b = mbtn(
          d,
          item[0],
          !eligible
            ? item[1] + " · needs age " + minimumAge[index]
            : !affordable
              ? item[1] + " · needs $" + item[2]
              : item[1],
          function () {
          lifeDoActivity(item[3]);
          },
        );
        b.disabled = !affordable || !eligible;
      });
      mbtn(d, "🏠", "Home, vehicles & finances", lifeAssetsScreen);
      if (S.life.illnesses.length)
        mbtn(d, "💊", "Health notes: " + S.life.illnesses.join(", "), function () {});
      if (S.life.habits.length)
        mbtn(d, "🩺", "Wellbeing support available", function () {});
    },
  );
}
function lifeDoActivity(kind) {
  var costs = [10, 0, 40, 0, 120, 80, 5, 25, 10, 60, 100, 30],
    minimumAge = [12, 3, 0, 8, 0, 18, 18, 18, 3, 18, 18, 18],
    cost = costs[kind];
  if (S.age < (minimumAge[kind] || 0)) {
    say("This activity is available from age " + minimumAge[kind] + ".");
    return;
  }
  if (!Number.isFinite(cost) || !citySpend(cost)) return;
  switch (kind) {
    case 0:
      S.str = Math.min(100, S.str + 2);
      S.life.health = lifeBarValue(S.life.health + 3);
      hp(2);
      lifeNote("A gym session improved strength and health.", "activity");
      adv(2);
      break;
    case 1:
      S.int = Math.min(100, S.int + (S.life.challenge === "scholar" ? 3 : 2));
      lifeNote("Spent a calm afternoon reading at the library.", "activity");
      adv(2);
      break;
    case 2:
      S.life.health = lifeBarValue(S.life.health + 15);
      S.life.illnesses = [];
      S.life.habits = [];
      lifeNote("A doctor visit improved your health.", "health");
      adv(2);
      break;
    case 3:
      hp(6);
      S.life.health = lifeBarValue(S.life.health + 2);
      S.life.habits = [];
      lifeNote("Meditated and found a little peace.", "activity");
      adv(1);
      break;
    case 4:
      hp(12);
      S.life.health = lifeBarValue(S.life.health + 5);
      S.life.looks = lifeBarValue(S.life.looks + 1);
      lifeNote("Returned from a relaxing vacation.", "activity");
      adv(4);
      break;
    case 5:
      S.life.looks = lifeBarValue(S.life.looks + 8);
      lifeNote("Tried a new, confidence-boosting style.", "activity");
      break;
    case 6:
      if (Math.random() < 0.12) {
        var prize = 40 + Math.floor(Math.random() * 61);
        S.cash += prize;
        lifeNote("Won $" + prize + " in the free city raffle.", "activity");
      } else {
        lifeNote("No raffle prize today, but the entry helped the library.", "activity");
        S.k++;
      }
      break;
    case 7:
      hp(7);
      S.cha++;
      lifeNote("Enjoyed a lively music night with friends.", "activity");
      adv(2);
      break;
    case 8:
      S.cha++;
      S.int++;
      hp(3);
      lifeNote("Practiced a hobby and learned something new.", "activity");
      adv(2);
      break;
    case 9:
      S.life.petCount++;
      var pet = lifeAddPerson({
        id: "pet-" + S.life.lifeCount + "-" + S.life.petCount,
        name: ["Sprout", "Pip", "Noodle", "Pebble", "Biscuit"][
          Math.floor(Math.random() * 5)
        ],
        role: "pet",
        age: 0,
        personality: ["playful", "gentle", "curious"][
          Math.floor(Math.random() * 3)
        ],
        affection: 10,
      });
      S.life.pets = S.life.pets || [];
      S.life.pets.push(pet);
      hp(5);
      lifeNote("Adopted " + pet.name + " from the city shelter.", "family");
      break;
    case 10:
      S.life.assets.jewelry =
        (S.life.assets.jewelry || 0) + Math.round(cost * 1.25);
      lifeNote("Bought a keepsake piece of jewelry.", "finance");
      break;
    case 11:
      S.life.assets.insuredUntil = S.life.year + 1;
      lifeNote("Insured your home and belongings for the year.", "finance");
      break;
  }
  lifeCheckLegacyGoals();
  save();
  lifeActivitiesScreen();
}
function lifeAssetsScreen() {
  lifeInit();
  var worth = Math.round(netWorth()),
    apartmentValue = Math.round(700 * (1 - lifeHomeWear("apartment"))),
    townhouseValue = Math.round(1700 * (1 - lifeHomeWear("townhouse"))),
    mansionValue = Math.round(3000 * (1 - lifeHomeWear("mansion"))),
    vehicles = [],
    mortgageTotal = Object.keys(S.life.mortgages).reduce(function (total, key) {
      return total + S.life.mortgages[key];
    }, 0);
  if (Array.isArray(VEHICLES)) {
    vehicles = VEHICLES.filter(function (vehicle) {
      return S.garage && S.garage[vehicle[0]];
    });
  }
  cityScreen(
    "🏠 Home, Vehicles & Finances",
    "Net worth: $" +
      worth.toLocaleString() +
      " · Debt: $" +
      Math.round(S.life.debt).toLocaleString() +
      " · Mortgage: $" +
      Math.round(mortgageTotal).toLocaleString() +
      " · Jewelry: $" +
      Math.round(S.life.assets.jewelry || 0).toLocaleString() +
      ".",
    function (d) {
      if (S.owns.apartment)
        mbtn(d, "🏢", "Apartment · estimated value $" + apartmentValue, function () {});
      if (S.owns.townhouse)
        mbtn(d, "🏘️", "Townhouse · estimated value $" + townhouseValue, function () {});
      if (S.mansion)
        mbtn(d, "🏰", "Mansion · estimated value $" + mansionValue, function () {});
      vehicles.forEach(function (vehicle) {
        mbtn(d, vehicle[4], vehicle[1] + " · owned", function () {});
      });
      if (!S.owns.apartment)
        mbtn(d, "🏢", "Buy an apartment · $700", function () {
          if (citySpend(700)) {
            S.owns.apartment = 1;
            lifeNote("Bought an apartment.", "finance");
            save();
            lifeAssetsScreen();
          }
        }).disabled = S.cash < 700;
      if (!S.owns.townhouse)
        mbtn(d, "🏘️", "Buy a townhouse · $1,700", function () {
          if (citySpend(1700)) {
            S.owns.townhouse = 1;
            lifeNote("Bought a townhouse.", "finance");
            save();
            lifeAssetsScreen();
          }
        }).disabled = S.cash < 1700;
      if (!S.mansion)
        mbtn(d, "🏰", "Buy a mansion · $3,000", function () {
          if (citySpend(3000)) {
            S.mansion = 1;
            lifeNote("Bought a mansion.", "finance");
            save();
            lifeAssetsScreen();
          }
        }).disabled = S.cash < 3000;
      [
        ["apartment", "Apartment", 700],
        ["townhouse", "Townhouse", 1700],
        ["mansion", "Mansion", 3000],
      ].forEach(function (home) {
        var owned = home[0] === "mansion" ? S.mansion : S.owns[home[0]],
          down = Math.ceil(home[2] * 0.1);
        if (owned) return;
        var mortgage = mbtn(
          d,
          "🏦",
          "Mortgage " +
            home[1] +
            " · $" +
            down +
            " down, $" +
            (home[2] - down) +
            " borrowed",
          function () {
            if (!citySpend(down)) return;
            if (home[0] === "mansion") S.mansion = 1;
            else S.owns[home[0]] = 1;
            S.life.mortgages[home[0]] = home[2] - down;
            S.life.debt += home[2] - down;
            lifeNote("Bought a " + home[1].toLowerCase() + " with a mortgage.", "finance");
            save();
            lifeAssetsScreen();
          },
        );
        mortgage.disabled = S.cash < down || S.life.debt + home[2] - down > 10000;
      });
      if (S.life.debt < 3000)
        mbtn(d, "🏦", "Take a small city loan · $250", function () {
          if (S.life.debt + 250 > 3000) return;
          S.life.debt += 250;
          S.cash += 250;
          lifeNote("Borrowed $250 from the city credit union.", "finance");
          save();
          lifeAssetsScreen();
        });
      if (S.life.debt > 0 && S.cash > 0)
        mbtn(d, "💳", "Pay down debt · $100", function () {
          var payment = Math.min(100, S.cash, S.life.debt);
          S.cash -= payment;
          S.life.debt -= payment;
          var remaining = payment;
          Object.keys(S.life.mortgages).forEach(function (key) {
            if (!remaining) return;
            var applied = Math.min(remaining, S.life.mortgages[key]);
            S.life.mortgages[key] -= applied;
            remaining -= applied;
            if (!S.life.mortgages[key]) delete S.life.mortgages[key];
          });
          lifeNote("Paid $" + payment + " toward debt.", "finance");
          save();
          lifeAssetsScreen();
        });
      mbtn(d, "🎨", "Back to activities", lifeActivitiesScreen);
    },
  );
}
function lifeCrimeScreen() {
  lifeInit();
  cityScreen(
    "⚖️ Justice & Choices",
    S.life.prisonYears > 0
      ? "You are serving " +
          S.life.prisonYears +
          " cartoonish sentence year(s). No real-world crime instructions are included."
      : "Petty cartoon mischief can lead to fines, court, and a short sentence. Available from age 16.",
    function (d) {
      if (S.life.prisonYears > 0) {
        mbtn(d, "📚", "Read quietly", function () {
          S.int = Math.min(100, S.int + 1);
          hp(1);
          lifeNote("Read quietly while serving your sentence.", "justice");
          save();
          lifeCrimeScreen();
        });
        mbtn(d, "🧹", "Complete a community-care shift", function () {
          S.life.prisonYears = Math.max(0, S.life.prisonYears - 1);
          lifeNote("Completed a community-care shift.", "justice");
          save();
          lifeCrimeScreen();
        });
        mbtn(d, "📜", "Ask the court for an appeal", function () {
          if (Math.random() < 0.25 + S.int * 0.005) {
            S.life.prisonYears = 0;
            lifeNote("The court approved your appeal.", "justice");
          } else {
            lifeNote("The court declined the appeal. Your sentence is unchanged.", "justice");
          }
          save();
          lifeCrimeScreen();
        });
        mbtn(d, "🚪", "Try a slapstick escape (risky)", function () {
          if (Math.random() < 0.08 + S.cha * 0.001) {
            S.life.prisonYears = 0;
            S.heat = Math.min(100, S.heat + 10);
            lifeNote("A silly mix-up opened the gate; you are free but still on record.", "justice");
          } else {
            S.life.prisonYears++;
            lifeNote("The escape attempt failed and added a year to the sentence.", "justice");
          }
          save();
          lifeCrimeScreen();
        });
        return;
      }
      if (S.life.criminalRecord.length)
        mbtn(
          d,
          "🗂️",
          "Record: " + S.life.criminalRecord.length + " court outcome(s)",
          function () {},
        );
      LIFE_CRIMES.forEach(function (crime) {
        var button = mbtn(d, "🎭", crime.title, function () {
          lifeAttemptCrime(crime);
        });
        button.disabled = S.age < 16 || S.life.prisonYears > 0;
      });
    },
  );
}
function lifeAttemptCrime(crime) {
  if (S.age < 16 || S.life.prisonYears) return;
  var skill = (S.cha + S.int + S.str) / 3,
    success = Math.random() < Math.max(0.1, Math.min(0.85, 0.7 + (skill - crime.difficulty) * 0.015));
  if (success) {
    S.cash += crime.prize;
    S.heat = Math.min(100, S.heat + Math.round(crime.heat * 10));
    lifeNote(
      crime.title + " succeeded in cartoon fashion; $"+crime.prize+" gained.",
      "justice",
    );
    if (S.heat >= 25 && Math.random() < crime.heat) lifeArrest(crime.title);
  } else {
    S.heat = Math.min(100, S.heat + Math.round(crime.heat * 20));
    lifeNote("The attempt went wrong; a city officer intervened.", "justice");
    lifeArrest(crime.title);
  }
  if (Math.random() < crime.heat * 0.01)
    return lifeDeath("an avoidable accident after a risky choice");
  save();
  lifeCrimeScreen();
}
function lifeArrest(reason) {
  var fine = Math.min(S.cash, 50 + Math.floor(Math.random() * 151));
  S.cash -= fine;
  S.life.criminalRecord.push({
    age: S.age,
    reason: reason,
    fine: fine,
  });
  lifeNote("Court fined you $" + fine + " after " + reason + ".", "justice");
  if (Math.random() < 0.45) {
    S.life.prisonYears = 1;
    lifeNote("A short cartoonish sentence followed the court hearing.", "justice");
  }
  S.heat = Math.max(0, S.heat - 5);
}
function lifeLegacyRead() {
  try {
    var raw = localStorage.getItem(LIFE_KEY),
      data = raw ? JSON.parse(raw) : {};
    if (!data || typeof data !== "object") data = {};
    if (!Array.isArray(data.lives)) data.lives = [];
    if (!Array.isArray(data.familyTree)) data.familyTree = [];
    if (!data.achievements || typeof data.achievements !== "object")
      data.achievements = {};
    if (!data.challenges || typeof data.challenges !== "object")
      data.challenges = {};
    return data;
  } catch (error) {
    console.error("Could not read persistent life legacy:", error);
    return { lives: [], familyTree: [], achievements: {}, challenges: {} };
  }
}
function lifeLegacyWrite(data) {
  try {
    localStorage.setItem(LIFE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Could not save persistent life legacy:", error);
    say("Legacy records could not be saved in this browser.");
    return false;
  }
}
function lifeScore() {
  return Math.max(
    0,
    Math.round(
      S.age * 100 +
        S.hap * 5 +
        S.life.health * 4 +
        S.int * 2 +
        S.life.looks +
        Math.max(0, netWorth()),
    ),
  );
}
function lifeCheckLegacyGoals() {
  var data = lifeLegacyRead(),
    goals = [
      ["first-birthday", "First birthday", S.age >= 1],
      ["school-finish", "Graduation day", !!S.life.flags.degree],
      ["friendship", "A meaningful friendship", S.life.people.some(function (p) { return p.affection >= 50; })],
      ["own-a-home", "Home sweet home", !!(S.owns.apartment || S.owns.townhouse || S.mansion)],
      ["good-health", "Healthy habits", S.life.health >= 90],
    ];
  goals.forEach(function (goal) {
    if (goal[2] && !data.achievements[goal[0]]) {
      data.achievements[goal[0]] = { title: goal[1], earned: Date.now() };
      lifeRecord("Legacy achievement unlocked: " + goal[1] + ".", "achievement");
    }
  });
  lifeLegacyWrite(data);
}
function lifeRunRecord(reason) {
  return {
    name: S.life.name || "Resident",
    age: S.age,
    birthplace: S.life.birthplace || "Stick City",
    cause: reason || "unknown",
    score: lifeScore(),
    netWorth: Math.round(netWorth()),
    children: S.life.children.map(function (p) {
      return { id: p.id, name: p.name, age: p.age, personality: p.personality };
    }),
    parentName: S.life.parentName || "",
    summary: S.life.feed.filter(function (entry) {
      return entry.type === "milestone" || entry.type === "birthday";
    }).slice(-12),
    epitaph:
      S.life.name +
      " lived " +
      S.age +
      " years, made memories in " +
      (S.life.birthplace || "Stick City") +
      ", and left a story of their own.",
    ended: Date.now(),
  };
}
function lifeArchiveRun(reason) {
  var data = lifeLegacyRead(),
    record = lifeRunRecord(reason);
  data.lives.unshift(record);
  data.lives = data.lives.slice(0, 100);
  data.familyTree.push({
    id: "life-" + record.ended,
    name: record.name,
    age: record.age,
    cause: record.cause,
    parentName: record.parentName,
    children: record.children.map(function (p) {
      return p.name;
    }),
  });
  data.challenges.selected = "";
  lifeLegacyWrite(data);
  return record;
}
function lifeDeath(reason) {
  lifeInit();
  if (S.life.ended) return;
  S.life.ended = 1;
  S.life.alive = 0;
  S.life.endRecord = lifeArchiveRun(reason);
  save();
  lifeEndScreen();
}
// The only way out of an ended life is the next one, even after a reload.
function lifeEndScreen() {
  // Saves that ended before endRecord existed rebuild it without re-archiving.
  if (!S.life.endRecord) S.life.endRecord = lifeRunRecord("unknown");
  var record = S.life.endRecord,
    report = currentLifeDayReport;
  paused = true;
  onTitle = true;
  keys = {};
  held = {};
  bp.hidden = true;
  phn.hidden = true;
  mshow(
    "🪦 The end of a life",
    [
      record.epitaph,
      "Score: " +
        record.score.toLocaleString() +
        " · Net worth: $" +
        record.netWorth.toLocaleString() +
        " · Cause: " +
        record.cause +
        ".",
      record.children.length
        ? "Your family can carry on your story."
        : "Your story has been added to the city graveyard.",
      reportNode(report, { life: true, ended: true, chartsOnly: !report }),
    ],
    function (d) {
      if (record.children.length)
        mbtn(d, "🌳", "Continue as " + record.children[0].name, function () {
          lifePrepareNext(record.children[0]);
        });
      mbtn(d, "🪦", "View the graveyard", lifeGraveyardScreen);
      mbtn(d, "🌳", "View family tree", lifeTreeScreen);
      mbtn(d, "✨", "Begin a new life", function () {
        lifePrepareNext(null);
      });
    },
  );
  currentLifeDayReport = null;
}
function lifePrepareNext(child) {
  var inheritance = Math.min(5000, Math.max(0, Math.floor(netWorth() * 0.25)));
  var profile = child
    ? {
        name: child.name,
        gender: "unspecified",
        birthplace: S.life.birthplace || "Stick City",
        challenge: "",
        parentName: S.life.name,
        parentAge: S.age,
        inheritedCash: inheritance,
        inheritedStats: {
          str: Math.round(S.str * 0.2),
          int: Math.round(S.int * 0.2),
          cha: Math.round(S.cha * 0.2),
        },
      }
    : null;
  try {
    if (profile) localStorage.setItem(LIFE_NEXT_KEY, JSON.stringify(profile));
    else localStorage.removeItem(LIFE_NEXT_KEY);
    localStorage.removeItem(KEY);
  } catch (error) {
    console.error("Could not prepare next life:", error);
    say("The next life could not be prepared in this browser.");
    return;
  }
  location.reload();
}
function lifeBoot() {
  lifeInit();
  var raw = null;
  try {
    raw = localStorage.getItem(LIFE_NEXT_KEY);
  } catch (error) {
    console.error("Could not read next-life profile:", error);
    return;
  }
  if (raw === null) return;
  try {
    var profile = JSON.parse(raw);
    if (!profile || !profile.name) return;
    lifeSetNewCharacter({
      name: profile.name,
      gender: profile.gender || "unspecified",
      birthplace: profile.birthplace || "Stick City",
      challenge: profile.challenge || "",
      str:
        20 +
        Math.floor(Math.random() * 41) +
        ((profile.inheritedStats && profile.inheritedStats.str) || 0),
      int:
        20 +
        Math.floor(Math.random() * 41) +
        ((profile.inheritedStats && profile.inheritedStats.int) || 0),
      cha:
        20 +
        Math.floor(Math.random() * 41) +
        ((profile.inheritedStats && profile.inheritedStats.cha) || 0),
      health: 65 + Math.floor(Math.random() * 31),
      looks: 25 + Math.floor(Math.random() * 61),
      inheritedCash: profile.inheritedCash || 0,
      parentName: profile.parentName || "",
      parentAge: profile.parentAge || 60,
    });
    S.life.lifeCount = lifeLegacyRead().lives.length + 1;
    lifeRecord("Began a new generation of the family.", "family");
    save();
    localStorage.removeItem(LIFE_NEXT_KEY);
  } catch (error) {
    console.error("Could not start the next life:", error);
    say("The next life could not be started.");
  }
}
function lifeGraveyardScreen() {
  var data = lifeLegacyRead();
  cityScreen(
    "🪦 Graveyard",
    data.lives.length + " completed lives are remembered here.",
    function (d) {
      if (!data.lives.length) {
        var p = document.createElement("p");
        p.textContent = "No lives have been archived yet.";
        d.appendChild(p);
      }
      data.lives.slice(0, 40).forEach(function (life) {
        var p = document.createElement("p");
        p.className = "life-feed-entry";
        p.textContent =
          life.name +
          " · age " +
          life.age +
          " · " +
          life.cause +
          " · score " +
          Number(life.score || 0).toLocaleString() +
          " · " +
          life.epitaph;
        d.appendChild(p);
      });
      mbtn(d, "🌳", "Family tree", lifeTreeScreen);
      mbtn(d, "🏅", "Legacy achievements", lifeAchievementsScreen);
    },
  );
}
function lifeTreeScreen() {
  var data = lifeLegacyRead();
  cityScreen(
    "🌳 Family Tree",
    "Family history is stored separately from your active save.",
    function (d) {
      if (!data.familyTree.length) {
        var empty = document.createElement("p");
        empty.textContent = "Your family tree will grow as lives are completed.";
        d.appendChild(empty);
      }
      data.familyTree.slice(-80).reverse().forEach(function (entry) {
        var p = document.createElement("p");
        p.className = "life-feed-entry";
        p.textContent =
          entry.name +
          " · age " +
          entry.age +
          " · " +
          entry.cause +
          (entry.parentName ? " · child of " + entry.parentName : "") +
          (entry.children.length
            ? " · children: " + entry.children.join(", ")
            : "");
        d.appendChild(p);
      });
      mbtn(d, "🪦", "Graveyard", lifeGraveyardScreen);
    },
  );
}
function lifeAchievementsScreen() {
  var data = lifeLegacyRead();
  cityScreen(
    "🏅 Legacy Goals",
    "Achievements and selected challenge survive New Game.",
    function (d) {
      var names = Object.keys(data.achievements);
      if (!names.length) {
        var empty = document.createElement("p");
        empty.textContent = "Complete life milestones to earn legacy achievements.";
        d.appendChild(empty);
      }
      names.forEach(function (key) {
        var entry = data.achievements[key];
        var p = document.createElement("p");
        p.textContent = "🏅 " + entry.title;
        d.appendChild(p);
      });
      mbtn(d, "📋", "Challenge: " + (data.challenges.selected || "Standard life"), function () {
        lifeChallengeScreen(data);
      });
    },
  );
}
function lifeChallengeScreen(data) {
  data = data || lifeLegacyRead();
  cityScreen("🎯 Challenge Runs", "Optional rules apply to the next life only.", function (d) {
    [
      ["", "Standard life"],
      ["frugal", "Frugal: begin with $50"],
      ["scholar", "Scholar: extra study growth"],
      ["social", "Social: begin with a friendly neighbor"],
    ].forEach(function (entry) {
      var b = mbtn(d, "🎯", entry[1], function () {
        data.challenges.selected = entry[0];
        lifeLegacyWrite(data);
        say(
          entry[0]
            ? "Challenge selected for the next new life."
            : "Standard life selected.",
        );
      });
      b.disabled = data.challenges.selected === entry[0];
    });
  });
}
function lifeHubScreen() {
  lifeInit();
  if (!S.life.created) {
    cityScreen(
      "🌱 Life Hub",
      "Begin a life story or continue an older save at its current age.",
      function (d) {
        mbtn(d, "✨", "Create a life", lifeCharacterCreate);
        mbtn(d, "📰", "Legacy & graveyard", lifeAchievementsScreen);
      },
    );
    return;
  }
  cityScreen(
    "🌱 Life Hub",
    (S.life.name || "Resident") +
      " · " +
      lifeLabel(lifeStage(S.age)) +
      " · age " +
      S.age +
      " · ages up one year each day.",
    function (d) {
      lifeProgressNode(d, "Happiness", lifeBarValue(S.hap), 100, "#f59e0b");
      lifeProgressNode(d, "Health", lifeBarValue(S.life.health), 100, "#e34f4f");
      lifeProgressNode(d, "Smarts", lifeBarValue(S.int), 100, "#477de8");
      lifeProgressNode(d, "Looks", lifeBarValue(S.life.looks), 100, "#d34f9a");
      mbtn(
        d,
        "🎂",
        "Advance 1 day · age +1",
        lifeAgeUp,
      );
      mbtn(d, "📊", "Full life stats", lifeStatsScreen);
      mbtn(d, "📰", "Lifetime feed", lifeFeedScreen);
      mbtn(d, "👥", "Relationships & family", lifePeopleScreen);
      mbtn(d, "🎓", "School & study", lifeSchoolScreen);
      mbtn(d, "💼", "Careers", lifeCareerScreen);
      mbtn(d, "🎨", "Activities & wellbeing", lifeActivitiesScreen);
      mbtn(d, "🏠", "Assets & finances", lifeAssetsScreen);
      mbtn(d, "⚖️", "Justice & crime", lifeCrimeScreen);
      mbtn(d, "🌳", "Legacy, family tree & goals", lifeAchievementsScreen);
    },
  );
}
