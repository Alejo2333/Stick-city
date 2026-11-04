function phoneOld(v) {
  paused = true;
  onTitle = false;
  keys = {};
  held = {};
  bp.hidden = true;
  var m = phMsg,
    lines = [],
    title = "📱 Phone";
  phMsg = "";
  function go(msg, view) {
    phMsg = msg || "";
    save();
    phone(view || v);
  }
  if (v === "soc") {
    title = "📸 StickGram";
    lines = ["Followers: " + S.fol + "   Happiness " + S.hap + "/100"];
  } else if (v === "stk" || v === "cry") {
    title = v === "cry" ? "🪙 Crypto" : "📈 Stocks";
    lines = ["Cash $" + S.cash + "   Prices change every morning."];
  } else {
    lines = [
      hhmm() + "   Cash $" + S.cash + "   Bank $" + S.bank,
      "Investments $" + invested() + "   Followers " + S.fol,
    ];
  }
  if (m) lines.unshift(m);
  mshow(title, lines, function (d) {
    if (v === "soc") {
      mbtn(d, "🤳", "Post a selfie (30 min)", function () {
        var n = 1 + Math.floor(Math.random() * (2 + S.cha));
        S.fol += n;
        hp(1);
        adv(0.5);
        go("Your selfie got " + n + " new followers.");
      });
      mbtn(d, "🔥", "Viral stunt (−5 HP, 1 hr)", function () {
        if (S.en < 6) return go("Too worn out for stunts.");
        S.en -= 5;
        adv(1);
        if (Math.random() < 0.25) {
          var n = 50 + Math.floor(Math.random() * 200) + S.cha * 5;
          S.fol += n;
          hp(6);
          addLog("Went viral.");
          go("It went viral! +" + n + " followers.");
        } else {
          hp(-4);
          go("Nobody watched. Embarrassing.");
        }
      });
      var ok = S.fol >= 100 && !doneToday("spon");
      mbtn(
        d,
        "💰",
        S.fol < 100
          ? "Sponsors need 100 followers"
          : ok
            ? "Sponsored post (+$" + Math.floor(S.fol * 0.1) + ")"
            : "Sponsor already paid today",
        function () {
          var c = Math.floor(S.fol * 0.1);
          markDone("spon");
          S.cash += c;
          go("A brand paid you $" + c + ".");
        },
      ).disabled = !ok;
    } else if (v === "stk" || v === "cry") {
      AS.forEach(function (a) {
        if ((a[3] ? "cry" : "stk") !== v) return;
        var k = a[0],
          px = S.px[k],
          n = S.hold[k] || 0,
          ch = S.pp[k] ? Math.round((px / S.pp[k] - 1) * 100) : 0,
          lab =
            a[2] +
            " $" +
            px +
            " " +
            (ch >= 0 ? "▲" : "▼") +
            Math.abs(ch) +
            "% (own " +
            n +
            ")";
        [1, 5].forEach(function (q) {
          mbtn(d, a[1], "Buy " + q + " – " + lab, function () {
            if (S.cash < px * q) return go("Not enough cash.");
            S.cash -= px * q;
            S.hold[k] = n + q;
            go("Bought " + q + " " + a[2] + ".");
          });
        });
        mbtn(d, "💵", "Sell all " + a[2] + " (+$" + n * px + ")", function () {
          S.cash += n * px;
          S.hold[k] = 0;
          go("Sold for $" + n * px + ".");
        }).disabled = !n;
      });
      mbtn(d, "⬅️", "Back", function () {
        phone("home");
      });
    }
    if (v !== "soc" && v !== "stk" && v !== "cry") {
      mbtn(d, "📸", "StickGram", function () {
        phone("soc");
      });
      mbtn(d, "📈", "Stocks", function () {
        phone("stk");
      });
      mbtn(d, "🪙", "Crypto", function () {
        phone("cry");
      });
      mbtn(d, "✖️", "Close phone", closeMenu);
    } else if (v === "soc")
      mbtn(d, "⬅️", "Back", function () {
        phone("home");
      });
  });
}
var phn = document.getElementById("phn"),
  pv = "home",
  phRenderedView = null,
  pc = "",
  pmsg = "",
  typing = {},
  calc = { a: null, op: "", cur: "0", fresh: 0 },
  PA = {},
  APPS = [
    ["hub", "🌆", "Life Hub", "#2563eb"],
    ["msg", "💬", "Messages", "#34c759"],
    ["mail", "📧", "Email", "#4a90e2"],
    ["soc", "📸", "StickGram", "#e1306c"],
    ["stk", "📈", "Stocks", "#2f6fe4"],
    ["cry", "🪙", "Crypto", "#f5a623"],
    ["bank", "🏦", "Bank", "#34495e"],
    ["eat", "🍕", "Eats", "#ff6b35"],
    ["calc", "🧮", "Calc", "#7f8c8d"],
    ["cal", "📅", "Calendar", "#e74c3c"],
    ["set", "⚙️", "Settings", "#8e8e93"],
    ["github", "GH", "GitHub", "#24292f"],
  ],
  EATS = [
    ["🍔", "Burger", 4, 7],
    ["🍕", "Pizza", 12, 12],
    ["☕", "Coffee", 3, 2],
    ["🍣", "Sushi", 20, 16],
  ],
  MOMQ = ["How are you?", "Can I borrow $20?", "Love you!"],
  PARQ = ["Miss you ❤️", "Dinner tonight?", "😉"];
