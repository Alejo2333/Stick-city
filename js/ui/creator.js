// Creator phone apps. Keep platform progress in S.cr for compatibility with existing saves.
var PLAT = {
  yt: {
    n: "StickTube",
    i: "▶️",
    color: "#e53935",
    unit: "subscribers",
    mon: 1000,
    ver: 20000,
  },
  tw: {
    n: "StickStream",
    i: "🎮",
    color: "#7356d8",
    unit: "followers",
    mon: 100,
    ver: 10000,
  },
  tt: {
    n: "StickTok",
    i: "🎵",
    color: "#111827",
    unit: "followers",
    mon: 1000,
    ver: 20000,
  },
};
var CR_CAP = 20000000,
  INF_AT = 350000,
  CR_NICHES = [
    ["comedy", "Comedy"],
    ["education", "Education"],
    ["gaming", "Gaming"],
    ["lifestyle", "Lifestyle"],
    ["music", "Music"],
  ],
  CR_DRAFT = null,
  CR_WELCOME = "",
  CR_TROLL_OPEN = false;

// [label, hours, energy cost, base followers, viral chance, strike chance, niche]
var CRP = {
  yt: [
    ["🎥 Vlog", 1, 2, 8, 0.05, 0, "lifestyle"],
    ["🎮 Gaming video", 2, 3, 14, 0.07, 0.02, "gaming"],
    ["📚 Tutorial", 2, 3, 10, 0.04, 0, "education"],
    ["😈 Prank video", 1, 4, 20, 0.12, 0.15, "comedy"],
    ["🔥 Extreme challenge", 3, 5, 30, 0.15, 0.1, "comedy"],
  ],
  tw: [
    ["💬 Chat & chill stream", 1, 2, 6, 0.04, 0, "lifestyle"],
    ["🎮 Gaming stream", 2, 3, 12, 0.07, 0.02, "gaming"],
    ["🏆 Tournament stream", 3, 4, 18, 0.1, 0.03, "gaming"],
    ["🌙 Marathon stream", 6, 8, 35, 0.12, 0.05, "gaming"],
  ],
  tt: [
    ["💃 Dance clip", 0.5, 2, 10, 0.12, 0, "music"],
    ["🎤 Lip-sync clip", 0.25, 1, 6, 0.08, 0, "music"],
    ["🔥 Trend challenge", 0.5, 3, 14, 0.15, 0.05, "comedy"],
    ["🗣️ Hot take", 0.25, 1, 12, 0.1, 0.12, "education"],
  ],
};
var CR_VIEWS = ["yt", "tw", "tt"];

