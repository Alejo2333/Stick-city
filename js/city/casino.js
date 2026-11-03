// CASINO: games from safe-ish to wild. Every game keeps a house edge.
var casinoBet = 10,
  casinoMsg = "",
  casinoFx = "",
  casinoSnd = "",
  casinoView = null,
  casinoBusy = false,
  czMotion = !matchMedia("(prefers-reduced-motion: reduce)").matches,
  BETS = [
    10,
    50,
    100,
    500,
    1000,
    5000,
    10000,
    50000,
    100000,
    1000000,
    "all",
  ];
function casinoStake() {
  return casinoBet === "all" ? S.cash : casinoBet;
}
function betLabel() {
  return casinoBet === "all"
    ? "ALL IN (" + fmtCash(S.cash) + ")"
    : fmtCash(casinoBet);
}
function betButton(d, again) {
  mbtn(d, "💵", "Bet: " + betLabel() + " — tap to change", function () {
    var i = BETS.indexOf(casinoBet);
    // Skip stakes the player can't cover.
    for (var k = 1; k <= BETS.length; k++) {
      var nb = BETS[(i + k) % BETS.length];
      if (nb === "all" || nb <= S.cash) {
        casinoBet = nb;
        break;
      }
    }
    again();
  });
}
// Takes the stake, pays stake × mult and records stats.
function casinoPlay(mult, shown) {
  var bet = casinoStake();
  if (bet < 1 || bet > S.cash) {
    casinoMsg =
      S.cash < 1
        ? "💸 You're out of cash. Go earn some and come back."
        : "You can't cover a " +
          fmtCash(bet) +
          " bet. Lower your stake.";
    casinoFx = "";
    sfx("bad");
    return;
  }
  var net = Math.floor(bet * mult) - bet;
  S.cash += net;
  S.casino.plays++;
  adv(0.1);
  if (net > 0) {
    S.casino.won += net;
    S.casino.best = Math.max(S.casino.best, net);
    S.lifetimeEarned += net;
    casinoMsg =
      shown +
      " — " +
      (mult >= 10 ? "🎉 BIG WIN! " : "") +
      "+" +
      fmtCash(net) +
      " (" +
      mult +
      "×)";
    casinoFx = mult >= 10 ? "big" : "win";
    casinoSnd = mult >= 10 ? "up" : "coin";
    if (net >= 1000 && mult >= 10)
      addLog(
        "Hit a " +
          mult +
          "× win at the casino for " +
          fmtCash(net) +
          ".",
      );
  } else if (net < 0) {
    S.casino.lost -= net;
    S.lifetimeSpent -= net;
    casinoMsg =
      shown +
      " — lost " +
      fmtCash(-net) +
      (S.cash < 1 ? ". 💸 You're broke." : ".");
    casinoFx = "lose";
    casinoSnd = "bad";
    if (bet >= 10000 && S.cash < 1)
      addLog("Lost everything at the casino.");
  } else {
    casinoMsg =
      shown + " — push, you got your " + fmtCash(bet) + " back.";
    casinoFx = "push";
    casinoSnd = "click";
  }
  // During a round the sound waits for the animation's reveal.
  if (!casinoBusy) sfx(casinoSnd);
  if (casinoBet !== "all" && casinoBet > S.cash) casinoBet = 10;
  save();
}
function czEl(tag, cls, txt, parent) {
  var e = document.createElement(tag);
  e.className = cls;
  e.textContent = txt;
  parent.appendChild(e);
  return e;
}
function czMs(ms) {
  return czMotion ? ms : 150;
}
// Plays one round: the bet settles up front (so leaving mid-spin can't
// dodge a loss), then anim(done) runs on the stage. done(paint) keeps
// the final picture on screen when the page redraws.
function casinoRound(stage, again, settle, anim) {
  if (casinoBusy) return;
  var bet = casinoStake();
  if (bet < 1 || bet > S.cash) {
    settle();
    again();
    return;
  }
  var key = mn.dataset.k;
  casinoBusy = true;
  settle();
  var fx = casinoFx;
  casinoFx = "";
  mn.querySelectorAll(".menu button").forEach(function (b) {
    b.disabled = true;
  });
  anim(function (paint) {
    casinoBusy = false;
    casinoView = paint;
    sfx(casinoSnd);
    if (!mn.hidden && mn.dataset.k === key) {
      casinoFx = fx;
      again();
    }
  });
}
function czBurst(stage, n) {
  for (var i = 0; i < n; i++) {
    var s = czEl("span", "cz-bit", i % 3 ? "🪙" : "✨", stage),
      a = Math.random() * Math.PI * 2,
      r = 60 + Math.random() * 110;
    s.style.setProperty("--dx", Math.cos(a) * r + "px");
    s.style.setProperty("--dy", Math.sin(a) * r - 30 + "px");
    s.style.animationDelay = Math.floor(Math.random() * 150) + "ms";
  }
}
// idle(stage) draws the table before the first round.
function casinoScreen(title, intro, build, idle) {
  var self = function () {
    casinoScreen(title, intro, build, idle);
  };
  var stage = document.createElement("div");
  stage.className = "cz-stage";
  cityScreen(
    title,
    (casinoMsg || intro) + "  ·  Cash: " + fmtCash(S.cash),
    function (d) {
      betButton(d, self);
      build(d, self, stage);
    },
    casinoFloor,
  );
  var m = mn.querySelector(".menu");
  m.parentNode.insertBefore(stage, m);
  (casinoView || idle)(stage);
  if (casinoFx) {
    stage.classList.add("cz-reveal", "cz-" + casinoFx);
    if (casinoFx === "win") czBurst(stage, 12);
    if (casinoFx === "big") czBurst(stage, 36);
    casinoFx = "";
  }
}
function casinoFloor() {
  casinoMsg = "";
  casinoFx = "";
  casinoView = null;
  var c = S.casino;
  cityScreen(
    "🎰 Lucky Stick Casino",
    "Cash: " +
      fmtCash(S.cash) +
      " · Plays " +
      c.plays +
      " · Won " +
      fmtCash(c.won) +
      " · Lost " +
      fmtCash(c.lost) +
      " · Biggest win " +
      fmtCash(c.best),
    function (d) {
      mbtn(d, "🪙", "Coin flip — 2× (safe-ish)", casinoCoin);
      mbtn(d, "🃏", "High card vs dealer — 2×", casinoCard);
      mbtn(d, "🎡", "Roulette — 2× or 36×", casinoRoulette);
      mbtn(d, "🎰", "Slots — jackpot 1000×", casinoSlots);
      mbtn(d, "🚀", "Rocket — cash out up to 100×", casinoRocket);
      mbtn(d, "🌀", "Mega Wheel — 1000× or nothing", casinoWheel);
    },
  );
}
function casinoCoin() {
  function paint(side) {
    return function (st) {
      st.innerHTML = "";
      var c = czEl("div", "cz-coin", "", st);
      czEl("span", "cz-face", "H", c);
      czEl("span", "cz-face cz-back", "T", c);
      c.style.transform =
        "rotateY(" + (side === "Tails" ? 180 : 0) + "deg)";
      return c;
    };
  }
  casinoScreen(
    "🪙 Coin Flip",
    "Call it. 48% to double your bet.",
    function (d, again, stage) {
      ["Heads", "Tails"].forEach(function (side) {
        mbtn(d, "🪙", side, function () {
          var win = Math.random() < 0.48,
            land = win ? side : side === "Heads" ? "Tails" : "Heads";
          casinoRound(
            stage,
            again,
            function () {
              casinoPlay(win ? 2 : 0, "It landed " + land);
            },
            function (done) {
              var c = paint("Heads")(stage),
                spin = 1800 + (land === "Tails" ? 180 : 0),
                ms = czMs(1400);
              c.animate(
                [
                  { transform: "translateY(0) rotateY(0deg)" },
                  {
                    transform:
                      "translateY(-80px) rotateY(" + spin / 2 + "deg)",
                  },
                  {
                    transform: "translateY(0) rotateY(" + spin + "deg)",
                  },
                ],
                { duration: ms, easing: "ease-in-out", fill: "forwards" },
              );
              setTimeout(function () {
                done(paint(land));
              }, ms);
            },
          );
        });
      });
    },
    paint("Heads"),
  );
}
function casinoCard() {
  function name(v) {
    return { 11: "J", 12: "Q", 13: "K", 14: "A" }[v] || String(v);
  }
  function draw() {
    return {
      v: 2 + Math.floor(Math.random() * 13),
      s: "♠♥♦♣".charAt(Math.floor(Math.random() * 4)),
    };
  }
  // Face-down cards slide in as dealt; face-up ones mark the winner.
  function paint(cards, up) {
    return function (st) {
      st.innerHTML = "";
      var row = czEl(
          "div",
          "cz-row" + (up || !cards[0].v ? "" : " cz-deal"),
          "",
          st,
        ),
        best = cards[0].v > cards[1].v ? 0 : 1;
      cards.forEach(function (c, i) {
        var w = czEl("div", "cz-cardw", "", row),
          card = czEl("div", "cz-card" + (up ? " up" : ""), "", w);
        czEl(
          "div",
          "cz-cf" + (c.s === "♥" || c.s === "♦" ? " red" : ""),
          name(c.v) + c.s,
          card,
        );
        czEl("div", "cz-cb", "", card);
        czEl("div", "cz-cap", i ? "Dealer" : "You", w);
        if (up && i === best) w.classList.add("cz-hi");
      });
      return row;
    };
  }
  casinoScreen(
    "🃏 High Card",
    "Beat the dealer's card to win 2×. Ties go to the house.",
    function (d, again, stage) {
      mbtn(d, "🃏", "Draw", function () {
        var cards = [draw(), draw()],
          you = cards[0].v,
          dl = cards[1].v;
        casinoRound(
          stage,
          again,
          function () {
            casinoPlay(
              you > dl ? 2 : 0,
              "You " + name(you) + " vs dealer " + name(dl),
            );
          },
          function (done) {
            var el = paint(cards, false)(stage).querySelectorAll(
              ".cz-card",
            );
            [450, 1100].forEach(function (t, i) {
              setTimeout(function () {
                el[i].classList.add("up");
                sfx("click");
              }, czMs(t));
            });
            setTimeout(function () {
              done(paint(cards, true));
            }, czMs(1800));
          },
        );
      });
    },
    paint(
      [
        { v: 0, s: "" },
        { v: 0, s: "" },
      ],
      false,
    ),
  );
}
// A wheel of [label, color] pockets with pocket 0 at the top. With
// `at` set, that pocket sits under the pointer and shows in the hub.
function czWheel(st, segs, at) {
  st.innerHTML = "";
  var box = czEl("div", "cz-wheelbox", "", st),
    w = czEl("div", "cz-wheel", "", box),
    a = 360 / segs.length,
    g = [];
  czEl("div", "cz-pin", "", box);
  segs.forEach(function (s, i) {
    g.push(s[1] + " " + i * a + "deg " + (i + 1) * a + "deg");
    var l = czEl("span", "cz-lbl", s[0], w);
    l.style.transform = "rotate(" + (i + 0.5) * a + "deg)";
    if (s[0].length > 3) l.style.fontSize = "7px";
  });
  w.style.background = "conic-gradient(" + g.join(",") + ")";
  var hub = czEl("div", "cz-hub", at == null ? "?" : segs[at][0], box);
  if (at != null) {
    hub.style.background = segs[at][1];
    w.style.transform = "rotate(" + -(at + 0.5) * a + "deg)";
  }
  return w;
}
function czSpin(st, segs, at, done) {
  var w = czWheel(st, segs, null),
    ms = czMs(3400);
  st.querySelector(".cz-hub").textContent = "…";
  w.animate(
    [
      { transform: "rotate(0deg)" },
      {
        transform:
          "rotate(" +
          -(360 * 6 + (at + 0.5) * (360 / segs.length)) +
          "deg)",
      },
    ],
    {
      duration: ms,
      easing: "cubic-bezier(0.12, 0.6, 0.2, 1)",
      fill: "forwards",
    },
  );
  setTimeout(function () {
    done(function (s) {
      czWheel(s, segs, at);
    });
  }, ms);
}
function casinoRoulette() {
  var RED = [
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34,
      36,
    ],
    // Pocket order around a single-zero wheel.
    ORDER = [
      0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8,
      23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12,
      35, 3, 26,
    ],
    SEGS = ORDER.map(function (n) {
      return [
        String(n),
        n === 0
          ? "#12a150"
          : RED.indexOf(n) >= 0
            ? "#c8102e"
            : "#16161d",
      ];
    });
  casinoScreen(
    "🎡 Roulette",
    "37 pockets. Red or black pays 2×, a single number pays 36×.",
    function (d, again, stage) {
      [
        [
          "🔴",
          "Red — 2×",
          function (n) {
            return RED.indexOf(n) >= 0 ? 2 : 0;
          },
        ],
        [
          "⚫",
          "Black — 2×",
          function (n) {
            return n && RED.indexOf(n) < 0 ? 2 : 0;
          },
        ],
        [
          "🟢",
          "Green 0 — 36×",
          function (n) {
            return n === 0 ? 36 : 0;
          },
        ],
        [
          "7️⃣",
          "Lucky 7 — 36×",
          function (n) {
            return n === 7 ? 36 : 0;
          },
        ],
        [
          "🍀",
          "Lucky 17 — 36×",
          function (n) {
            return n === 17 ? 36 : 0;
          },
        ],
      ].forEach(function (o) {
        mbtn(d, o[0], o[1], function () {
          var n = Math.floor(Math.random() * 37),
            col = n === 0 ? "🟢" : RED.indexOf(n) >= 0 ? "🔴" : "⚫";
          casinoRound(
            stage,
            again,
            function () {
              casinoPlay(o[2](n), "Ball landed on " + col + " " + n);
            },
            function (done) {
              czSpin(stage, SEGS, ORDER.indexOf(n), done);
            },
          );
        });
      });
    },
    function (st) {
      czWheel(st, SEGS, null);
    },
  );
}
function casinoSlots() {
  var SYM = [
      ["🍒", 40],
      ["🍋", 30],
      ["🔔", 15],
      ["💎", 10],
      ["7️⃣", 5],
    ],
    PAY = { "🍒": 3, "🍋": 5, "🔔": 25, "💎": 100, "7️⃣": 1000 };
  function reel() {
    var r = Math.random() * 100;
    for (var i = 0; i < SYM.length; i++) {
      if (r < SYM[i][1]) return SYM[i][0];
      r -= SYM[i][1];
    }
    return SYM[0][0];
  }
  // Each reel stacks `spin` random symbols above the one it lands on.
  function paint(r, spin) {
    return function (st) {
      st.innerHTML = "";
      var row = czEl("div", "cz-slots", "", st);
      r.forEach(function (s) {
        var win = czEl("div", "cz-reel", "", row),
          strip = czEl("div", "cz-strip", "", win);
        for (var k = 0; k < spin; k++)
          czEl("div", "cz-sym", reel(), strip);
        czEl("div", "cz-sym", s, strip);
        if (
          !spin &&
          r.filter(function (x) {
            return x === s;
          }).length > 1
        )
          win.classList.add("cz-hi");
      });
      return row;
    };
  }
  casinoScreen(
    "🎰 Slots",
    "Three of a kind: 🍒 3× · 🍋 5× · 🔔 25× · 💎 100× · 7️⃣ 1000×. Any pair returns half your bet.",
    function (d, again, stage) {
      mbtn(d, "🎰", "Spin", function () {
        var r = [reel(), reel(), reel()],
          mult =
            r[0] === r[1] && r[1] === r[2]
              ? PAY[r[0]]
              : r[0] === r[1] || r[1] === r[2] || r[0] === r[2]
                ? 0.5
                : 0;
        casinoRound(
          stage,
          again,
          function () {
            casinoPlay(
              mult,
              "[ " +
                r.join(" ") +
                " ]" +
                (mult === 1000 ? " JACKPOT!!!" : ""),
            );
          },
          function (done) {
            var N = 16,
              strips = paint(r, N)(stage).querySelectorAll(".cz-strip"),
              last = 0;
            [].forEach.call(strips, function (s, i) {
              var h = s.firstChild.offsetHeight || 68,
                ms = czMs(1000 + i * 500);
              last = ms;
              s.style.filter = "blur(1.5px)";
              s.animate(
                [
                  { transform: "translateY(0)" },
                  { transform: "translateY(" + -N * h + "px)" },
                ],
                {
                  duration: ms,
                  easing: "cubic-bezier(0.25, 0.1, 0.3, 1.08)",
                  fill: "forwards",
                },
              );
              setTimeout(function () {
                s.style.filter = "";
                sfx("click");
              }, ms);
            });
            setTimeout(function () {
              done(paint(r, 0));
            }, last + 150);
          },
        );
      });
    },
    paint(["7️⃣", "7️⃣", "7️⃣"], 0),
  );
}
function casinoRocket() {
  // state is "fly", "out" (cashed out) or "boom". The paint returns
  // a setter that moves the rocket and counter to a multiplier.
  function paint(m, t, state) {
    return function (st) {
      st.innerHTML = "";
      var sky = czEl("div", "cz-sky", "", st);
      if (t) czEl("div", "cz-goal", "cash out " + t + "×", sky);
      var r = czEl(
          "div",
          "cz-rocket " + state,
          state === "boom" ? "💥" : "🚀",
          sky,
        ),
        v = czEl("div", "cz-mult " + state, "", sky);
      if (state === "out") czEl("div", "cz-tag", "✅ Cashed out", sky);
      function at(x) {
        var f = t
          ? Math.min(0.95, (Math.log(x) / Math.log(t)) * 0.75)
          : 0;
        r.style.bottom = 6 + f * 80 + "%";
        v.textContent = x.toFixed(2) + "×";
      }
      at(m);
      return at;
    };
  }
  casinoScreen(
    "🚀 Rocket",
    "Pick where to cash out. If the rocket explodes first you lose your bet. Higher targets pay more but crash more often.",
    function (d, again, stage) {
      [1.5, 2, 5, 10, 25, 100].forEach(function (t) {
        mbtn(
          d,
          "🚀",
          "Cash out at " + t + "× (" + Math.round(95 / t) + "% chance)",
          function () {
            // Chance the rocket reaches t is 0.95 / t.
            var crash = Math.max(
                1,
                Math.floor((0.95 / (1 - Math.random())) * 100) / 100,
              ),
              ok = crash >= t,
              stop = ok ? t : crash;
            casinoRound(
              stage,
              again,
              function () {
                casinoPlay(
                  ok ? t : 0,
                  ok
                    ? "Rocket flew to " +
                        crash +
                        "×, you bailed at " +
                        t +
                        "×"
                    : "💥 Rocket exploded at " + crash + "×",
                );
              },
              function (done) {
                // Climbs exponentially: 2× in ~0.9s, 10× in 3s, 100× in 6s.
                var at = paint(1, t, "fly")(stage),
                  K = Math.log(100) / 6000,
                  t0 = performance.now();
                (function step(now) {
                  var m = czMotion
                    ? Math.min(stop, Math.exp((now - t0) * K))
                    : stop;
                  at(m);
                  if (m < stop) requestAnimationFrame(step);
                  else
                    setTimeout(function () {
                      done(paint(stop, t, ok ? "out" : "boom"));
                    }, 200);
                })(t0);
              },
            );
          },
        );
      });
    },
    paint(1, 0, "fly"),
  );
}
function casinoWheel() {
  // Weights out of 100: about 75% lose it all, 1 in 12,500 hits 1000×.
  var SEG = [
      [0, 74.692],
      [1.5, 15],
      [3, 8],
      [10, 2],
      [50, 0.3],
      [1000, 0.008],
    ],
    // Wheel art only: the odds come from SEG, not slice sizes.
    COL = {
      0: "#2b2f45",
      1.5: "#2f6fe0",
      3: "#1f9d55",
      10: "#9b3fe0",
      50: "#e06a1f",
      1000: "#e0b000",
    },
    FACE = [
      1000, 0, 1.5, 0, 3, 0, 1.5, 0, 10, 0, 1.5, 0, 3, 0, 1.5, 0, 50,
      0, 1.5, 0, 3, 0, 1.5, 0,
    ],
    SEGS = FACE.map(function (m) {
      return [m ? m + "×" : "✖", COL[m]];
    });
  casinoScreen(
    "🌀 Mega Wheel",
    "Most spins lose everything. Some pay 1.5×, 3× or 10×. Rarely 50×. Once in a blue moon: 1000×.",
    function (d, again, stage) {
      mbtn(d, "🌀", "Spin the Mega Wheel", function () {
        var r = Math.random() * 100,
          m = 0,
          spots = [];
        for (var i = 0; i < SEG.length; i++) {
          if (r < SEG[i][1]) {
            m = SEG[i][0];
            break;
          }
          r -= SEG[i][1];
        }
        FACE.forEach(function (f, k) {
          if (f === m) spots.push(k);
        });
        casinoRound(
          stage,
          again,
          function () {
            casinoPlay(
              m,
              m
                ? "The wheel stopped on " + m + "×"
                : "The wheel stopped on ✖",
            );
          },
          function (done) {
            czSpin(
              stage,
              SEGS,
              spots[Math.floor(Math.random() * spots.length)],
              done,
            );
          },
        );
      });
    },
    function (st) {
      czWheel(st, SEGS, null);
    },
  );
}
