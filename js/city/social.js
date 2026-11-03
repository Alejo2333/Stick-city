function cityStory() {
  cityScreen(
    "📖 Story Missions",
    "Complete chapters in order to unlock your life story.",
    function (d) {
      STORY.forEach(function (m, i) {
        var prior = i === 0 || !!S.storyClaims[STORY[i - 1][0]],
          claimed = !!S.storyClaims[m[0]],
          ready = prior && m[4]();
        var b = mbtn(
          d,
          claimed ? "✅" : ready ? "🎁" : "🔒",
          m[1] +
            " — " +
            m[2] +
            " · " +
            fmtCash(m[3]) +
            (claimed ? " · Completed" : ""),
          function () {
            if (!ready || claimed) return;
            S.storyClaims[m[0]] = 1;
            var reward =
              m[3] +
              (S.career === "Entrepreneur"
                ? Math.round(m[3] * 0.1)
                : 0);
            S.cash += reward;
            S.lifetimeEarned += reward;
            cityNotice(
              "Story completed: " + m[1] + "! +" + fmtCash(reward),
            );
            cityStory();
          },
        );
        b.disabled = claimed || !ready;
      });
    },
  );
}
function cityLayout() {
  cityScreen(
    "🪴 Decorate Home",
    "Pick a layout for each furniture item. See changes inside your home.",
    function (d) {
      FURN.forEach(function (f) {
        var k = f[0];
        if (!S.furniture[k]) return;
        var slot = furnSlot(k);
        mbtn(
          d,
          f[1],
          k + " · location " + (slot + 1) + " / 10 — move",
          function () {
            S.decorSlots[k] = (slot + 1) % 10;
            save();
            cityLayout();
          },
        );
      });
      mbtn(
        d,
        "🎨",
        "Interior: " + S.houseStyle + " — change wallpaper",
        function () {
          var a = ["Classic", "Ocean", "Sunset", "Forest", "Midnight"],
            i = a.indexOf(S.houseStyle);
          S.houseStyle = a[(i + 1) % a.length];
          save();
          cityLayout();
        },
      );
    },
  );
}
function cityInvite() {
  cityScreen(
    "💌 Invite Friends",
    "Invite residents who know you to spend time at your home.",
    function (d) {
      var names = NP.filter(function (n) {
        return n.name && !n.cop && !n.amb;
      });
      names.forEach(function (n) {
        var a = lvl(n.name),
          b = mbtn(
            d,
            "👋",
            n.name +
              " · affection " +
              a +
              (a < 3 ? " · needs 3" : " · invite"),
            function () {
              if (a < 3) return;
              S.invites++;
              S.invitedGuest = n.name;
              S.guestDay = S.day;
              S.lv[n.name] = a + 2;
              S.hap = Math.min(100, S.hap + 6);
              adv(2);
              cityNotice(
                n.name +
                  " visited your " +
                  S.activeHome +
                  "! +2 friendship and +6 happiness.",
              );
              cityInvite();
            },
          );
        b.disabled = a < 3;
      });
    },
  );
}
function cityShops() {
  cityScreen(
    "🛍️ Local Shopping",
    "Browse shops here; visit their buildings to buy or use a service.",
    function (d) {
      [
        "Clothing Boutique",
        "Supermarket",
        "Furniture Gallery",
        "Real Estate Office",
        "Motor Garage",
      ].forEach(function (k) {
        mbtn(d, "📍", "Visit " + k, function () {
          var b = B.filter(function (x) {
            return x.n === k;
          })[0];
          if (!b) return;
          S.in = null;
          ov.hidden = true;
          document.body.classList.remove("in");
          S.x = b.dx;
          S.y = b.dy + 85;
          closeMenu();
          phn.hidden = true;
          cityNotice(
            "Travelled to " + k + ". Walk toward the entrance.",
          );
        });
      });
    },
  );
}
function cityStore(name) {
  cityScreen(
    "🛍️ " + name,
    "Buy directly from this shop. Everything you own is saved.",
    function (d) {
      (SHOP_ITEMS[name] || []).forEach(function (a) {
        var owned =
          name === "Clothing Boutique"
            ? !!(S.outfitsOwned || {})[a[2]]
            : name === "Furniture Gallery"
              ? !!S.furniture[a[2]]
              : false;
        var b = mbtn(
          d,
          "🛍️",
          a[0] + " — " + (owned ? "Owned" : fmtCash(a[1])),
          function () {
            if (owned || !citySpend(a[1])) return;
            if (name === "Clothing Boutique") {
              S.outfitsOwned = S.outfitsOwned || {};
              S.outfitsOwned[a[2]] = 1;
              S.outfit = a[2];
            }
            if (name === "Furniture Gallery") S.furniture[a[2]] = 1;
            if (name === "Supermarket") {
              var healing = { fruit: 5, meal: 12, groceries: 25 }[a[2]];
              S.en = Math.min(MAXE, S.en + healing);
              S.hap = Math.min(100, S.hap + 2);
            }
            S.storePurchases[name] = (S.storePurchases[name] || 0) + 1;
            cityNotice("Purchased " + a[0] + ".");
            cityStore(name);
          },
        );
        b.disabled = owned;
      });
    },
  );
}
function cityElection() {
  cityScreen(
    "🏛️ Mayor Election",
    "Campaign at the Office (City Hall). Eligibility: 20 karma · CHA 25 · 5 friends met · $500 campaign fee.",
    function (d) {
      var eligible =
        S.k >= 20 && S.cha >= 25 && S.talksDone >= 5 && S.cash >= 500;
      var b = mbtn(
        d,
        "🗳️",
        S.mayor ? "You are the Mayor!" : "Campaign for Mayor — $500",
        function () {
          if (S.mayor || !eligible) return;
          S.cash -= 500;
          S.lifetimeSpent += 500;
          S.mayor = 1;
          S.k += 10;
          S.hap = Math.min(100, S.hap + 20);
          cityNotice("You won the election! Mayor of Stick City!");
          cityElection();
        },
      );
      b.disabled = !eligible || !!S.mayor;
    },
  );
}
function citySeasonalEvent() {
  var festival = S.day % 7 === 0,
    nm = seasonName();
  cityScreen(
    "🎪 City Festival",
    festival
      ? "The " + nm + " community fair is in town!"
      : "City festival every seventh day. Next: Day " +
          (S.day + 7 - (S.day % 7)),
    function (d) {
      var b = mbtn(
        d,
        "🎡",
        "Attend festival — $15 (+4 karma, +8 happiness)",
        function () {
          if (!festival || S.festivals[S.day] || !citySpend(15)) return;
          S.festivals[S.day] = 1;
          S.festivalVisits++;
          S.k += 4;
          S.hap = Math.min(100, S.hap + 8);
          adv(2);
          cityNotice("You enjoyed the " + nm + " festival!");
          citySeasonalEvent();
        },
      );
      b.disabled = !festival || !!S.festivals[S.day];
    },
  );
}
function cityNeighborhood() {
  cityScreen(
    "👥 Neighbors",
    "Each resident has their own job, favorite hangout and home. Work 9–17, hang out before and after, home by 21. Their feelings persist.",
    function (d) {
      NP.filter(function (n) {
        return n.name && !n.cop && !n.amb;
      }).forEach(function (n) {
        var m = S.npcMemory[n.name] || {},
          status =
            S.t >= 21 || S.t < 7
              ? "home"
              : S.t >= 9 && S.t < 17
                ? "working at the " + n.work
                : "hanging out at the " + n.fun;
        mbtn(
          d,
          "👤",
          n.name +
            " · " +
            status +
            " · " +
            (m.last || "We haven't spoken") +
            " · friendship " +
            lvl(n.name),
          function () {
            cityHub();
          },
        );
      });
    },
  );
}