function crRand(a, b) {
  return a + Math.random() * (b - a);
}
function crN(n) {
  return Math.floor(Number(n) || 0).toLocaleString();
}
function crInit() {
  if (!S.cr || typeof S.cr !== "object") S.cr = {};
  Object.keys(PLAT).forEach(function (k) {
    var d = S.cr[k];
    if (!d || typeof d !== "object") {
      d = S.cr[k] = {
        on: 0,
        f: 0,
        posts: 0,
        mon: 0,
        ver: 0,
        st: 0,
        sus: 0,
        pend: 0,
      };
    }
    ["on", "f", "posts", "mon", "ver", "st", "sus", "pend"].forEach(
      function (field) {
        if (!Number.isFinite(Number(d[field]))) d[field] = 0;
        else d[field] = Number(d[field]);
      },
    );
    if (typeof d.user !== "string") d.user = "";
    if (
      !CR_NICHES.some(function (n) {
        return n[0] === d.niche;
      })
    )
      d.niche = "";
  });
}
function crTotal() {
  crInit();
  return Object.keys(PLAT).reduce(function (total, k) {
    return total + S.cr[k].f;
  }, Number(S.fol) || 0);
}
function crRank(f) {
  return f < 100
    ? "Newbie"
    : f < 1000
      ? "Rising"
      : f < 10000
        ? "Popular"
        : f < 100000
          ? "Star"
          : f < 1000000
            ? "Mega Star"
            : "Legend";
}
function crQ(d) {
  return (1 + (S.cha + S.int) * 0.04 + S.hap / 250) * (d.ver ? 1.25 : 1);
}
function crPayout() {
  crInit();
  var total = 0;
  Object.keys(PLAT).forEach(function (k) {
    var d = S.cr[k];
    if (d.mon) total += d.f * 0.001 * (d.ver ? 1.3 : 1);
  });
  if (S.cr.inf) total += crTotal() * 0.002;
  return Math.floor(total);
}
function crNicheName(k) {
  var niche = CR_NICHES.filter(function (n) {
    return n[0] === k;
  })[0];
  return niche ? niche[1] : "";
}
function crProgress(label, value, target) {
  value = Math.max(0, Number(value) || 0);
  target = Math.max(1, Number(target) || 1);
  var capped = Math.min(value, target),
    percent = Math.floor((capped / target) * 100);
  return (
    '<div class="creator-progress"><div class="creator-progress-label"><span>' +
    esc(label) +
    "</span><span>" +
    crN(value) +
    " / " +
    crN(target) +
    "</span></div><progress max=\"" +
    target +
    '" value="' +
    capped +
    '" aria-label="' +
    esc(label + ": " + percent + "%") +
    '"></progress></div>'
  );
}
function crProfileReady(d) {
  return !!d.user && !!crNicheName(d.niche);
}
function crHubCard() {
  crInit();
  var total = crTotal(),
    pay = crPayout(),
    paid = doneToday("phcrpay");
  return (
    '<div class="card creator-home-card"><b>🎬 Creator journey</b><div class="creator-home-stats">Total fame: ' +
    crN(total) +
    (S.cr.inf ? " · ⭐ Influencer" : "") +
    "</div>" +
    (S.cr.inf
      ? '<div class="creator-progress-label"><span>Influencer status</span><span>Unlocked</span></div><progress max="1" value="1" aria-label="Influencer status unlocked"></progress>'
      : crProgress("Influencer progress", total, INF_AT)) +
    '<div class="creator-payout">Daily payout: <b>+$' +
    crN(pay) +
    "</b>" +
    (paid ? " · Collected today" : "") +
    "</div>" +
    pb(
      "crpay",
      "",
      paid
        ? "✅ Creator payout collected today"
        : pay
          ? "💵 Collect creator payout (+$" + crN(pay) + ")"
          : "Creator payout available after monetization",
      "g",
      paid || !pay,
    ) +
    pb("nav", "home", "📱 Creator apps on home screen", "t") +
    "</div>"
  );
}

APPS.splice(
  4,
  0,
  ["yt", PLAT.yt.i, PLAT.yt.n, PLAT.yt.color],
  ["tw", PLAT.tw.i, PLAT.tw.n, PLAT.tw.color],
  ["tt", PLAT.tt.i, PLAT.tt.n, PLAT.tt.color],
);

