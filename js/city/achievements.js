function cityAchievements() {
  cityScreen(
    "🏆 Achievement Collection",
    "Earn unique badges and claim cash rewards. " +
      ACHIEVEMENTS.filter(function (m) {
        return S.achievementClaims[m[0]];
      }).length +
      "/" +
      ACHIEVEMENTS.length +
      " unlocked",
    function (d) {
      ACHIEVEMENTS.forEach(function (m) {
        var claimed = !!S.achievementClaims[m[0]],
          ready = m[4]();
        var b = mbtn(
          d,
          claimed ? "🏆" : ready ? "🎁" : "🔒",
          m[1] +
            " — " +
            m[2] +
            " · " +
            (claimed ? "Unlocked" : "Reward " + fmtCash(m[3])),
          function () {
            claimAchievement(m);
          },
        );
        b.disabled = claimed || !ready;
      });
    },
  );
}
function cityWeather(cx, cy) {
  if (S.weather === "Sunny" && seasonName() === "Summer") return;
  g.save();
  if (S.weather === "Cloudy") {
    g.fillStyle = "rgba(65,75,105,.1)";
    g.fillRect(0, 0, VW, VH);
  }
  if (S.weather === "Fog") {
    g.fillStyle = "rgba(220,230,239,.26)";
    g.fillRect(0, 0, VW, VH);
  }
  if (S.weather === "Rain" || S.weather === "Storm") {
    g.fillStyle =
      "rgba(33,63,110," + (S.weather === "Storm" ? 0.19 : 0.09) + ")";
    g.fillRect(0, 0, VW, VH);
    g.strokeStyle = "rgba(160,207,255,.65)";
    g.lineWidth = 1.5;
    for (var i = 0; i < (S.weather === "Storm" ? 150 : 85); i++) {
      var x = (i * 137 + tick * 7) % VW,
        y = (i * 73 + tick * 13) % VH;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x - 6, y + 18);
      g.stroke();
    }
    if (S.weather === "Storm" && tick % 360 < 3) {
      g.fillStyle = "rgba(255,255,255,.35)";
      g.fillRect(0, 0, VW, VH);
    }
  }
  var season = seasonName();
  if (season === "Winter") {
    g.fillStyle = "rgba(232,241,255,.09)";
    g.fillRect(0, 0, VW, VH);
    g.fillStyle = "#f7fbff";
    for (var j = 0; j < 45; j++) {
      var sx = (j * 107 + tick * 0.15) % VW,
        sy = (j * 59 + tick * 0.4) % VH;
      g.beginPath();
      g.arc(sx, sy, 2.2, 0, 7);
      g.fill();
    }
  } else if (season === "Autumn") {
    g.fillStyle = "rgba(216,116,35,.05)";
    g.fillRect(0, 0, VW, VH);
    for (var j = 0; j < 20; j++) {
      g.fillStyle = j % 2 ? "#d89a27" : "#b56b29";
      g.fillRect(
        (j * 91 + tick * 0.3) % VW,
        (j * 53 + tick * 0.5) % VH,
        5,
        3,
      );
    }
  } else if (season === "Spring") {
    g.fillStyle = "rgba(247,153,190,.10)";
    g.fillRect(0, 0, VW, VH);
  }
  g.restore();
}