function esc(t) {
  return String(t).replace(/[&<>]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
  });
}
function pb(a, v, t, cls, dis) {
  return (
    '<button class="pb ' +
    (cls || "") +
    '" data-a="' +
    a +
    '" data-v="' +
    (v === undefined ? "" : v) +
    '"' +
    (dis ? " disabled" : "") +
    ">" +
    t +
    "</button>"
  );
}
function once(k) {
  if (doneToday("ph" + k)) return 0;
  markDone("ph" + k);
  return 1;
}
function contacts() {
  var names = ["Mom"];
  if (S.life && S.life.created) {
    S.life.people.forEach(function (person) {
      if (
        person.alive &&
        (person.role === "parent" ||
          person.role === "child" ||
          person.role === "sibling") &&
        names.indexOf(person.name) < 0
      )
        names.push(person.name);
    });
  }
  var partner =
    S.life &&
    S.life.people.filter(function (p) {
      return p.name === S.partner;
    })[0];
  if (
    S.partner &&
    S.age >= 18 &&
    (!partner || partner.age >= 18) &&
    names.indexOf(S.partner) < 0
  )
    names.push(S.partner);
  return names;
}
function canMessageRomantically(contact) {
  if (!S.partner || contact !== S.partner || S.age < 18) return false;
  var partner =
    S.life &&
    S.life.people.filter(function (p) {
      return p.name === contact;
    })[0];
  return !partner || partner.age >= 18;
}
function messageChoices(contact) {
  if (contact === "Mom") return MOMQ;
  var person =
    S.life &&
    S.life.people.filter(function (p) {
      return p.name === contact;
    })[0];
  if (
    person &&
    (person.role === "parent" ||
      person.role === "child" ||
      person.role === "sibling")
  )
    return ["How are you?", "Can we spend time together?", "Thinking of you"];
  return canMessageRomantically(contact)
    ? PARQ
    : ["How are you?", "Want to meet up?", "Thanks for being a friend"];
}
function unreadMailCount() {
  return S.mail.filter(function (m) {
    return !m.read;
  }).length;
}
function sendEmail(id, from, subject, body) {
  if (!Array.isArray(S.mail)) S.mail = [];
  if (
    S.mail.some(function (m) {
      return m.id === id;
    })
  )
    return;
  S.mail.unshift({
    id: id,
    from: from,
    subject: subject,
    body: body,
    day: S.day,
    read: false,
  });
}
function ensureMailbox() {
  if (!Array.isArray(S.mail)) S.mail = [];
  sendEmail(
    "welcome-city",
    "Stick City Hall",
    "Welcome to Stick City",
    "Welcome, resident! Your new life is yours to shape. Explore town, meet your neighbors, and visit local businesses to find work and build your skills.\n\nNeed a hand? Your phone's Messages app can keep you in touch with Mom and your partner.",
  );
  sendEmail(
    "welcome-jobs",
    "Stick City Jobs",
    "A fresh start",
    "Looking for work? Stop by the businesses around town and talk to the people inside. Many jobs pay more as your skills grow.\n\nGood luck out there!",
  );
}
function cmp(a, b, o) {
  var r =
    o === "+" ? a + b : o === "−" ? a - b : o === "×" ? a * b : b ? a / b : 0;
  return Math.round(r * 1e8) / 1e8;
}
function phRender() {
  var el = document.getElementById("phs"),
    h = "",
    t = hhmm(),
    n = pmsg ? '<div class="card note">' + esc(pmsg) + "</div>" : "";
  el.className = "phs" + (pv === "home" ? " home" : "");
  function hd(ti, back) {
    return (
      '<div class="pht">' +
      pb("nav", back || "home", "‹", "t") +
      "<b>" +
      ti +
      "</b></div>" +
      n
    );
  }
  if (pv === "home") {
    h =
      '<div class="phw"><div class="phtm">' +
      t +
      "</div><div>Day " +
      S.day +
      " · Age " +
      S.age +
      '</div></div><div class="phg">' +
      APPS.map(function (a) {
        var unread = a[0] === "mail" ? unreadMailCount() : 0;
        return (
          '<button data-a="nav" data-v="' +
          a[0] +
          '" aria-label="' +
          a[2] +
          (unread ? ", " + unread + " unread" : "") +
          '"><span style="background:' +
          a[3] +
          '">' +
          a[1] +
          "</span>" +
          a[2] +
          (unread ? '<b class="mail-badge">' + unread + "</b>" : "") +
          "</button>"
        );
      }).join("") +
      "</div>";
  } else if (pv === "github") {
    h =
      hd("GitHub") +
      '<div class="card" style="text-align:center;padding:20px 12px">' +
      '<div style="font-weight:700;font-size:22px;margin-bottom:8px">Alejo2333</div>' +
      '<div style="margin-bottom:16px">View the creator of Stick City on GitHub.</div>' +
      '<a class="pb" href="https://github.com/Alejo2333" target="_blank" rel="noopener noreferrer" style="text-align:center;text-decoration:none;display:block">Open GitHub Profile</a>' +
      "</div>";
  } else if (pv === "hub") {
    h =
      hd("🌆 Life Hub") +
      '<div class="card"><b>Your Life, Your Story</b><div style="margin-top:5px">' +
      "Day " +
      S.day +
      " · " +
      esc(S.weather) +
      " · " +
      seasonName() +
      " · " +
      esc(S.career) +
      '<div style="margin-top:5px">Cash: ' +
      fmtCash(S.cash) +
      " · Happiness: " +
      S.hap +
      "/100</div>" +
      (S.life && S.life.created
        ? '<div style="margin-top:5px">' +
          esc(S.life.name || "Resident") +
          " · age " +
          S.age +
          " · " +
          esc(lifeLabel(lifeStage(S.age))) +
          "</div>"
        : '<div style="margin-top:5px">Start a life story at birth, or continue an older save.</div>') +
      "</div></div>" +
      [
        ["life", "🌱 Life story & Age Up"],
        ["story", "📖 Story chapters"],
        ["missions", "🎯 Missions & rewards"],
        ["daily", "📅 Daily challenges"],
        ["career", "🧭 Choose life path"],
        ["homes", "🏠 Real estate & furniture"],
        ["businesses", "🏢 Own a business"],
        ["garage", "🚗 Garage & vehicles"],
        ["outfits", "👕 Customize outfit"],
        ["travel", "🗺️ Travel guide & weather"],
        ["games", "🎲 City minigames"],
        ["achievements", "🏆 Achievements"],
        ["shops", "🛍️ Visit shops"],
        ["neighbors", "👥 Neighbors"],
        ["festival", "🎪 Seasonal festival"],
      ]
        .map(function (a) {
          return pb("hubgo", a[0], a[1]);
        })
        .join("");
  } else if (pv === "msg") {
    h =
      hd("Messages") +
      contacts()
        .map(function (c) {
          var m = (S.th[c] || []).slice(-1)[0];
          return pb(
            "th",
            c,
            "<b>" + esc(c) + "</b><br>" + esc(m ? m.t : "No messages yet"),
            "w",
          );
        })
        .join("");
  } else if (pv === "mail") {
    var unread = unreadMailCount();
    h =
      hd("Email") +
      '<div class="card"><b>Inbox</b><br>' +
      (unread ? unread + " unread" : "You're all caught up") +
      "</div>" +
      (S.mail.length
        ? S.mail
            .map(function (m) {
              return pb(
                "mail",
                m.id,
                "<b>" +
                  esc(m.from) +
                  (m.read ? "" : " · NEW") +
                  "</b><br>" +
                  esc(m.subject) +
                  "<br><small>Day " +
                  m.day +
                  "</small>",
                "w" + (m.read ? "" : " mail-unread"),
              );
            })
            .join("")
        : '<div class="card">Your inbox is empty.</div>');
  } else if (pv === "email") {
    var email = S.mail.filter(function (m) {
      return m.id === pc;
    })[0];
    h =
      hd(email ? esc(email.subject) : "Email", "mail") +
      (email
        ? '<div class="card"><b>From:</b> ' +
          esc(email.from) +
          "<br><b>Day:</b> " +
          email.day +
          "<hr><b>" +
          esc(email.subject) +
          '</b><p class="email-body">' +
          esc(email.body) +
          "</p></div>"
        : '<div class="card">This email is no longer available.</div>');
  } else if (pv === "th") {
    h =
      hd(esc(pc), "msg") +
      (S.th[pc] || [])
        .slice(-6)
        .map(function (b) {
          return (
            '<div class="bub' + (b.me ? " me" : "") + '">' + esc(b.t) + "</div>"
          );
        })
        .join("") +
      (typing[pc]
        ? '<div class="bub typing" role="status" aria-label="' +
          esc(pc) +
          ' is typing"><i></i><i></i><i></i></div>'
        : "") +
      messageChoices(pc)
        .map(function (q, i) {
          return pb("send", i, esc(q), "", !!typing[pc]);
        })
        .join("");
  } else if (pv === "soc") {
    h =
      hd("StickGram") +
      '<div class="card"><b>@you</b><br>' +
      S.fol +
      " followers · Happiness " +
      S.hap +
      "/100</div>" +
      pb("selfie", "", "🤳 Post a selfie (30 min)") +
      pb("stunt", "", "🔥 Viral stunt (−5 HP, 1 hr)", "", S.en < 6) +
      pb(
        "spon",
        "",
        S.fol < 100
          ? "💰 Sponsors need 100 followers"
          : "💰 Sponsored post (+$" + Math.floor(S.fol * 0.1) + ")",
        "g",
        S.fol < 100 || doneToday("spon"),
      );
  } else if (pv === "stk" || pv === "cry") {
    h =
      hd(pv === "cry" ? "Crypto" : "Stocks") +
      '<div class="card">Cash $' +
      S.cash +
      " · Invested $" +
      invested() +
      "</div>" +
      (S.news.length
        ? '<div class="card note"><b>📰 News</b><br>' +
          S.news.map(esc).join("<br>") +
          "</div>"
        : "");
    AS.forEach(function (a) {
      if ((a[3] ? "cry" : "stk") !== pv) return;
      var k = a[0],
        px = S.px[k],
        o = S.hold[k] || 0,
        ch = S.pp[k] ? Math.round((px / S.pp[k] - 1) * 100) : 0;
      h +=
        '<div class="card"><b>' +
        a[1] +
        " " +
        a[2] +
        "</b><br>$" +
        px +
        ' <span class="' +
        (ch >= 0 ? "up" : "dn") +
        '">' +
        (ch >= 0 ? "▲" : "▼") +
        Math.abs(ch) +
        "%</span> · own " +
        o +
        '<div class="rw">' +
        pb("buy", k + ":1", "Buy 1", "g", S.cash < px) +
        pb("buy", k + ":5", "Buy 5", "g", S.cash < px * 5) +
        pb("buy", k + ":max", "Max", "g", S.cash < px) +
        pb("sell", k, "Sell all", "r", !o) +
        "</div></div>";
    });
  } else if (pv === "bank") {
    h =
      hd("Stick Savings") +
      '<div class="card">Cash $' +
      S.cash +
      "<br>Bank $" +
      S.bank +
      "<br><b>Net worth $" +
      netWorth() +
      "</b></div>" +
      pb("dep", 50, "Deposit $50", "g", S.cash < 50) +
      pb("dep", 500, "Deposit $500", "g", S.cash < 500) +
      pb("wd", "", "Withdraw everything", "", !S.bank);
  } else if (pv === "eat") {
    h =
      hd("Stick Eats") +
      EATS.map(function (e, i) {
        return pb(
          "eat",
          i,
          e[0] + " " + e[1] + " $" + e[2] + " (+" + e[3] + " HP)",
          "",
          S.cash < e[2] || S.en >= MAXE,
        );
      }).join("");
  } else if (pv === "calc") {
    h =
      hd("Calculator") +
      '<div class="cd">' +
      esc(calc.cur) +
      '</div><div class="ck">' +
      [
        "7",
        "8",
        "9",
        "÷",
        "4",
        "5",
        "6",
        "×",
        "1",
        "2",
        "3",
        "−",
        "0",
        ".",
        "=",
        "+",
      ]
        .map(function (k) {
          return pb("key", k, k, /[\d.]/.test(k) ? "" : "o");
        })
        .join("") +
      "</div>" +
      pb("key", "C", "Clear", "r");
  } else if (pv === "cal") {
    h =
      hd("Calendar") +
      '<div class="card">Day ' +
      S.day +
      ", " +
      t +
      "<br>Age " +
      S.age +
      " · birthday in " +
      (30 - (S.day % 30)) +
      " days<br>Wanted: " +
      (S.heat >= 0.3 ? "★".repeat(Math.min(5, Math.ceil(S.heat))) : "no") +
      "<br>Karma " +
      S.k +
      (S.partner ? "<br>Partner: " + esc(S.partner) : "") +
      "</div>";
  } else {
    h =
      hd("Settings") +
      pb("snd", "", muted ? "🔇 Sound: off" : "🔊 Sound: on") +
      pb("sv", "", "💾 Save game");
  }
  var scroll = phScrollSnapshot();
  el.innerHTML =
    '<div class="phb"><span>' +
    t +
    "</span><span>📶 🔋" +
    Math.round((S.en / MAXE) * 100) +
    '%</span></div><div class="phc">' +
    h +
    '</div><div class="phh" data-a="home"><i></i></div>';
  phRestoreScroll(scroll);
}
function phScrollSnapshot() {
  var el = document.getElementById("phs"),
    content = el && el.querySelector(".phc");
  return {
    view: phRenderedView,
    top: content ? content.scrollTop : 0,
  };
}
function phRestoreScroll(snapshot) {
  var el = document.getElementById("phs"),
    content = el && el.querySelector(".phc");
  if (content) {
    content.scrollTop = snapshot.view === pv ? snapshot.top : 0;
    // Opening the phone has its own slide; only app changes get this one.
    if (snapshot.view && snapshot.view !== pv)
      content.classList.add("ph-page");
  }
  phRenderedView = pv;
}
function phone() {
  if (!phn.hidden) return;
  paused = true;
  keys = {};
  held = {};
  bp.hidden = true;
  ensureMailbox();
  pv = "home";
  phRenderedView = null;
  pmsg = "";
  phn.innerHTML = '<div class="ph"><div class="phs" id="phs"></div></div>';
  phn.hidden = false;
  phRender();
}
function phClose() {
  closeFx(phn, "ph-ghost");
  phn.hidden = true;
  cityHubFromPhone = false;
  paused = false;
  save();
}
var cityHubFromPhone = false,
  cityBackTo = null,
  CITY_ITEMS = [
    "Browse shop",
    "Property listings",
    "Select your home",
    "Buy, park or switch vehicles",
    "Move furniture and change wallpaper",
    "Invite a friend over",
    "Run for Mayor",
    "Community festival",
    "Casino floor",
  ];