var _phRenderBase = phRender;
phRender = function () {
  if (CR_VIEWS.indexOf(pv) < 0 && pv !== "hub") return _phRenderBase();
  var scroll = phScrollSnapshot();
  if (pv === "hub") {
    _phRenderBase();
    var hub = document.querySelector("#phs .phc");
    if (hub) hub.insertAdjacentHTML("afterbegin", crHubCard());
    phRestoreScroll(scroll);
    return;
  }

  crInit();
  var el = document.getElementById("phs"),
    h = "",
    t = hhmm(),
    d = S.cr[pv],
    P = PLAT[pv],
    note = pmsg
      ? '<div class="card note creator-result" role="status" aria-live="polite">' +
        esc(pmsg) +
        "</div>"
      : "";
  el.className = "phs";
  function hd(title, back) {
    return (
      '<div class="pht">' +
      pb("nav", back || "home", "‹", "t") +
      "<b>" +
      esc(title) +
      "</b></div>" +
      note
    );
  }

  if (CR_WELCOME === pv) {
    h =
      hd(P.i + " Welcome to " + P.n) +
      '<div class="card creator-welcome"><b>Welcome, @' +
      esc(d.user) +
      "!</b><p>Post original " +
      esc(crNicheName(d.niche).toLowerCase()) +
      " content to grow your audience. Matching your " +
      esc(crNicheName(d.niche).toLowerCase()) +
      " niche earns 50% more followers on matching posts.</p><p>At " +
      crN(P.mon) +
      " " +
      esc(P.unit) +
      ", you can unlock monetization. Build to " +
      crN(P.ver) +
      " for a chance to get verified. Monetized accounts earn daily payouts you can collect.</p></div>" +
      pb("crstart", pv, "Start creating", "g");
  } else if (CR_DRAFT && CR_DRAFT.k === pv) {
    h = hd("Set up " + P.n);
    if (CR_DRAFT.stage === "confirm") {
      h +=
        '<div class="card"><b>Confirm your creator profile</b><p>Username: @' +
        esc(CR_DRAFT.user) +
        "</p><p>Content niche: " +
        esc(crNicheName(CR_DRAFT.niche)) +
        "</p><p>Matching posts in this niche earn 50% more followers.</p></div>" +
        pb("crconfirm", pv, "Confirm profile", "g") +
        pb("credit", pv, "Edit username or niche", "t");
    } else {
      var selectedNiche = CR_DRAFT.niche || "lifestyle",
        userError = CR_DRAFT.error || "";
      h +=
        '<div class="card"><label for="cr-user"><b>Choose a username</b></label><input id="cr-user" class="creator-input" type="text" name="creator-username" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="16" minlength="3" placeholder="3–16 letters, numbers or _" value="' +
        esc(CR_DRAFT.user) +
        '" aria-invalid="' +
        (userError ? "true" : "false") +
        '" aria-describedby="cr-user-hint cr-user-error"><small id="cr-user-hint">Use 3–16 letters, numbers, or underscores.</small><small id="cr-user-error" class="creator-error" role="alert">' +
        esc(userError) +
        '</small><label for="cr-niche"><b>Choose a content niche</b></label><select id="cr-niche" class="creator-input" name="creator-niche">' +
        CR_NICHES.map(function (n) {
          return (
            '<option value="' +
            esc(n[0]) +
            '"' +
            (selectedNiche === n[0] ? " selected" : "") +
            ">" +
            esc(n[1]) +
            "</option>"
          );
        }).join("") +
        '</select><small>Posts matching your niche earn 50% more followers.</small></div>' +
        pb("crreview", pv, "Review profile", "g");
    }
  } else if (!d.on || !crProfileReady(d)) {
    var legacy = !!d.on;
    h =
      hd(P.i + " " + P.n) +
      '<div class="card"><b>' +
      (legacy ? "Finish setting up your account" : "Start your creator account") +
      "</b><p>" +
      (legacy
        ? "Choose a username and niche to finish setting up. Your existing followers, posts, and achievements will stay."
        : "Choose a username and what you create to start growing an audience.") +
      "</p>" +
      (!legacy && S.age < 13 ? "<b>You must be 13 or older.</b>" : "") +
      "</div>" +
      pb(
        "crjoin",
        pv,
        legacy ? "Choose username and niche" : "Create account",
        "g",
        !legacy && S.age < 13,
      );
  } else {
    var sus = d.sus - S.day;
    h =
      hd(P.i + " " + P.n) +
      '<div class="card creator-account"><b>@' +
      esc(d.user) +
      "</b><br>" +
      crN(d.f) +
      " " +
      esc(P.unit) +
      " · " +
      crRank(d.f) +
      "<br>Niche: " +
      esc(crNicheName(d.niche)) +
      "<br>Posts: " +
      crN(d.posts) +
      "</div>" +
      crProgress("Monetization", d.f, P.mon) +
      crProgress("Verification eligibility", d.f, P.ver);
    if (d.mon)
      h += '<div class="card creator-status">✅ Monetization active</div>';
    if (d.ver)
      h += '<div class="card creator-status">🔵 Verified account</div>';
    if (d.st)
      h +=
        '<div class="card creator-alert creator-strike" role="status"><b>⚠️ Community strike: ' +
        d.st +
        "/3</b><br>Another strike may temporarily suspend this account.</div>";
    if (sus > 0) {
      h +=
        '<div class="card creator-alert creator-suspension" role="alert"><b>🚫 Account suspended</b><br>Posting and monetization are paused for ' +
        sus +
        " more day(s).</div>";
    } else {
      CRP[pv].forEach(function (c, i) {
        var tm = c[1] < 1 ? c[1] * 60 + " min" : c[1] + " hr",
          insufficient = S.en < c[2] + 1,
          matched = c[6] === d.niche;
        h += pb(
          "crpost",
          pv + ":" + i,
          c[0] +
            (matched ? " · Niche match +50%" : "") +
            " (" +
            tm +
            ", −" +
            c[2] +
            " HP" +
            (insufficient ? ", needs " + (c[2] + 1) + " HP" : "") +
            ")",
          "",
          insufficient,
        );
      });
      var sponsorPaid = doneToday("crs" + pv),
        verifyPaid = doneToday("crv" + pv);
      h +=
        pb(
          "crspon",
          pv,
          d.f < 1000
            ? "💰 Sponsors need 1,000 " + P.unit
            : sponsorPaid
              ? "✅ Sponsor payout collected today"
              : "💰 Sponsored post (+$" + crN(d.f * 0.015) + ")",
          "g",
          d.f < 1000 || sponsorPaid,
        ) +
        pb(
          "crver",
          pv,
          d.ver
            ? "✔ Verified"
            : d.f < P.ver
              ? "🔵 Verification needs " +
                crN(P.ver - d.f) +
                " more " +
                P.unit
              : verifyPaid
                ? "🔵 Try verification again tomorrow"
                : "🔵 Apply for verification",
          "",
          d.ver || d.f < P.ver || verifyPaid,
        );
    }
  }
  el.innerHTML =
    '<div class="phb"><span>' +
    t +
    "</span><span>📶 🔋" +
    Math.round((S.en / MAXE) * 100) +
    '%</span></div><div class="phc">' +
    h +
    '</div><div class="phh" data-a="home"><i></i></div>';
  phRestoreScroll(scroll);
  if (d.pend && !phn.hidden) crShowTroll(pv);
};
function crShowTroll(k) {
  if (CR_TROLL_OPEN || !S.cr[k] || !S.cr[k].pend) return;
  CR_TROLL_OPEN = true;
  phn.hidden = true;
  paused = true;
  onTitle = true;
  keys = {};
  held = {};
  bp.hidden = true;
  mshow(
    "🧌 Troll alert",
    ["A troll is attacking your comments. How will you respond?"],
    function (d) {
      [
        ["Ignore the troll", "ign"],
        ["Block the troll", "blk"],
        ["Clap back (risky)", "clap"],
      ].forEach(function (choice) {
        mbtn(d, "▶", choice[0], function () {
          crResolveTroll(k, choice[1]);
          closeMenu();
          CR_TROLL_OPEN = false;
          phone();
          pv = k;
          phRender();
        });
      });
    },
  );
};
PA.crjoin = function (k) {
  crInit();
  if (!PLAT[k]) return;
  var d = S.cr[k];
  CR_WELCOME = "";
  CR_DRAFT = {
    k: k,
    user: d.user || "",
    niche: d.niche || "lifestyle",
    error: "",
    stage: "form",
  };
};
PA.crreview = function (k) {
  if (!CR_DRAFT || CR_DRAFT.k !== k) return;
  var input = document.getElementById("cr-user"),
    select = document.getElementById("cr-niche"),
    user = input ? input.value.trim() : "",
    niche = select ? select.value : "";
  CR_DRAFT.user = user;
  CR_DRAFT.error = "";
  if (!/^[A-Za-z0-9_]{3,16}$/.test(user)) {
    CR_DRAFT.error =
      "Enter 3–16 characters using only letters, numbers, and underscores.";
    var error = document.getElementById("cr-user-error");
    if (error) error.textContent = CR_DRAFT.error;
    if (input) {
      input.setAttribute("aria-invalid", "true");
      input.focus();
    }
    return false;
  }
  if (
    !CR_NICHES.some(function (n) {
      return n[0] === niche;
    })
  ) {
    CR_DRAFT.error = "Choose a valid content niche.";
    var error = document.getElementById("cr-user-error");
    if (error) error.textContent = CR_DRAFT.error;
    return false;
  }
  CR_DRAFT.user = user;
  CR_DRAFT.niche = niche;
  CR_DRAFT.error = "";
  CR_DRAFT.stage = "confirm";
};
PA.credit = function (k) {
  if (CR_DRAFT && CR_DRAFT.k === k) CR_DRAFT.stage = "form";
};
PA.crconfirm = function (k) {
  if (
    !CR_DRAFT ||
    CR_DRAFT.k !== k ||
    !/^[A-Za-z0-9_]{3,16}$/.test(CR_DRAFT.user) ||
    !crNicheName(CR_DRAFT.niche)
  )
    return;
  crInit();
  var d = S.cr[k],
    isNew = !d.on;
  if (isNew && S.age < 13) {
    CR_DRAFT = null;
    pmsg = "You must be 13 or older to create a creator account.";
    return;
  }
  d.on = 1;
  d.user = CR_DRAFT.user;
  d.niche = CR_DRAFT.niche;
  CR_DRAFT = null;
  CR_WELCOME = k;
  if (isNew) {
    hp(3);
    addLog("Started a " + PLAT[k].n + " account.");
  } else {
    addLog("Completed the " + PLAT[k].n + " creator profile.");
  }
  save();
};
PA.crstart = function (k) {
  if (CR_WELCOME === k) CR_WELCOME = "";
};
PA.crpost = function (v) {
  crInit();
  var p = v.split(":"),
    k = p[0],
    c = CRP[k] && CRP[k][+p[1]],
    d = S.cr[k],
    P = PLAT[k];
  if (!c || !d.on || !crProfileReady(d) || S.day < d.sus || S.en < c[2] + 1)
    return;
  S.en -= c[2];
  adv(c[1]);
  d.posts++;

  var cap = Math.max(0, 1 - d.f / CR_CAP),
    matched = c[6] === d.niche,
    q = crQ(d) * cap * (matched ? 1.5 : 1),
    n = Math.floor((c[3] + d.f * 0.005) * q * crRand(0.6, 1.4)),
    m = matched ? "🎯 Niche match! +50% followers. " : "",
    r = Math.random();
  if (r < c[4]) {
    n += Math.floor((100 + d.f * crRand(0.05, 0.15)) * q);
    hp(6);
    m += "🔥 It went viral! ";
    addLog("Went viral on " + P.n + ".");
  } else if (r > 0.8) {
    n = Math.floor(n * 0.2);
    hp(-3);
    m += "It flopped. ";
  }
  d.f += n;
  m += "+" + crN(n) + " " + P.unit + ".";

  if (d.mon) {
    var pay = 0,
      views;
    if (k === "tw") {
      var viewers = Math.floor(d.f * crRand(0.03, 0.1) + 1);
      pay = Math.floor(viewers * crRand(0.1, 0.6) * c[1]);
      m += " " + crN(viewers) + " viewers.";
      if (Math.random() < 0.1) {
        pay *= 8;
        m += " 💸 A huge donation came in!";
      }
    } else {
      views = Math.floor(d.f * crRand(0.1, 0.4) + n * 10);
      pay = Math.floor(views * (k === "yt" ? 0.02 : 0.008));
      m += " " + crN(views) + " views.";
    }
    S.cash += pay;
    if (pay) m += " Earned $" + crN(pay) + ".";
  }

  if (!d.mon && d.f >= P.mon) {
    d.mon = 1;
    hp(5);
    m += " 💰 You’re now monetized!";
  }

  if (Math.random() < c[5]) {
    d.st++;
    if (d.st >= 3) {
      var lost = Math.floor(d.f * 0.1);
      d.f -= lost;
      d.st = 0;
      d.sus = S.day + 7;
      hp(-8);
      addLog("Suspended on " + P.n + ".");
      m +=
        " 🚫 Third strike! Suspended 7 days and lost " +
        crN(lost) +
        " " +
        P.unit +
        ".";
    } else {
      hp(-3);
      m += " ⚠️ Strike " + d.st + "/3 for edgy content.";
    }
  }

  if (!d.pend && Math.random() < 0.12) d.pend = 1;

  if (!S.cr.inf && crTotal() >= INF_AT) {
    S.cr.inf = 1;
    hp(10);
    addLog("Became a full-time influencer.");
    m += " ⭐ You’re officially an influencer!";
  }
  pmsg = m;
  save();
};

