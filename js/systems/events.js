function addLog(m) {
  if (!Array.isArray(S.log)) S.log = [];
  S.log.push("Age " + S.age + ": " + m);
  if (S.log.length > 30) S.log.shift();
  if (typeof lifeCaptureLog === "function") lifeCaptureLog(m);
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
          if (S.cash < 50) return cant();
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
          if (S.cash < 30) return cant();
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
          if (S.cash < 20) return cant();
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
    ok: isAdult,
    c: [
      [
        "Buy one",
        function () {
          if (S.cash < 5) return cant();
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
          return "Everyone asked what you’ve been up to. (+1 CHA)";
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

function eligibleEvents() {
  return EVS.filter(function (event) {
    if (!event || typeof event.t !== "string" || !Array.isArray(event.c))
      return false;
    var validChoices =
      event.c.length > 0 &&
      event.c.every(function (choice) {
        return (
          Array.isArray(choice) &&
          typeof choice[0] === "string" &&
          typeof choice[1] === "function"
        );
      });
    if (!validChoices) {
      console.error("Skipping event with invalid choices:", event.t);
      return false;
    }
    if (typeof event.ok !== "function") return true;
    try {
      return !!event.ok();
    } catch (error) {
      console.error("Skipping event with a failing eligibility check:", event.t, error);
      return false;
    }
  });
}
function pickEvent() {
  var events = eligibleEvents();
  return events.length
    ? events[Math.floor(Math.random() * events.length)]
    : null;
}
function showEvent(title, event) {
  if (!event) {
    say("No eligible events are available right now.");
    return false;
  }
  phn.hidden = true;
  paused = true;
  onTitle = true;
  keys = {};
  held = {};
  bp.hidden = true;
  save();
  var resolved = false;
  mshow(title, [event.t], function (d) {
    event.c.forEach(function (choice) {
      mbtn(d, "▶", choice[0], function () {
        if (resolved) return;
        resolved = true;
        try {
          var result = choice[1](),
            message =
              result == null ? "Event choice completed." : String(result);
          addLog(message);
          say(message);
          save();
          closeMenu();
        } catch (error) {
          console.error("Event choice failed:", event.t, choice[0], error);
          closeMenu();
          say(
            "Event choice failed: " +
              (error && error.message ? error.message : String(error)),
          );
        }
      });
    });
  });
  return true;
}
function showRandomEvent(title) {
  return showEvent(title, pickEvent());
}

function cant() {
  return "You couldn’t afford it.";
}
function heal(n) {
  S.en = Math.min(MAXE, S.en + n);
}
function hurt(n) {
  S.en = Math.max(1, S.en - n);
}

EVS.push(
  // ---------- money & luck ----------
  {
    t: "A pickpocket bumps into you in the crowd.",
    c: [
      [
        "Check your pockets",
        function () {
          if (Math.random() < 0.5) {
            var l = Math.min(S.cash, 40);
            S.cash -= l;
            hp(-4);
            return "Too late. You lost $" + l + ".";
          }
          hp(2);
          return "You caught his wrist in time. He ran off.";
        },
      ],
      [
        "Shrug it off",
        function () {
          var l = Math.min(S.cash, 60);
          S.cash -= l;
          hp(-4);
          return "He got you for $" + l + ".";
        },
      ],
    ],
  },
  {
    t: "The bank sent you $150 by mistake.",
    c: [
      [
        "Spend it",
        function () {
          S.cash += 150;
          S.k -= 6;
          hp(3);
          return "+$150, but it feels wrong. (−6 karma)";
        },
      ],
      [
        "Report the error",
        function () {
          S.k += 6;
          hp(4);
          return "The teller was stunned by your honesty. (+6 karma)";
        },
      ],
    ],
  },
  {
    t: "A distant aunt you barely knew has passed away. You’re in her will.",
    c: [
      [
        "Collect the inheritance",
        function () {
          S.cash += 300;
          hp(-2);
          return "You received $300. Bittersweet.";
        },
      ],
      [
        "Donate it all to charity",
        function () {
          S.k += 15;
          hp(6);
          return "You gave it all away. (+15 karma)";
        },
      ],
    ],
  },
  {
    t: "A friend asks to borrow $100.",
    c: [
      [
        "Lend it",
        function () {
          if (S.cash < 100) return cant();
          S.cash -= 100;
          if (Math.random() < 0.6) {
            S.cash += 130;
            S.k += 2;
            hp(4);
            return "They paid you back with a $30 thank-you!";
          }
          hp(-5);
          return "They stopped answering your calls. −$100.";
        },
      ],
      [
        "Say no",
        function () {
          hp(-2);
          return "Things got awkward.";
        },
      ],
    ],
  },
  {
    t: "A guy at a garage sale has a sealed “mystery box” for $30.",
    c: [
      [
        "Buy it",
        function () {
          if (S.cash < 30) return cant();
          S.cash -= 30;
          var v = Math.floor(Math.random() * 121);
          S.cash += v;
          hp(v >= 30 ? 6 : -3);
          return v >= 30
            ? "Inside was a vintage collectible worth $" + v + "!"
            : "Junk. It was worth about $" + v + ".";
        },
      ],
      [
        "Walk past",
        function () {
          return "You’ll never know what was inside.";
        },
      ],
    ],
  },
  {
    t: "Your coworkers invite you to a poker night.",
    ok: function () {
      return S.age >= 18;
    },
    c: [
      [
        "Bet $50",
        function () {
          if (S.cash < 50) return cant();
          if (Math.random() < 0.45) {
            S.cash += 50;
            hp(8);
            return "You bluffed like a pro. +$50!";
          }
          S.cash -= 50;
          hp(-4);
          return "Your pair of twos did not hold up. −$50.";
        },
      ],
      [
        "Just watch",
        function () {
          S.cha++;
          hp(1);
          return "You made small talk instead. (+1 CHA)";
        },
      ],
    ],
  },
  {
    t: "Your phone buzzes: a post of yours is going viral!",
    c: [
      [
        "Ride the wave",
        function () {
          if (Math.random() < 0.4) {
            S.cash += 100;
            S.cha += 2;
            hp(10);
            return "Brands are messaging you. +$100 and +2 CHA!";
          }
          hp(-6);
          return "The comments turned on you. Delete, delete, delete.";
        },
      ],
      [
        "Log off for a week",
        function () {
          hp(3);
          return "You touched grass. It was nice.";
        },
      ],
    ],
  },
  {
    t: "Your car breaks down on the way home.",
    c: [
      [
        "Pay for a tow and repairs ($120)",
        function () {
          if (S.cash < 120) return cant();
          S.cash -= 120;
          hp(-1);
          return "The mechanic sighed. −$120.";
        },
      ],
      [
        "Walk home",
        function () {
          hurt(3);
          hp(-3);
          return "A long, tiring walk. (−3 HP)";
        },
      ],
    ],
  },
  {
    t: "The tax office sends you a letter. You’re being audited.",
    ok: function () {
      return S.age >= 25;
    },
    c: [
      [
        "Pay what you owe ($80)",
        function () {
          if (S.cash < 80) {
            S.cash = 0;
            hp(-8);
            return "You paid what you had. Stressful.";
          }
          S.cash -= 80;
          hp(-3);
          return "All sorted. −$80.";
        },
      ],
      [
        "Fudge the numbers",
        function () {
          if (Math.random() < 0.3) {
            var f = Math.min(S.cash, 250);
            S.cash -= f;
            S.k -= 5;
            hp(-10);
            return "Caught! You were fined $" + f + ". (−5 karma)";
          }
          S.k -= 3;
          return "They never noticed. (−3 karma)";
        },
      ],
    ],
  },

  // ---------- health ----------
  {
    t: "Flu season is here and the clinic is offering shots.",
    c: [
      [
        "Get vaccinated ($15)",
        function () {
          if (S.cash < 15) return cant();
          S.cash -= 15;
          hp(1);
          return "A little pinch, and you’re covered.";
        },
      ],
      [
        "Skip it",
        function () {
          if (Math.random() < 0.35) {
            hurt(7);
            hp(-6);
            return "You caught the flu. (−7 HP)";
          }
          return "You got lucky this year.";
        },
      ],
    ],
  },
  {
    t: "A friend wants you to join the gym with them.",
    c: [
      [
        "Join ($40)",
        function () {
          if (S.cash < 40) return cant();
          S.cash -= 40;
          heal(5);
          hp(6);
          S.cha++;
          return "You feel stronger already. (+5 HP, +1 CHA)";
        },
      ],
      [
        "Nope, couch life",
        function () {
          hp(1);
          return "Netflix was a good call.";
        },
      ],
    ],
  },
  {
    t: "A street food truck smells incredible, but the line is short for a reason.",
    c: [
      [
        "Order a burger ($8)",
        function () {
          if (S.cash < 8) return cant();
          S.cash -= 8;
          if (Math.random() < 0.25) {
            hurt(5);
            hp(-5);
            return "Food poisoning. (−5 HP)";
          }
          hp(5);
          return "Best burger of your life!";
        },
      ],
      [
        "Eat at home",
        function () {
          return "A safe, boring sandwich.";
        },
      ],
    ],
  },
  {
    t: "A salesman is pushing a “miracle tonic” that cures everything.",
    c: [
      [
        "Buy a bottle ($25)",
        function () {
          if (S.cash < 25) return cant();
          S.cash -= 25;
          if (Math.random() < 0.2) {
            heal(6);
            hp(4);
            return "Placebo effect or not, you feel great! (+6 HP)";
          }
          hurt(2);
          hp(-3);
          return "It tasted like pond water. (−2 HP)";
        },
      ],
      [
        "Laugh and leave",
        function () {
          S.int++;
          return "You know a scam when you see one. (+1 INT)";
        },
      ],
    ],
  },

  // ---------- karma & social ----------
  {
    t: "A street musician is playing beautifully.",
    c: [
      [
        "Tip $5",
        function () {
          if (S.cash < 5) return cant();
          S.cash -= 5;
          S.k += 2;
          hp(4);
          return "They smiled at you. (+2 karma)";
        },
      ],
      [
        "Keep walking",
        function () {
          return "You hummed the tune all day anyway.";
        },
      ],
    ],
  },
  {
    t: "A charity volunteer asks for a donation.",
    c: [
      [
        "Give $20",
        function () {
          if (S.cash < 20) return cant();
          S.cash -= 20;
          S.k += 5;
          hp(5);
          return "You helped someone today. (+5 karma)";
        },
      ],
      [
        "Say sorry and rush past",
        function () {
          S.k -= 1;
          return "You avoided eye contact.";
        },
      ],
    ],
  },
  {
    t: "Your neighbor’s cat is stuck up a tree.",
    c: [
      [
        "Climb up and rescue it",
        function () {
          if (Math.random() < 0.25) {
            hurt(5);
            hp(-2);
            S.k += 4;
            return "You fell… but saved the cat! (−5 HP, +4 karma)";
          }
          S.k += 4;
          hp(6);
          return "Rescued! The neighbor baked you cookies. (+4 karma)";
        },
      ],
      [
        "Call someone else",
        function () {
          return "The fire department handled it.";
        },
      ],
    ],
  },
  {
    t: "An old friend shows up at your door, down on their luck.",
    c: [
      [
        "Let them stay a few nights",
        function () {
          S.k += 6;
          S.cha++;
          hp(4);
          return "They’re deeply grateful. (+6 karma, +1 CHA)";
        },
      ],
      [
        "Give them $30 and wave goodbye",
        function () {
          if (S.cash < 30) return cant();
          S.cash -= 30;
          S.k += 2;
          return "A small kindness. (+2 karma)";
        },
      ],
    ],
  },
  {
    t: "You’re invited to a karaoke night.",
    c: [
      [
        "Grab the mic",
        function () {
          if (Math.random() < 0.5) {
            S.cha += 2;
            hp(8);
            return "Standing ovation! (+2 CHA)";
          }
          hp(-5);
          return "You forgot the lyrics and the room went silent.";
        },
      ],
      [
        "Cheer from the back",
        function () {
          hp(3);
          return "A fun night from the safety of your seat.";
        },
      ],
    ],
  },
  {
    t: "A friend sets you up on a blind date.",
    ok: function () {
      return S.age >= 18;
    },
    c: [
      [
        "Go",
        function () {
          var r = Math.random();
          if (r < 0.3) {
            S.cha++;
            hp(12);
            return "Instant chemistry. You can’t stop smiling. (+1 CHA)";
          }
          if (r < 0.7) {
            hp(1);
            return "Pleasant, but no spark.";
          }
          hp(-6);
          return "They talked about their ex the whole time.";
        },
      ],
      [
        "Cancel",
        function () {
          hp(-1);
          return "Your friend sulked a little.";
        },
      ],
    ],
  },
  {
    t: "Your teacher is handing out the exam. The answers are visible on the kid’s paper next to you.",
    ok: function () {
      return S.age <= 22;
    },
    c: [
      [
        "Peek",
        function () {
          if (Math.random() < 0.3) {
            S.k -= 5;
            hp(-8);
            return "Caught cheating! Total humiliation. (−5 karma)";
          }
          S.k -= 3;
          return "Top marks, but you feel guilty. (−3 karma)";
        },
      ],
      [
        "Eyes on your own paper",
        function () {
          S.int++;
          S.k += 2;
          hp(2);
          return "You earned it honestly. (+1 INT, +2 karma)";
        },
      ],
    ],
  },

  // ---------- self-improvement ----------
  {
    t: "An online course promises to teach you a skill in a weekend.",
    c: [
      [
        "Enroll ($60)",
        function () {
          if (S.cash < 60) return cant();
          S.cash -= 60;
          S.int += 2;
          hp(3);
          return "You learned a lot. (+2 INT)";
        },
      ],
      [
        "Watch free videos instead",
        function () {
          S.int++;
          return "Not as polished, but you learned something. (+1 INT)";
        },
      ],
    ],
  },
  {
    t: "Your boss offers you extra shifts this month.",
    ok: function () {
      return S.age >= 18;
    },
    c: [
      [
        "Take them",
        function () {
          S.cash += 150;
          hurt(4);
          hp(-3);
          return "+$150, but you’re exhausted. (−4 HP)";
        },
      ],
      [
        "Protect your free time",
        function () {
          hp(4);
          return "You enjoyed your weekends.";
        },
      ],
    ],
  },
  {
    t: "A rainy week traps you indoors.",
    c: [
      [
        "Binge a TV series",
        function () {
          hp(5);
          hurt(1);
          return "Totally worth it. (−1 HP from no sleep)";
        },
      ],
      [
        "Learn a new hobby",
        function () {
          S.int++;
          S.cha++;
          hp(3);
          return "You picked up the guitar. (+1 INT, +1 CHA)";
        },
      ],
    ],
  },

  // ---------- market-linked (needs market.js) ----------
  {
    t: "Your cousin swears MoonRock is about to “go to the moon”. He wants you in.",
    ok: function () {
      return typeof buy === "function" && S.px && S.px.MON;
    },
    c: [
      [
        "Put in $100",
        function () {
          if (S.cash < 100) return cant();
          var q = Math.floor(100 / S.px.MON);
          if (q < 1 || !buy("MON", q)) return cant();
          hp(3);
          return "You bought " + q + " MoonRock shares. Hold on tight!";
        },
      ],
      [
        "Ignore him",
        function () {
          return "He texts you memes about it anyway.";
        },
      ],
    ],
  },
  {
    t: "A dog meme is exploding online. People are rushing to buy DogeStick.",
    ok: function () {
      return typeof setPx === "function" && S.px && S.px.DGE;
    },
    c: [
      [
        "Join the frenzy ($50)",
        function () {
          if (S.cash < 50) return cant();
          var q = Math.floor(50 / S.px.DGE);
          if (q < 1 || !buy("DGE", q)) return cant();
          if (Math.random() < 0.5) setPx("DGE", rand(1.4, 2.2));
          else setPx("DGE", rand(0.5, 0.8));
          hp(2);
          return "You bought " + q + " DogeStick. The price is already moving!";
        },
      ],
      [
        "Watch from the sidelines",
        function () {
          return "You saw the headlines and kept your cash.";
        },
      ],
    ],
  },
  {
    t: "Rumors of a market crash are flying around the internet.",
    ok: function () {
      return typeof invested === "function" && invested() > 0;
    },
    c: [
      [
        "Sell everything",
        function () {
          var tot = 0;
          AS.forEach(function (a) {
            var r = sellAll(a[0]);
            if (r) tot += r.proceeds;
          });
          if (Math.random() < 0.5) {
            hp(4);
            return (
              "You cashed out $" +
              Math.round(tot) +
              ". The crash did hit, nice call."
            );
          }
          hp(-3);
          return (
            "You cashed out $" + Math.round(tot) + ". The crash never came."
          );
        },
      ],
      [
        "Hold tight",
        function () {
          if (Math.random() < 0.5) {
            AS.forEach(function (a) {
              setPx(a[0], rand(0.75, 0.9));
            });
            hp(-6);
            return "The crash hit. Your portfolio took a beating.";
          }
          hp(3);
          return "It was just noise. Your stocks are fine.";
        },
      ],
    ],
  },

  // ---------- later life ----------
  {
    t: "Your coworkers throw you a retirement party.",
    ok: function () {
      return S.age >= 58;
    },
    c: [
      [
        "Give a speech",
        function () {
          S.cha++;
          hp(10);
          return "Not a dry eye in the room. (+1 CHA)";
        },
      ],
      [
        "Just eat the cake",
        function () {
          hp(6);
          return "The cake was excellent.";
        },
      ],
    ],
  },
  {
    t: "Your doctor says you need to move more.",
    ok: function () {
      return S.age >= 45;
    },
    c: [
      [
        "Start taking daily walks",
        function () {
          heal(4);
          hp(4);
          return "You feel better already. (+4 HP)";
        },
      ],
      [
        "Ignore the advice",
        function () {
          hurt(3);
          hp(-2);
          return "Your back is not thanking you. (−3 HP)";
        },
      ],
    ],
  },
  {
    t: "Your grandkids come to visit for the weekend.",
    ok: function () {
      return S.age >= 55;
    },
    c: [
      [
        "Spoil them rotten ($40)",
        function () {
          if (S.cash < 40) return cant();
          S.cash -= 40;
          S.k += 3;
          hp(12);
          return "Their hugs were worth every cent. (+3 karma)";
        },
      ],
      [
        "Tell them stories",
        function () {
          hp(8);
          S.cha++;
          return "They hung on every word. (+1 CHA)";
        },
      ],
    ],
  },
);

function die() {
  if (S.life && S.life.created && typeof lifeDeath === "function")
    return lifeDeath("unexpected circumstances");
  phn.hidden = true;
  addLog("Died.");
  try {
    localStorage.removeItem(KEY);
  } catch (error) {
    console.error("Could not clear the current save after death:", error);
  }
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
        Math.round(typeof netWorth === "function" ? netWorth() : S.cash + S.bank) +
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
function birthday(options) {
  phn.hidden = true;
  S.age++;
  if (S.life && S.life.created && typeof lifeOnBirthday === "function")
    return lifeOnBirthday(options || {});
  if (S.age >= 60 && Math.random() < (S.age - 58) * 0.04) return die();
  if (S.hap < 20) S.en = Math.max(0, S.en - 5);
  showRandomEvent("🎂 Happy birthday! Age " + S.age);
}
