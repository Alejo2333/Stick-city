function addLog(m) {
  S.log.push("Age " + S.age + ": " + m);
  if (S.log.length > 30) S.log.shift();
}
function hp(n) {
  S.hap = Math.max(0, Math.min(100, S.hap + n));
}
var EVS = [
  {
    t: "A stranger offers you a “sure thing”. Invest $50?",
    c: [
      [
        "Invest $50",
        function () {
          if (S.cash < 50) return "You couldn’t afford it.";
          S.cash -= 50;
          if (Math.random() < 0.5) {
            S.cash += 150;
            hp(5);
            return "It paid off! You made $100.";
          }
          hp(-5);
          return "It was a scam. You lost $50.";
        },
      ],
      [
        "Walk away",
        function () {
          return "You kept your money and your doubts.";
        },
      ],
    ],
  },
  {
    t: "A friend invites you to a wild party.",
    c: [
      [
        "Go",
        function () {
          S.en = Math.max(1, S.en - 4);
          S.cha++;
          hp(8);
          return "Best night ever. (+1 CHA)";
        },
      ],
      [
        "Stay in and read",
        function () {
          S.int++;
          hp(2);
          return "You read until midnight. (+1 INT)";
        },
      ],
    ],
  },
  {
    t: "You feel a strange pain in your side.",
    c: [
      [
        "See a doctor ($30)",
        function () {
          if (S.cash < 30) return "You couldn’t afford it.";
          S.cash -= 30;
          S.en = MAXE;
          hp(2);
          return "Just gas. You feel fully rested.";
        },
      ],
      [
        "Ignore it",
        function () {
          if (Math.random() < 0.5) {
            S.en = Math.max(1, S.en - 8);
            hp(-4);
            return "It got worse. (−8 HP)";
          }
          return "It went away on its own.";
        },
      ],
    ],
  },
  {
    t: "You find a stray dog following you home.",
    c: [
      [
        "Adopt it ($20)",
        function () {
          if (S.cash < 20) return "You couldn’t afford it.";
          S.cash -= 20;
          S.k += 3;
          hp(10);
          return "You have a new best friend. (+3 karma)";
        },
      ],
      [
        "Shoo it away",
        function () {
          S.k -= 1;
          hp(-2);
          return "It looked back at you sadly.";
        },
      ],
    ],
  },
  {
    t: "You spot a wallet with $200 on the ground.",
    c: [
      [
        "Keep it",
        function () {
          S.cash += 200;
          S.k -= 8;
          hp(-2);
          return "+$200, but your conscience itches. (−8 karma)";
        },
      ],
      [
        "Return it",
        function () {
          S.k += 8;
          hp(5);
          return "The owner is grateful. (+8 karma)";
        },
      ],
    ],
  },
  {
    t: "A lottery ticket is on sale for $5.",
    c: [
      [
        "Buy one",
        function () {
          if (S.cash < 5) return "You couldn’t afford it.";
          S.cash -= 5;
          if (Math.random() < 0.05) {
            S.cash += 500;
            hp(15);
            return "WINNER! You won $500!";
          }
          return "Not a winner.";
        },
      ],
      [
        "Pass",
        function () {
          return "You saved your five bucks.";
        },
      ],
    ],
  },
  {
    t: "Your family is hosting a reunion.",
    c: [
      [
        "Attend",
        function () {
          S.cha++;
          hp(6);
          return "Everyone asked about your love life. (+1 CHA)";
        },
      ],
      [
        "Skip it",
        function () {
          hp(-3);
          return "You stayed home. Mom is hurt.";
        },
      ],
    ],
  },
];
function die() {
  phn.hidden = true;
  addLog("Died.");
  try {
    localStorage.removeItem(KEY);
  } catch (e) {}
  paused = true;
  onTitle = true;
  bp.hidden = true;
  keys = {};
  held = {};
  mshow(
    "💀 You died at " + S.age,
    [
      "Lived " +
        S.day +
        " days. Left behind $" +
        (S.cash + S.bank) +
        ", karma " +
        S.k +
        ".",
    ].concat(S.log.slice(-4)),
    function (d) {
      mbtn(d, "✨", "Start a new life", function () {
        location.reload();
      });
    },
  );
}
function birthday() {
  phn.hidden = true;
  S.age++;
  if (S.age >= 60 && Math.random() < (S.age - 58) * 0.04) return die();
  if (S.hap < 20) S.en = Math.max(1, S.en - 5);
  var e = EVS[Math.floor(Math.random() * EVS.length)];
  paused = true;
  onTitle = true;
  keys = {};
  held = {};
  bp.hidden = true;
  save();
  mshow("🎂 Happy birthday! Age " + S.age, [e.t], function (d) {
    e.c.forEach(function (c) {
      mbtn(d, "▶", c[0], function () {
        var r = c[1]();
        addLog(r);
        say(r);
        save();
        closeMenu();
      });
    });
  });
}