PA.crtroll = function (v) {
  var p = v.split(":");
  crResolveTroll(p[0], p[1]);
};
function crResolveTroll(k, action) {
  crInit();
  var d = S.cr[k];
  if (!d || !d.pend) return;
  d.pend = 0;
  if (action === "ign") {
    hp(-2);
    pmsg = "You scrolled past it. It still stung.";
  } else if (action === "blk") {
    hp(-1);
    pmsg = "Blocked. Problem solved.";
  } else if (action === "clap" && Math.random() < 0.5) {
    var g = Math.floor(d.f * 0.03) + 5;
    d.f += g;
    hp(4);
    pmsg =
      "Your comeback got screenshotted everywhere! +" +
      crN(g) +
      " " +
      PLAT[k].unit +
      ".";
  } else if (action === "clap") {
    var l = Math.floor(d.f * 0.02);
    d.f = Math.max(0, d.f - l);
    hp(-5);
    pmsg =
      "Your reply backfired. −" +
      crN(l) +
      " " +
      PLAT[k].unit +
      ".";
  }
  save();
}

PA.crspon = function (k) {
  crInit();
  var d = S.cr[k];
  if (
    !d.on ||
    !crProfileReady(d) ||
    d.f < 1000 ||
    doneToday("crs" + k)
  )
    return;
  markDone("crs" + k);
  adv(0.5);
  var pay = Math.floor(d.f * 0.015 * crRand(0.7, 1.3));
  S.cash += pay;
  if (Math.random() < 0.1) {
    var l = Math.floor(d.f * crRand(0.03, 0.08));
    d.f -= l;
    hp(-4);
    pmsg =
      "Paid $" +
      crN(pay) +
      ", but fans called it a sellout. −" +
      crN(l) +
      " " +
      PLAT[k].unit +
      ".";
  } else {
    hp(2);
    pmsg = "A brand paid you $" + crN(pay) + ".";
  }
  save();
};

PA.crver = function (k) {
  crInit();
  var d = S.cr[k];
  if (
    !d.on ||
    !crProfileReady(d) ||
    d.ver ||
    d.f < PLAT[k].ver ||
    doneToday("crv" + k)
  )
    return;
  markDone("crv" + k);
  if (Math.random() < 0.7) {
    d.ver = 1;
    hp(8);
    addLog("Got verified on " + PLAT[k].n + ".");
    pmsg = "🔵 Verified! Your growth gets a boost.";
  } else {
    pmsg = "Application declined. Try again tomorrow.";
  }
  save();
};

PA.crpay = function () {
  var pay = crPayout();
  if (!pay || !once("crpay")) return;
  S.cash += pay;
  pmsg = "Creator payout: +$" + crN(pay) + ".";
  save();
};