PA.hubgo = function (v) {
  cityBackTo = null;
  var pages = {
    life: lifeHubScreen,
    story: cityStory,
    shops: cityShops,
    neighbors: cityNeighborhood,
    festival: citySeasonalEvent,
    missions: cityMissions,
    daily: cityDaily,
    career: cityCareer,
    homes: cityHomes,
    businesses: cityBusinesses,
    garage: cityGarage,
    outfits: cityOutfits,
    travel: cityTravel,
    games: cityGames,
    achievements: cityAchievements,
  };
  if (!pages[v]) return;
  cityHubFromPhone = true;
  phn.hidden = true;
  pages[v]();
};
PA.nav = function (v) {
  pv = v;
  pmsg = "";
};
PA.home = function () {
  if (pv === "home") phClose();
  else {
    pv = "home";
    pmsg = "";
  }
};
PA.th = function (v) {
  pv = "th";
  pc = v;
  pmsg = "";
};
PA.mail = function (id) {
  var email = S.mail.filter(function (m) {
    return m.id === id;
  })[0];
  if (!email) return;
  email.read = true;
  pc = id;
  pv = "email";
  pmsg = "";
  save();
};
PA.send = function (i) {
  i = +i;
  var c = pc,
    g = (S.th[c] = S.th[c] || []),
    r = "",
    person =
      S.life &&
      S.life.people.filter(function (p) {
        return p.name === c;
      })[0],
    familyContact =
      person &&
      (person.role === "parent" ||
        person.role === "child" ||
        person.role === "sibling"),
    romanticContact = canMessageRomantically(c);
  if (typing[c]) return;
  g.push({ me: 1, t: messageChoices(c)[i] });
  if (c === "Mom") {
    if (i === 0) {
      r = "Eating well? Call me more!";
      if (once("m0")) hp(2);
    } else if (i === 1) {
      if (once("m1")) {
        S.cash += 20;
        r = "Fine. Sent you $20.";
      } else r = "I already helped you today!";
    } else {
      r = "Love you more! ❤️";
      if (once("m2")) hp(3);
    }
  } else if (familyContact) {
    r =
      i === 0
        ? "I am doing well. Thanks for checking in!"
        : i === 1
          ? "That sounds lovely. Let's make time for it."
          : "Thinking of you too!";
    if (once("life-family-" + c + "-" + i)) {
      if (person) person.affection = Math.min(100, (person.affection || 0) + 1);
      if (person && person.npc) S.lv[c] = person.affection;
      hp(1);
    }
  } else if (i === 0 && romanticContact) {
    r = "Aww, miss you too!";
    if (once("p0")) {
      S.lv[c] = lvl(c) + 1;
      hp(2);
    }
  } else if (i === 1 && romanticContact) {
    r = "Yes! See you at the cafe.";
    if (once("p1")) {
      S.lv[c] = lvl(c) + 2;
      hp(2);
    }
  } else if (
    i === 2 &&
    romanticContact &&
    Math.random() < 0.5 + S.cha * 0.02
  ) {
    r = "Stop it, you! 😊";
    S.lv[c] = lvl(c) + 1;
  } else r = i === 1 ? "Sure, let's catch up soon." : "Thanks for reaching out!";
  typing[c] = true;
  if (g.length > 12) g.splice(0, g.length - 12);
  adv(0.1);
  setTimeout(function () {
    g.push({ t: r });
    if (g.length > 12) g.splice(0, g.length - 12);
    typing[c] = false;
    save();
    if (!phn.hidden) phRender();
  }, 900);
};
PA.selfie = function () {
  var n = 1 + Math.floor(Math.random() * (2 + S.cha));
  S.fol += n;
  hp(1);
  adv(0.5);
  pmsg = "Your selfie got " + n + " new followers.";
};
PA.stunt = function () {
  S.en -= 5;
  adv(1);
  if (Math.random() < 0.25) {
    var n = 50 + Math.floor(Math.random() * 200) + S.cha * 5;
    S.fol += n;
    hp(6);
    addLog("Went viral.");
    pmsg = "It went viral! +" + n + " followers.";
  } else {
    hp(-4);
    pmsg = "Nobody watched. Embarrassing.";
  }
};
PA.spon = function () {
  var c = Math.floor(S.fol * 0.1);
  markDone("spon");
  S.cash += c;
  pmsg = "A brand paid you $" + c + ".";
};
PA.buy = function (v) {
  var p = v.split(":"),
    k = p[0],
    px = S.px[k],
    q = p[1] === "max" ? Math.floor(S.cash / px) : +p[1];
  if (q < 1 || S.cash < px * q) {
    pmsg = "Not enough cash.";
    return;
  }
  S.cash -= px * q;
  S.hold[k] = (S.hold[k] || 0) + q;
  pmsg = "Bought " + q + ".";
};
PA.sell = function (k) {
  var n = S.hold[k] || 0;
  S.cash += n * S.px[k];
  S.hold[k] = 0;
  pmsg = "Sold for $" + n * S.px[k] + ".";
};
PA.dep = function (v) {
  S.cash -= +v;
  S.bank += +v;
  pmsg = "Deposited $" + v + ".";
};
PA.wd = function () {
  pmsg = "Withdrew $" + S.bank + ".";
  S.cash += S.bank;
  S.bank = 0;
};
PA.eat = function (i) {
  var e = EATS[+i];
  S.cash -= e[2];
  S.en = Math.min(MAXE, S.en + e[3]);
  adv(0.5);
  pmsg = "Delivered! +" + e[3] + " HP.";
};
PA.key = function (k) {
  var c = calc;
  if (/[\d]/.test(k)) {
    c.cur = c.fresh || c.cur === "0" ? k : c.cur + k;
    c.fresh = 0;
  } else if (k === ".") {
    if (c.fresh) {
      c.cur = "0";
      c.fresh = 0;
    }
    if (c.cur.indexOf(".") < 0) c.cur += ".";
  } else if (k === "C") calc = { a: null, op: "", cur: "0", fresh: 0 };
  else {
    if (c.op && !c.fresh) c.cur = String(cmp(c.a, parseFloat(c.cur), c.op));
    c.a = parseFloat(c.cur);
    c.op = k === "=" ? "" : k;
    c.fresh = 1;
  }
};
PA.snd = function () {
  muted = !muted;
  try {
    localStorage.setItem("stickCityMute", muted ? "1" : "0");
  } catch (e) {}
};
PA.sv = function () {
  save();
  pmsg = "Game saved.";
};
phn.addEventListener("click", function (e) {
  if (e.target === phn) return phClose();
  var b = e.target.closest("[data-a]");
  if (!b || b.disabled || !PA[b.dataset.a]) return;
  pmsg = "";
  var result = PA[b.dataset.a](b.dataset.v);
  sfx("click");
  if (!phn.hidden && result !== false) phRender();
});
