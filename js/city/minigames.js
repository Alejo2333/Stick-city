function cityGames() {
  cityScreen(
    "🎲 City Minigames",
    "Short skill-based challenges with rewards; each attempt costs 1 game hour.",
    function (d) {
      mbtn(d, "🔢", "Number challenge: guess from 1 to 5", cityGuess);
      mbtn(d, "✊", "Rock, paper, scissors (win $25)", cityRps);
    },
  );
}
function cityGuess() {
  cityScreen(
    "🔢 Number Challenge",
    "Pick a number from 1 to 5. Guess right for $55 and +1 INT.",
    function (d) {
      [1, 2, 3, 4, 5].forEach(function (guess) {
        mbtn(d, "🔢", "Pick " + guess, function () {
          var correct = 1 + Math.floor(Math.random() * 5);
          adv(1);
          if (guess === correct) {
            S.cash += 55;
            S.lifetimeEarned += 55;
            S.int++;
            cityNotice("Correct! " + correct + " · +$55 and +1 INT");
          } else
            cityNotice(
              "The answer was " + correct + ". Better luck next time!",
            );
          cityGuess();
        });
      });
    },
    cityGames,
  );
}
function cityRps() {
  cityScreen(
    "✊ Rock, Paper, Scissors",
    "Beat the house to win $25.",
    function (d) {
      [
        ["rock", "✊"],
        ["paper", "✋"],
        ["scissors", "✌️"],
      ].forEach(function (o) {
        var pick = o[0];
        mbtn(
          d,
          o[1],
          pick[0].toUpperCase() + pick.slice(1),
          function () {
            var bot = ["rock", "paper", "scissors"][
              Math.floor(Math.random() * 3)
            ];
            adv(1);
            var win =
              (pick === "rock" && bot === "scissors") ||
              (pick === "paper" && bot === "rock") ||
              (pick === "scissors" && bot === "paper");
            if (win) {
              S.cash += 25;
              S.lifetimeEarned += 25;
              cityNotice("You won! Opponent chose " + bot + ". +$25");
            } else
              cityNotice(
                (pick === bot ? "Tie. " : "You lost. ") +
                  "Opponent chose " +
                  bot +
                  ".",
              );
            cityRps();
          },
        );
      });
    },
    cityGames,
  );
}
