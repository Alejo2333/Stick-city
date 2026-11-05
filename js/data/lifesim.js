// === STICK CITY: EXPANDED LIFE SIM ===
// LIFE SIM 2.2: persistent story campaigns, distinct achievements and shops.
var STORY = [
  [
    "newstart",
    "Chapter 1 · A fresh start",
    "Earn your first paycheck, visit 3 places, and meet 2 residents",
    120,
    function () {
      return (
        S.jobsDone >= 1 &&
        Object.keys(S.placesVisited).length >= 3 &&
        S.talksDone >= 2
      );
    },
  ],
  [
    "newhome",
    "Chapter 2 · Home sweet home",
    "Buy two decorations and invite a resident over",
    220,
    function () {
      return Object.keys(S.furniture).length >= 2 && S.invites >= 1;
    },
  ],
  [
    "roadtrip",
    "Chapter 3 · Wheels of fortune",
    "Own a vehicle and travel 1,500 distance units",
    300,
    function () {
      return (
        Object.keys(S.garage).length >= 1 && S.driveDistance >= 1500
      );
    },
  ],
  [
    "hustler",
    "Chapter 4 · Your own boss",
    "Own a business and collect $100 of business revenue",
    500,
    function () {
      return (
        Object.keys(S.businesses).length >= 1 &&
        S.lifetimeBusiness >= 100
      );
    },
  ],
  [
    "socialite",
    "Chapter 5 · Heart of the city",
    "Make a close friend (10 affection) and attend a festival",
    600,
    function () {
      return (
        Object.keys(S.lv).some(function (n) {
          return S.lv[n] >= 10;
        }) && S.festivalVisits >= 1
      );
    },
  ],
  [
    "estate",
    "Chapter 6 · Real estate empire",
    "Own an apartment, townhouse, and mansion",
    1400,
    function () {
      return !!S.owns.apartment && !!S.owns.townhouse && !!S.mansion;
    },
  ],
  [
    "mayor",
    "Chapter 7 · Become Mayor",
    "Reach 20 karma, 25 charisma, and campaign at the Office (City Hall)",
    2000,
    function () {
      return !!S.mayor;
    },
  ],
  [
    "billionaire",
    "Finale · From broke to billionaire",
    "Reach $1,000,000,000 total cash and bank",
    100000,
    function () {
      return S.cash + S.bank >= 1000000000;
    },
  ],
];
var ACHIEVEMENTS = [
  [
    "highroller",
    "High roller",
    "Win $10,000 on a single casino bet",
    500,
    function () {
      return (S.casino.best || 0) >= 10000;
    },
  ],
  [
    "neighbor",
    "Friendly face",
    "Chat with 10 locals",
    50,
    function () {
      return S.talksDone >= 10;
    },
  ],
  [
    "collector",
    "Collector",
    "Own 6 pieces of furniture",
    90,
    function () {
      return Object.keys(S.furniture).length >= 6;
    },
  ],
  [
    "style",
    "Fashion icon",
    "Buy three outfits",
    60,
    function () {
      return Object.keys(S.outfitsOwned || {}).length >= 3;
    },
  ],
  [
    "motorhead",
    "Motorhead",
    "Collect three vehicles",
    130,
    function () {
      return Object.keys(S.garage).length >= 3;
    },
  ],
  [
    "boss",
    "Tycoon",
    "Own five businesses",
    250,
    function () {
      return Object.keys(S.businesses).length >= 5;
    },
  ],
  [
    "tourist",
    "Tourist",
    "Visit 15 locations",
    100,
    function () {
      return Object.keys(S.placesVisited).length >= 15;
    },
  ],
  [
    "wealthy",
    "Six figures",
    "Accumulate $100,000",
    250,
    function () {
      return S.moneyPeak >= 100000;
    },
  ],
  [
    "friendship",
    "Best friends",
    "Reach affection 20 with a resident",
    100,
    function () {
      return Object.keys(S.lv).some(function (n) {
        return S.lv[n] >= 20;
      });
    },
  ],
  [
    "properties",
    "Own every home",
    "Own an apartment, townhouse and mansion",
    500,
    function () {
      return !!S.owns.apartment && !!S.owns.townhouse && !!S.mansion;
    },
  ],
  [
    "renter",
    "Landlord",
    "Collect $500 rent",
    110,
    function () {
      return S.lifetimeRent >= 500;
    },
  ],
  [
    "seasoned",
    "Four seasons",
    "Experience all four seasons",
    175,
    function () {
      return Object.keys(S.seasonsSeen).length >= 4;
    },
  ],
  [
    "leader",
    "Mayor",
    "Win the city's mayoral election",
    200,
    function () {
      return !!S.mayor;
    },
  ],
  [
    "legend",
    "Living legend",
    "Finish all story chapters",
    2500,
    function () {
      return STORY.every(function (q) {
        return !!S.storyClaims[q[0]];
      });
    },
  ],
];
// Life events. text sets the scene, and result says what happened and goes in
// the journal. outcomes are checked in order: chance improves with the named
// stat, and an outcome with no chance is the fallback. act runs custom changes.
var LIFE_EVENTS = [
  // ---- Baby ----
  { id: "first-steps", title: "A first big step", stage: "baby", once: true,
    text: "You pull yourself up on the couch. The whole room suddenly looks climbable.",
    choices: [
      { label: "Explore the room with a trusted grown-up", effect: { happiness: 8, flag: "exploredWithFamily" }, result: "You wobbled across the room to loud applause, then sat down, very proud." },
      { label: "Take a quiet nap", effect: { health: 6, happiness: 3 }, result: "You decided walking could wait and slept like a champion." },
    ] },
  { id: "first-words", title: "A first word", stage: "baby", once: true,
    text: "Everyone leans in. You seem to have something important to say.",
    choices: [
      { label: "Call for someone you love", effect: { happiness: 7, relationship: 2, flag: "firstWord" }, result: "You said your first word, and someone cried happy tears over it." },
      { label: "Try a funny new sound", effect: { charisma: 1, happiness: 5 }, result: "You made a noise nobody could spell. The room lost it laughing." },
    ] },
  { id: "baby-spoon", title: "The spoon incident", stage: "baby",
    text: "Dinner is mashed peas. You are holding the spoon, and nobody has noticed yet.",
    choices: [
      { label: "Fling the peas", effect: { happiness: 6, charisma: 1 }, result: "The peas reached the ceiling. Some of them are still up there." },
      { label: "Eat them politely", effect: { health: 4, happiness: 1 }, result: "You ate every pea, and your family wondered if you were feeling all right." },
    ] },
  { id: "baby-cat", title: "A furry visitor", stage: "baby",
    text: "A neighbor's cat strolls in and sits just out of reach.",
    choices: [
      { label: "Crawl after it", effect: { health: 2, happiness: 5 }, result: "You chased the cat around the rug for an hour. It let you win once." },
      { label: "Stare back", effect: { smarts: 1, happiness: 2 }, result: "You and the cat stared at each other for a long time. Neither of you blinked." },
    ] },
  { id: "baby-bath", title: "Bath time", stage: "baby",
    text: "There is a rubber duck in the water, and it looks suspicious.",
    choices: [
      { label: "Splash everything", effect: { happiness: 6 }, result: "You soaked the whole bathroom. The duck survived." },
      { label: "Inspect the duck", effect: { smarts: 1, happiness: 3 }, result: "You squeezed the duck, and it squeaked. This changed everything." },
    ] },
  { id: "baby-night", title: "Up all night", stage: "baby",
    text: "It is three in the morning and you are wide awake.",
    choices: [
      { label: "Sing about it", effect: { charisma: 1, relationship: -1 }, result: "You performed for three hours. Your family looked very tired at breakfast." },
      { label: "Go back to sleep", effect: { health: 3, relationship: 1 }, result: "You drifted off again, and the whole house thanked you silently." },
    ] },

  // ---- Child ----
  { id: "school-fair", title: "The school fair", stage: "child",
    text: "The gym is full of folding tables, and everyone is looking for helpers.",
    choices: [
      { label: "Enter the science display", effect: { smarts: 2, happiness: 4, flag: "scienceFair" }, result: "Your volcano erupted right on time, and on the principal's shoes." },
      { label: "Help run the games", effect: { charisma: 1, happiness: 6 }, result: "You ran the ring toss all afternoon and knew every kid's name by the end." },
    ] },
  { id: "lost-library-book", title: "A library book is overdue", stage: "child",
    text: "You find a library book under your bed. It was due a very long time ago.",
    choices: [
      { label: "Return it and apologize", effect: { karma: 2, smarts: 1, cash: -5 }, result: "You paid the fine, and the librarian gave you a slow, respectful nod." },
      { label: "Ask a family member for help", effect: { relationship: 2, happiness: 3 }, result: "You went to the library together, and you both left with new books." },
    ] },
  { id: "class-project", title: "A class project needs a leader", stage: "child",
    text: "Your group has a poster to make and no idea who is in charge.",
    choices: [
      { label: "Make a plan with the group", effect: { smarts: 2, charisma: 1, flag: "classProject" }, result: "You made a plan, and your group finished a whole day early." },
      { label: "Make sure everyone gets a turn", effect: { happiness: 4, relationship: 2 }, result: "The poster was messy, but everyone in your group loved it." },
    ] },
  { id: "child-spelling", title: "The spelling bee", stage: "child",
    text: "You reach the final round. Your word is 'mischievous'.",
    choices: [
      { label: "Spell it slowly", outcomes: [
        { chance: 0.5, stat: "smarts", effect: { smarts: 2, happiness: 8, flag: "spellingChamp" }, result: "You spelled it perfectly and won a very small trophy that you still love." },
        { effect: { happiness: -2, smarts: 1 }, result: "You added an extra letter. You will never misspell 'mischievous' again." } ] },
      { label: "Ask for it in a sentence", effect: { charisma: 1, happiness: 3 }, result: "You stalled so charmingly that the judges laughed, then you got it wrong anyway." },
    ] },
  { id: "child-lemonade", title: "A lemonade stand", stage: "child",
    text: "It is the hottest day of the year, and you have lemons and a folding table.",
    choices: [
      { label: "Charge a fair price", effect: { cash: 15, karma: 1, happiness: 4 }, result: "You sold out by noon and made $15." },
      { label: "Charge way too much", outcomes: [
        { chance: 0.35, stat: "charisma", effect: { cash: 40, charisma: 1 }, result: "Somehow people paid it. You made $40, and your family is a little worried." },
        { effect: { happiness: -2 }, result: "Nobody bought anything, so you drank all the lemonade yourself." } ] },
    ] },
  { id: "child-dodgeball", title: "Gym class dodgeball", stage: "child",
    text: "You are the last one left on your team. Everyone is chanting.",
    choices: [
      { label: "Go for the big throw", outcomes: [
        { chance: 0.45, stat: "strength", effect: { happiness: 10, charisma: 1 }, result: "You took out the last two players at once and became a legend until lunch." },
        { effect: { health: -2, happiness: -2 }, result: "The ball came back faster than it left. Your nose is fine, mostly." } ] },
      { label: "Dodge until the bell", effect: { health: 2, happiness: 3 }, result: "You dodged for six straight minutes, and the game ended in a tie." },
    ] },
  { id: "child-new-kid", title: "The new kid", stage: "child",
    text: "A new kid is eating lunch alone at the end of your table.",
    choices: [
      { label: "Slide over and say hi", effect: { karma: 3, charisma: 1, happiness: 4 }, result: "You shared your chips, and by Friday you had a new best friend." },
      { label: "Stay with your friends", effect: { happiness: 1, karma: -1 }, result: "You kept your seat. You kept glancing over, too." },
    ] },
  { id: "child-window", title: "The broken window", stage: "child",
    text: "Your ball just went through a neighbor's window. Nobody saw you.",
    choices: [
      { label: "Knock on the door and confess", effect: { karma: 4, cash: -10, relationship: 1 }, result: "You confessed and helped pay for the glass. The neighbor gave you your ball back, and a cookie." },
      { label: "Run for it", outcomes: [
        { chance: 0.5, effect: { happiness: 1, karma: -3 }, result: "You got away with it, but you avoided that street for a whole year." },
        { effect: { karma: -3, happiness: -5, cash: -10 }, result: "Your name was written on the ball. You paid for the window and got a long talk." } ] },
    ] },
  { id: "child-pet-beg", title: "Please, can we keep it?", stage: "child",
    text: "A scruffy dog has followed you all the way home from school.",
    choices: [
      { label: "Find its owner", effect: { karma: 3, happiness: 3 }, result: "You knocked on doors until you found its family, and they hugged you both." },
      { label: "Hide it in your room", outcomes: [
        { chance: 0.25, effect: { happiness: 8 }, result: "You kept it secret for one glorious week before its owner came to collect it." },
        { effect: { happiness: 2, relationship: -1 }, result: "The dog barked during dinner. Your secret lasted about an hour." } ] },
    ] },
  { id: "child-talent", title: "The talent show", stage: "child",
    text: "Sign-ups for the school talent show close today.",
    choices: [
      { label: "Sing in front of everyone", outcomes: [
        { chance: 0.45, stat: "charisma", effect: { charisma: 2, happiness: 8 }, result: "You hit every note, and a teacher actually stood up to clap." },
        { effect: { happiness: -3, charisma: 1 }, result: "Your voice cracked on the big note, but you finished, and that took nerve." } ] },
      { label: "Do magic tricks", effect: { smarts: 1, charisma: 1, happiness: 4 }, result: "You pulled a card from behind the principal's ear, and they demanded to know how." },
      { label: "Work the lights instead", effect: { smarts: 1, happiness: 2 }, result: "You ran the lights all night and made everyone else look great." },
    ] },
  { id: "child-camp", title: "Summer camp", stage: "child",
    text: "You are at summer camp, and the lake looks very cold.",
    choices: [
      { label: "Jump in first", effect: { health: 3, charisma: 1, happiness: 5 }, result: "You screamed the whole way down, and everyone followed you in." },
      { label: "Build the best campfire", effect: { smarts: 2, happiness: 4 }, result: "Your fire stayed lit all night, and the counselor asked you for tips." },
    ] },
  { id: "child-allowance", title: "Birthday money", stage: "child",
    text: "A relative slipped you $20 and told you not to spend it all at once.",
    choices: [
      { label: "Save it", effect: { cash: 20, smarts: 1 }, result: "You put the $20 in a jar and checked on it every day." },
      { label: "Spend it all at once", effect: { happiness: 8, health: -1 }, result: "You spent it on candy in one afternoon and regret only the last bag." },
    ] },
  { id: "child-loose-tooth", title: "The loose tooth", stage: "child",
    text: "Your front tooth is hanging by a thread, and a friend has a very bad plan.",
    choices: [
      { label: "Try the string and doorknob", effect: { happiness: 3, cash: 2 }, result: "It worked. You found $2 under your pillow, and your friend found a new hobby." },
      { label: "Let it fall out on its own", effect: { looks: 1, health: 1 }, result: "It fell out during a spelling test, which you counted as a win." },
    ] },

  // ---- Teen ----
  { id: "club-invitation", title: "A new club is looking for members", stage: "teen",
    text: "Two club leaders corner you at your locker with sign-up sheets.",
    choices: [
      { label: "Join the art club", effect: { looks: 1, charisma: 1, happiness: 5, flag: "creativeClub" }, result: "You got paint on everything you own and have never been happier." },
      { label: "Join the robotics club", effect: { smarts: 2, happiness: 3, flag: "roboticsClub" }, result: "Your robot drove straight into a wall, but it did so very accurately." },
    ] },
  { id: "first-paycheck", title: "Your first paycheck", stage: "teen", once: true,
    ok: function () { return S.age >= 16; },
    text: "You worked your first part-time shifts, and the money just landed.",
    choices: [
      { label: "Save most of it", effect: { cash: 80, smarts: 1, flag: "savedFirstPaycheck" }, result: "You banked most of it and felt like a very small tycoon." },
      { label: "Treat your family", effect: { cash: 40, relationship: 3, happiness: 5 }, result: "You took everyone out for burgers, and your parent kept the receipt as a souvenir." },
    ] },
  { id: "teen-volunteer", title: "The neighborhood center needs volunteers", stage: "teen",
    text: "A flyer on the school wall says the center is short on helpers.",
    choices: [
      { label: "Help organize a book drive", effect: { karma: 3, smarts: 1, happiness: 4 }, result: "You collected 400 books and read a few of the good ones first." },
      { label: "Help younger students with homework", effect: { smarts: 2, relationship: 2 }, result: "You explained fractions so well that you finally understood them yourself." },
    ] },
  { id: "teen-exam", title: "The big exam", stage: "teen",
    text: "Finals are tomorrow, and you have not opened the book.",
    choices: [
      { label: "Pull an all-nighter", outcomes: [
        { chance: 0.55, stat: "smarts", effect: { smarts: 3, health: -2, happiness: 3 }, result: "You passed on three hours of sleep and pure panic." },
        { effect: { health: -3, happiness: -4 }, result: "You fell asleep on question four and woke up to the bell." } ] },
      { label: "Sleep and hope", outcomes: [
        { chance: 0.35, stat: "smarts", effect: { health: 2, happiness: 4 }, result: "You felt rested, guessed well and somehow got a B." },
        { effect: { happiness: -3, health: 2 }, result: "You felt great right up until you read the first question." } ] },
      { label: "Peek at a friend's notes", effect: { karma: -3, smarts: 1, happiness: -1 }, result: "You scraped through, but the grade did not feel like yours." },
    ] },
  { id: "teen-driving", title: "Learning to drive", stage: "teen",
    ok: function () { return S.age >= 16; },
    text: "It is your driving test, and the examiner looks tired already.",
    choices: [
      { label: "Take it carefully", outcomes: [
        { chance: 0.65, stat: "smarts", effect: { happiness: 8, charisma: 1 }, result: "You passed on the first try and drove everyone home at exactly the speed limit." },
        { effect: { happiness: -3 }, result: "You failed the parallel parking. The cone will be fine." } ] },
      { label: "Show off a little", outcomes: [
        { chance: 0.2, stat: "charisma", effect: { happiness: 6, charisma: 2 }, result: "The examiner laughed and passed you anyway." },
        { effect: { happiness: -5, cash: -15 }, result: "You clipped a mailbox, failed the test and paid for the mailbox." } ] },
    ] },
  { id: "teen-band", title: "Starting a band", stage: "teen",
    text: "Two friends want to start a band. None of you can play anything yet.",
    choices: [
      { label: "Start the band", effect: { charisma: 2, happiness: 6, flag: "startedBand" }, result: "You played one show in a garage to four people. It was the best night of your life." },
      { label: "Be their manager", effect: { smarts: 1, charisma: 1, cash: 5 }, result: "You booked them a gig at a pizza place and took your cut in slices." },
    ] },
  { id: "teen-rumor", title: "The rumor", stage: "teen",
    text: "A nasty rumor about a classmate lands in your group chat.",
    choices: [
      { label: "Shut it down", effect: { karma: 3, charisma: 1, happiness: 1 }, result: "You told everyone to knock it off, and the chat went quiet in a good way." },
      { label: "Pass it along", effect: { karma: -4, happiness: 1 }, result: "It spread fast, and it never felt as funny as you expected." },
      { label: "Check on your classmate", effect: { karma: 4, relationship: 1, happiness: 3 }, result: "You sat with them at lunch. They still talk about it years later." },
    ] },
  { id: "teen-summer-job", title: "Summer job", stage: "teen",
    ok: function () { return S.age >= 15; },
    text: "The arcade and the ice cream shop are both hiring for the summer.",
    choices: [
      { label: "Work at the arcade", effect: { cash: 60, smarts: 1, happiness: 3 }, result: "You earned $60 and learned exactly how the claw machine cheats." },
      { label: "Scoop ice cream", effect: { cash: 50, charisma: 1, health: 1 }, result: "You earned $50 and an arm like a professional tennis player." },
      { label: "Enjoy the summer", effect: { happiness: 8 }, result: "You earned nothing, and you regret none of it." },
    ] },
  { id: "teen-sport-tryout", title: "Team tryouts", stage: "teen",
    text: "The school team is holding tryouts, and you have been practicing in secret.",
    choices: [
      { label: "Give it everything", outcomes: [
        { chance: 0.5, stat: "strength", effect: { health: 5, charisma: 1, happiness: 6, flag: "madeTheTeam" }, result: "You made the team and got a jersey you never want to wash." },
        { effect: { health: 2, happiness: -3 }, result: "You did not make the cut, but the coach told you to come back next year." } ] },
      { label: "Sign up as team manager", effect: { smarts: 1, happiness: 3 }, result: "You kept the stats and quickly became the only one who knew the rules." },
    ] },
  { id: "teen-haircut", title: "A bold new look", stage: "teen",
    text: "You have a friend, a pair of scissors and a very strong idea.",
    choices: [
      { label: "Let your friend do it", outcomes: [
        { chance: 0.4, stat: "looks", effect: { looks: 4, happiness: 5 }, result: "Somehow it looks amazing, and three people asked who did it." },
        { effect: { looks: -3, happiness: -3 }, result: "You wore a hat for six weeks." } ] },
      { label: "Go to a real salon", effect: { looks: 3, cash: -20, happiness: 2 }, result: "It cost $20 and looked exactly like the picture." },
    ] },
  { id: "teen-debate", title: "The debate team", stage: "teen",
    text: "Your teacher thinks you should join the debate team, and you disagree.",
    choices: [
      { label: "Argue that you shouldn't join", effect: { charisma: 2, smarts: 1, happiness: 3 }, result: "You argued so well that they signed you up on the spot." },
      { label: "Politely decline", effect: { happiness: 1 }, result: "You said no thanks, and you won't ever know." },
    ] },
  { id: "teen-sneak-out", title: "The midnight concert", stage: "teen",
    text: "Your favorite band is playing tonight, and your curfew is ten.",
    choices: [
      { label: "Sneak out", outcomes: [
        { chance: 0.5, effect: { happiness: 10, karma: -1 }, result: "Best show of your life, and you were back in bed before anyone woke up." },
        { effect: { happiness: -4, relationship: -3 }, result: "A family member was waiting on the couch when you got home, and you were grounded for a month." } ] },
      { label: "Ask for permission", outcomes: [
        { chance: 0.5, stat: "karma", effect: { happiness: 8, relationship: 2 }, result: "They said yes, and you got to go without climbing out a window." },
        { effect: { happiness: -2, relationship: 1 }, result: "They said no, but you got credit for asking." } ] },
    ] },
  { id: "teen-scholarship", title: "A scholarship essay", stage: "teen",
    ok: function () { return S.age >= 16 && S.int >= 30; },
    text: "A city scholarship is open to students who can write about their future.",
    choices: [
      { label: "Spend weeks on it", outcomes: [
        { chance: 0.4, stat: "smarts", effect: { cash: 300, smarts: 2, happiness: 8, flag: "scholarship" }, result: "You won $300 and a handshake from a very sweaty city councilor." },
        { effect: { smarts: 1, happiness: -1 }, result: "You did not win, but the essay taught you what you actually want." } ] },
      { label: "Skip it", effect: { happiness: 2 }, result: "You spent those weeks outside instead." },
    ] },
  { id: "teen-phone", title: "Too much screen time", stage: "teen",
    text: "Your phone says you spent nine hours on it yesterday.",
    choices: [
      { label: "Delete a few apps", effect: { health: 3, smarts: 1, happiness: 2 }, result: "You deleted three apps, went outside and found out it was still there." },
      { label: "Blame the phone", effect: { happiness: 1, health: -1 }, result: "You decided the phone must be broken and got back to scrolling." },
    ] },
  { id: "teen-money-lost", title: "A wallet on the bus", stage: "teen",
    text: "There is a wallet on the bus seat next to you, with $40 and an ID inside.",
    choices: [
      { label: "Return it", effect: { karma: 4, happiness: 3, cash: 5 }, result: "The owner cried a little and insisted you take $5." },
      { label: "Keep the cash", effect: { cash: 40, karma: -5, happiness: -1 }, result: "You kept the $40. It spent just fine, but it did not feel great." },
    ] },
  { id: "teen-graduation-speech", title: "Graduation speech", stage: "teen", once: true,
    ok: function () { return S.age === 17; },
    text: "You've been asked to say a few words at graduation.",
    choices: [
      { label: "Give a heartfelt speech", outcomes: [
        { chance: 0.5, stat: "charisma", effect: { charisma: 2, happiness: 8 }, result: "There was not a dry eye in the gym, including yours." },
        { effect: { happiness: -2, charisma: 1 }, result: "Your microphone squealed through the best part, but they clapped anyway." } ] },
      { label: "Tell jokes", effect: { charisma: 1, happiness: 5 }, result: "You roasted every teacher gently, and the math teacher laughed hardest." },
    ] },

  // ---- Adult ----
  { id: "career-pivot", title: "A surprising opportunity", stage: "adult", once: true,
    text: "An old acquaintance mentions a line of work you'd never considered.",
    choices: [
      { label: "Take a course", effect: { smarts: 2, cash: -40, flag: "careerCourse" }, result: "You paid $40 for an evening course and came home with new ideas." },
      { label: "Ask a mentor for advice", effect: { charisma: 1, relationship: 2 }, result: "Your mentor bought you coffee and told you what they wish they'd known." },
    ] },
  { id: "community-award", title: "The neighborhood recognizes your help", stage: "adult",
    ok: function () { return S.k >= 10; },
    text: "Your neighbors are giving you a small award and a $50 prize.",
    choices: [
      { label: "Accept and thank everyone", effect: { happiness: 8, charisma: 1, karma: 2 }, result: "You gave a short speech and meant every word of it." },
      { label: "Give the prize to the community fund", effect: { karma: 5, happiness: 4, cash: 50 }, result: "You gave the prize away, and the fund matched it with a $50 thank-you." },
    ] },
  { id: "first-apartment", title: "A chance to move into your own place", stage: "adult",
    ok: function () { return S.age >= 18 && !S.owns.apartment && S.cash >= 200; },
    text: "A friend tells you about an apartment that is coming up for sale.",
    choices: [
      { label: "Save toward an apartment", effect: { smarts: 1, cash: 20, flag: "savingForHome" }, result: "You started a house fund with $20 and a very firm budget." },
      { label: "Stay flexible and explore the city", effect: { happiness: 5, charisma: 1 }, result: "You kept your options open and found a great new taco place." },
    ] },
  { id: "health-check", title: "A routine check-in", stage: "adult",
    ok: function () { return S.age >= 18 && S.life.health < 55; },
    text: "You've been feeling run down, and your doctor wants to see you.",
    choices: [
      { label: "Make a gentle wellness plan", effect: { health: 12, happiness: 2, cash: -20 }, result: "You paid $20 for a checkup, followed the plan and started feeling better." },
      { label: "Ask a trusted person to support you", effect: { relationship: 3, happiness: 4 }, result: "Someone close to you started walking with you every morning." },
    ] },
  { id: "adult-promotion-rival", title: "Up for promotion", stage: "adult",
    ok: function () { return !!S.life.job && !S.life.retired; },
    text: "You and a coworker are both up for the same promotion. Your boss asks about them.",
    choices: [
      { label: "Speak well of them", effect: { karma: 3, charisma: 1, happiness: 2 }, result: "You praised your rival honestly, and your boss remembered it." },
      { label: "Quietly point out their mistakes", outcomes: [
        { chance: 0.5, stat: "charisma", effect: { cash: 200, karma: -4 }, result: "Your boss gave you a $200 bonus. Your coworker stopped saying good morning." },
        { effect: { karma: -5, happiness: -4 }, result: "Your boss saw right through it, and now everyone in the office knows." } ] },
    ] },
  { id: "adult-office-party", title: "The office party", stage: "adult",
    ok: function () { return !!S.life.job && !S.life.retired; },
    text: "The office party has karaoke, and your boss just handed you the microphone.",
    choices: [
      { label: "Sing with total commitment", outcomes: [
        { chance: 0.5, stat: "charisma", effect: { charisma: 2, happiness: 7 }, result: "You brought the house down, and people now greet you with your song." },
        { effect: { happiness: -2, charisma: 1 }, result: "It was terrible. Someone filmed it, and the clip will outlive you." } ] },
      { label: "Pass it to a coworker", effect: { happiness: 2 }, result: "You passed it on and enjoyed watching someone else suffer." },
    ] },
  { id: "adult-burnout", title: "Running on empty", stage: "adult",
    ok: function () { return !!S.life.job && !S.life.retired && S.hap < 50; },
    text: "You've been staring at the same email for an hour.",
    choices: [
      { label: "Take a real day off", effect: { happiness: 8, health: 3 }, result: "You turned off your phone for a day, and the company somehow survived." },
      { label: "Push through", effect: { cash: 60, health: -4, happiness: -3 }, result: "You worked the extra shifts and made $60, but you felt every hour." },
    ] },
  { id: "adult-friend-loan", title: "A friend needs money", stage: "adult",
    ok: function () { return S.cash >= 100; },
    text: "An old friend asks to borrow $100 and swears they will pay it back.",
    choices: [
      { label: "Lend it", outcomes: [
        { chance: 0.5, effect: { karma: 2, happiness: 4, cash: 20 }, result: "They paid you back with $20 extra and a very long hug." },
        { effect: { karma: 3, cash: -100, happiness: -2 }, result: "You lost the $100, and you stopped hearing from them." } ] },
      { label: "Say no kindly", effect: { relationship: -1 }, result: "You said no. It was awkward for a while, then it was fine." },
    ] },
  { id: "adult-scam-call", title: "You've won a prize!", stage: "adult",
    text: "A very excited voice says you won a cruise. They just need a $200 processing fee.",
    choices: [
      { label: "Hang up", effect: { smarts: 1, happiness: 1 }, result: "You hung up, and they called back twice." },
      { label: "Pay the fee", effect: { cash: -200, happiness: -5, smarts: 1 }, result: "There was no cruise. You are $200 poorer and much harder to fool." },
    ] },
  { id: "adult-car-breakdown", title: "Car trouble", stage: "adult",
    ok: function () { return Object.keys(S.garage || {}).length > 0; },
    text: "Your vehicle makes a noise you've never heard before, then stops.",
    choices: [
      { label: "Pay a mechanic", effect: { cash: -150, happiness: -1 }, result: "It cost $150 and took one afternoon." },
      { label: "Fix it yourself", outcomes: [
        { chance: 0.4, stat: "smarts", effect: { smarts: 2, happiness: 6 }, result: "You fixed it with a video and a wrench, and you've told everyone." },
        { effect: { cash: -300, happiness: -4 }, result: "You made it worse. The mechanic charged $300 and asked what you were thinking." } ] },
    ] },
  { id: "adult-neighbor-noise", title: "The neighbor's drums", stage: "adult",
    text: "Your neighbor has taken up the drums, and they practice at midnight.",
    choices: [
      { label: "Talk to them nicely", outcomes: [
        { chance: 0.6, stat: "charisma", effect: { happiness: 4, charisma: 1 }, result: "They apologized, and now you get free tickets to every terrible show." },
        { effect: { happiness: -3 }, result: "They offered you lessons instead of stopping." } ] },
      { label: "Bang on the wall", effect: { happiness: -1, karma: -1 }, result: "They thought you were joining in, and the song got longer." },
    ] },
  { id: "adult-found-money", title: "An envelope of cash", stage: "adult",
    text: "You find an envelope with $500 on a park bench. There is no name on it.",
    choices: [
      { label: "Hand it in", outcomes: [
        { chance: 0.5, effect: { karma: 6, cash: 100, happiness: 4 }, result: "Nobody claimed it except a grateful senior, who gave you $100 as a reward." },
        { effect: { karma: 6, happiness: 3 }, result: "You handed it in and got a nice note from the police station." } ] },
      { label: "Keep it", effect: { cash: 500, karma: -6, happiness: 1 }, result: "You kept the $500 and looked over your shoulder for a month." },
    ] },
  { id: "adult-gym-pledge", title: "This year will be different", stage: "adult",
    text: "It is January, and everyone at work has made big promises about the gym.",
    choices: [
      { label: "Actually go", effect: { health: 6, looks: 1, cash: -30 }, result: "You paid $30 and kept going, which surprised everyone, especially you." },
      { label: "Buy the outfit instead", effect: { looks: 1, cash: -50, happiness: 2 }, result: "You spent $50 on gym clothes that have never seen a gym." },
    ] },
  { id: "adult-parent-call", title: "A call from home", stage: "adult",
    ok: function () {
      return S.life.people.some(function (p) { return p.alive && p.role === "parent"; });
    },
    text: "Your parent calls just to talk. You are in the middle of something.",
    choices: [
      { label: "Stop and talk", effect: { relationship: 4, happiness: 4 }, result: "You talked for an hour about nothing, and you were glad you did." },
      { label: "Say you'll call back", effect: { relationship: -2 }, result: "You meant to call back. It took three weeks." },
    ] },
  { id: "adult-partner-anniversary", title: "An important date", stage: "adult",
    ok: function () { return !!S.partner; },
    text: "It hits you at lunch: today is your anniversary with {partner}.",
    choices: [
      { label: "Plan something big", effect: { cash: -120, relationship: 4, happiness: 7 }, result: "You spent $120 pulling off a surprise dinner, and {partner} teared up." },
      { label: "Admit you forgot", outcomes: [
        { chance: 0.5, stat: "charisma", effect: { happiness: 3, relationship: 2 }, result: "You told the truth, and {partner} laughed. They had forgotten too." },
        { effect: { happiness: -5, relationship: -2 }, result: "You told the truth. {partner} did not laugh." } ] },
    ] },
  { id: "adult-partner-move", title: "A big question", stage: "adult",
    ok: function () { return !!S.partner; },
    text: "{partner} got a job offer in another part of the city and wants to talk about it.",
    choices: [
      { label: "Support them completely", effect: { karma: 3, happiness: 3, relationship: 3 }, result: "You packed the boxes yourself, and {partner} has not forgotten." },
      { label: "Ask them to stay", outcomes: [
        { chance: 0.5, stat: "charisma", effect: { happiness: 4 }, result: "They stayed, and you both ended up glad they did." },
        { effect: { happiness: -5, relationship: -2 }, result: "They stayed, but it came up in every argument for a year." } ] },
    ] },
  { id: "adult-kid-school", title: "A note from school", stage: "adult",
    ok: function () { return S.life.children.length > 0; },
    text: "Your kid's teacher sent home a note. It starts with 'We need to talk about the frog.'",
    choices: [
      { label: "Hear your kid out", effect: { relationship: 3, happiness: 4 }, result: "The frog was being rescued, it turns out. You are quietly proud." },
      { label: "Ground them", effect: { happiness: -2, relationship: -1 }, result: "You grounded them. The frog is still at large." },
    ] },
  { id: "adult-kid-recital", title: "The recital", stage: "adult",
    ok: function () { return S.life.children.length > 0; },
    text: "Your kid's recital is tonight, the same time as an important work thing.",
    choices: [
      { label: "Go to the recital", effect: { happiness: 7, relationship: 4, cash: -30 }, result: "You missed the work thing and lost $30, but they spotted you in the crowd and waved." },
      { label: "Go to the work thing", effect: { cash: 100, happiness: -5, relationship: -3 }, result: "You earned $100, then watched the recital later on someone else's phone." },
    ] },
  { id: "adult-debt-letter", title: "A letter about your debt", stage: "adult",
    ok: function () { return S.life.debt > 500; },
    text: "The credit union sent another letter, and this one is printed in red.",
    choices: [
      { label: "Make a budget", effect: { smarts: 2, happiness: -1 }, result: "You sat down with every bill and finally made a real plan." },
      { label: "Put it in the drawer", effect: { happiness: 1, health: -2 }, result: "The drawer is getting hard to close." },
    ] },
  { id: "adult-stock-tip", title: "A hot stock tip", stage: "adult",
    ok: function () { return S.cash >= 300; },
    text: "A guy at the cafe swears he knows exactly what is about to go up.",
    choices: [
      { label: "Put in $300", outcomes: [
        { chance: 0.3, effect: { cash: 450, happiness: 6 }, result: "It actually worked. You made $450, and now you think you're a genius." },
        { effect: { cash: -300, happiness: -4, smarts: 1 }, result: "The stock dropped to nothing, and the guy has stopped coming to the cafe." } ] },
      { label: "Finish your coffee", effect: { smarts: 1 }, result: "You finished your coffee and kept your money." },
    ] },
  { id: "adult-market-worry", title: "Your portfolio is on the news", stage: "adult",
    ok: function () { return invested() > 500; },
    text: "The news keeps saying 'volatility', and you keep checking your investments.",
    choices: [
      { label: "Stop checking for a while", effect: { happiness: 4, health: 2 }, result: "You put the phone down and went for a walk. The market carried on without you." },
      { label: "Read every headline", effect: { smarts: 1, happiness: -3 }, result: "You read everything, understood some of it and slept badly." },
    ] },
  { id: "adult-viral", title: "You've gone viral", stage: "adult",
    ok: function () { return crTotal() >= 100; },
    text: "A clip of yours has taken off, and strangers keep quoting it to you.",
    choices: [
      { label: "Lean into it", effect: { charisma: 2, cash: 150, happiness: 5 }, result: "You sold $150 of T-shirts with your own face on them." },
      { label: "Take a break from posting", effect: { health: 3, happiness: 4 }, result: "You logged off for a month, and your followers somehow waited." },
    ] },
  { id: "adult-home-repair", title: "Water on the floor", stage: "adult",
    ok: function () { return !!(S.owns.apartment || S.owns.townhouse || S.mansion); },
    text: "There is water on the floor, and it's coming from somewhere inside the wall.",
    choices: [
      { label: "Call a plumber", effect: { cash: -180 }, result: "A plumber fixed it for $180 and told you who did the last repair badly." },
      { label: "Try to fix it yourself", outcomes: [
        { chance: 0.35, stat: "smarts", effect: { smarts: 1, happiness: 6 }, result: "You fixed it with tape and confidence, and it is holding so far." },
        { effect: { cash: -400, happiness: -5 }, result: "You now have a much bigger leak and a $400 bill." } ] },
    ] },
  { id: "adult-boat-trouble", title: "Trouble at the marina", stage: "adult",
    ok: function () { return lifeOwnsAny(["sailboat", "speedboat", "yacht"]); },
    text: "The marina called. Your boat's engine has made a decision, and it isn't good.",
    choices: [
      { label: "Pay for proper repairs", effect: { cash: -600, happiness: -1 }, result: "You paid $600 and got back a boat that runs better than before." },
      { label: "Patch it yourself", outcomes: [
        { chance: 0.4, stat: "smarts", effect: { smarts: 1, happiness: 5 }, result: "You patched it yourself, and you've since become unbearable at the marina." },
        { effect: { happiness: -5 }, act: function () { shopChangeValue(["sailboat", "speedboat", "yacht"], 0.8); }, result: "It sank a little, just at the dock. Your boat is now worth 20% less." } ] },
    ] },
  { id: "adult-plane-scare", title: "Bumpy skies", stage: "adult",
    ok: function () { return lifeOwnsAny(["plane", "helicopter", "jet"]); },
    text: "A warning light comes on while you are in the air.",
    choices: [
      { label: "Land right away", effect: { smarts: 1, happiness: 1, cash: -300 }, result: "You landed safely in a field. The inspection cost $300." },
      { label: "Keep flying", outcomes: [
        { chance: 0.6, stat: "smarts", effect: { happiness: 5, charisma: 1 }, result: "It was a loose wire, and you have a great story now." },
        { effect: { health: -8, happiness: -6, cash: -800 }, result: "You made a very hard landing. You walked away bruised, with an $800 bill." } ] },
    ] },
  { id: "adult-art-appraisal", title: "An expert visits", stage: "adult",
    ok: function () { return lifeOwnsAny(["print", "masterpiece", "card", "comic"]); },
    text: "An expert at a party asks about your collection and raises one eyebrow.",
    choices: [
      { label: "Let them take a look", outcomes: [
        { chance: 0.5, effect: { happiness: 8 }, act: function () { shopChangeValue(["print", "masterpiece", "card", "comic"], 1.5); }, result: "They gasped. Your collection is worth 50% more than you thought." },
        { effect: { happiness: -3 }, act: function () { shopChangeValue(["print", "masterpiece", "card", "comic"], 0.8); }, result: "They sighed. Your collection is worth 20% less than you hoped." } ] },
      { label: "Change the subject", effect: { happiness: 1 }, result: "You kept your collection and your illusions." },
    ] },
  { id: "adult-tenant", title: "Trouble with a tenant", stage: "adult",
    ok: function () {
      return S.life.owned.some(function (owned) { return owned.rented; });
    },
    text: "Your tenant says there's a raccoon living in the ceiling, and it's your problem.",
    choices: [
      { label: "Pay to fix it", effect: { cash: -250, karma: 2 }, result: "You paid $250. The raccoon relocated, and your tenant renewed." },
      { label: "Tell them to deal with it", effect: { karma: -3, cash: -50, happiness: -1 }, result: "They left a bad review and $50 of damage. The raccoon stayed." },
    ] },
  { id: "adult-lost-pet", title: "Your pet is missing", stage: "any",
    ok: function () {
      return S.life.people.some(function (p) { return p.alive && p.role === "pet"; });
    },
    text: "The door was open, and your pet is gone.",
    choices: [
      { label: "Search the whole neighborhood", effect: { health: 2, happiness: 6, karma: 1 }, result: "You found them two streets over, being fed by a very happy stranger." },
      { label: "Put up posters", effect: { cash: -10, happiness: 5 }, result: "You printed $10 of posters, and they came home by themselves that night." },
    ] },
  { id: "adult-blackout", title: "Citywide blackout", stage: "adult",
    text: "The power goes out across all of Stick City, and everyone comes outside.",
    choices: [
      { label: "Grill everything in the freezer", effect: { karma: 2, charisma: 1, happiness: 7 }, result: "You fed half the block by candlelight, and it was the best night of the year." },
      { label: "Go to bed early", effect: { health: 3, happiness: 1 }, result: "You slept for eleven hours and felt incredible." },
    ] },
  { id: "adult-jury", title: "Jury duty", stage: "adult",
    text: "You've been called for jury duty. The case involves a stolen garden gnome.",
    choices: [
      { label: "Take it very seriously", effect: { smarts: 2, karma: 2 }, result: "You studied the gnome evidence closely, and justice was served." },
      { label: "Try to get out of it", outcomes: [
        { chance: 0.5, stat: "charisma", effect: { happiness: 3 }, result: "Your excuse worked, and you went for pancakes instead." },
        { effect: { happiness: -2, karma: -1 }, result: "The judge did not buy it, so you served anyway, in a bad mood." } ] },
    ] },
  { id: "adult-reunion", title: "High school reunion", stage: "adult",
    ok: function () { return S.age >= 28; },
    text: "Your old classmates want to know what you've been up to.",
    choices: [
      { label: "Tell the honest truth", effect: { karma: 2, happiness: 4 }, result: "You told it straight, and you made a few real friends again." },
      { label: "Exaggerate wildly", outcomes: [
        { chance: 0.4, stat: "charisma", effect: { charisma: 1, happiness: 5 }, result: "They believed you're a part-time astronaut, and now you must keep it up." },
        { effect: { happiness: -4 }, result: "Someone looked you up on their phone right in front of you." } ] },
    ] },
  { id: "adult-midlife", title: "A sudden urge", stage: "adult",
    ok: function () { return S.age >= 40; },
    text: "You wake up certain that you were meant to do something completely different.",
    choices: [
      { label: "Take up a wild new hobby", effect: { cash: -100, happiness: 8, charisma: 1 }, result: "You spent $100 on trapeze lessons, and your family has questions." },
      { label: "Take a long walk instead", effect: { health: 3, happiness: 3 }, result: "You walked it off and found out you already like your life." },
    ] },
  { id: "adult-court-ticket", title: "A parking ticket", stage: "adult",
    text: "There's a $60 ticket on your windshield. You only stopped for a minute.",
    choices: [
      { label: "Pay it", effect: { cash: -60 }, result: "You paid the $60 and grumbled about it for a week." },
      { label: "Fight it in court", outcomes: [
        { chance: 0.4, stat: "charisma", effect: { happiness: 7, charisma: 1 }, result: "You won with a hand-drawn diagram, and the judge kept a copy." },
        { effect: { cash: -120, happiness: -3 }, result: "You lost, and the fine doubled to $120." } ] },
    ] },

  // ---- Senior ----
  { id: "quiet-retirement", title: "A new chapter opens", stage: "senior",
    text: "The days have more room in them now.",
    choices: [
      { label: "Share your experience with a young neighbor", effect: { smarts: 1, relationship: 3, happiness: 5 }, result: "You taught the kid next door how to fix a bike, and they come back every week." },
      { label: "Start a new hobby", effect: { looks: 1, happiness: 7 }, result: "You took up watercolors, and the fridge is now full." },
    ] },
  { id: "senior-garden", title: "A place for the next generation", stage: "senior",
    text: "There is a bare patch in the park, and you have some time.",
    choices: [
      { label: "Plant a tree with your family", effect: { happiness: 7, relationship: 3, flag: "familyTreePlanting" }, result: "You planted a tree you might never see grown, and that felt right." },
      { label: "Write down a lesson you learned", effect: { smarts: 1, charisma: 1, flag: "lifeLesson" }, result: "You wrote one page of advice and tucked it where someone will find it." },
    ] },
  { id: "senior-tech", title: "The new phone", stage: "senior",
    text: "A relative gave you a new phone. It keeps asking you questions.",
    choices: [
      { label: "Figure it out", outcomes: [
        { chance: 0.5, stat: "smarts", effect: { smarts: 2, happiness: 5 }, result: "You mastered it and now send everyone far too many photos of birds." },
        { effect: { happiness: -2 }, result: "You accidentally called the same person eleven times." } ] },
      { label: "Ask a younger relative for help", effect: { relationship: 3, happiness: 5 }, result: "They fixed it in nine seconds and stayed for lunch." },
    ] },
  { id: "senior-dance", title: "The senior center dance", stage: "senior",
    text: "The senior center is holding a dance, and your knees have opinions.",
    choices: [
      { label: "Dance anyway", outcomes: [
        { chance: 0.6, stat: "health", effect: { health: 2, charisma: 1, happiness: 8 }, result: "You danced until they turned the lights on." },
        { effect: { health: -4, happiness: 3 }, result: "You threw out your back during the big finish. Worth it." } ] },
      { label: "Run the snack table", effect: { happiness: 4, karma: 1 }, result: "You ran the snacks, heard all the gossip and went home happy." },
    ] },
  { id: "senior-checkup", title: "A talk with your doctor", stage: "senior",
    text: "Your doctor has looked at your numbers and suggests some changes.",
    choices: [
      { label: "Follow the advice", effect: { health: 8, happiness: -1 }, result: "You gave up the extra salt and started feeling stronger." },
      { label: "Ignore it", effect: { happiness: 3, health: -4 }, result: "You told your doctor you've made it this far, then ordered the fries." },
    ] },
  { id: "senior-memoir", title: "Writing it all down", stage: "senior",
    text: "A local publisher wants people to send in their life stories.",
    choices: [
      { label: "Write your memoir", outcomes: [
        { chance: 0.35, stat: "smarts", effect: { cash: 400, charisma: 2, happiness: 10 }, result: "They printed it, and you made $400 and a line at the bookstore." },
        { effect: { smarts: 1, happiness: 4 }, result: "No one published it, but your family read every page." } ] },
      { label: "Keep your secrets", effect: { happiness: 2, karma: -1 }, result: "Some stories are better left with you." },
    ] },
  { id: "senior-old-friend", title: "A familiar face", stage: "senior",
    text: "At the grocery store, you run into someone you haven't seen in forty years.",
    choices: [
      { label: "Invite them for coffee", effect: { happiness: 9, charisma: 1 }, result: "You talked for four hours and picked up right where you left off." },
      { label: "Pretend you didn't see them", effect: { happiness: -2 }, result: "You hid behind the cereal, and you think about it now and then." },
    ] },
  { id: "senior-scam", title: "A call about a relative", stage: "senior",
    text: "A caller says a young relative needs $1,000 wired right away. The voice sounds off.",
    choices: [
      { label: "Hang up and check", effect: { smarts: 2, happiness: 2 }, result: "You called the family, and everyone was fine. You told the whole senior center." },
      { label: "Send the money", effect: { cash: -1000, happiness: -8 }, result: "It was a scam, and the $1,000 is gone." },
    ] },
  { id: "senior-grandkids", title: "Babysitting duty", stage: "senior",
    ok: function () { return S.life.children.length > 0; },
    text: "Your family needs someone to watch the little ones this weekend.",
    choices: [
      { label: "Spoil them completely", effect: { happiness: 9, health: -1, cash: -30 }, result: "You spent $30 on ice cream, and they cried when they had to leave." },
      { label: "Teach them a card game", effect: { happiness: 6, smarts: 1, relationship: 2 }, result: "They beat you by Sunday, and you've never been prouder." },
    ] },
  { id: "senior-will", title: "Getting your affairs in order", stage: "senior",
    text: "A lawyer suggests it might be time to think about your will.",
    choices: [
      { label: "Sort it out", effect: { smarts: 1, cash: -100, happiness: 3 }, result: "You paid $100 and felt strangely light afterward." },
      { label: "Leave something to charity", effect: { karma: 8, cash: -100, happiness: 5 }, result: "You set aside a gift for the library, and they've already saved a shelf." },
      { label: "Not today", effect: { happiness: 1 }, result: "You told the lawyer you've got plenty of time." },
    ] },
  { id: "senior-medal", title: "Stick City's oldest runner", stage: "senior",
    ok: function () { return S.life.health >= 60; },
    text: "The city fun run is short on entrants in your age group. There is one: you.",
    choices: [
      { label: "Run it", effect: { health: 3, happiness: 9, charisma: 1 }, result: "You walked most of it, finished dead last and won gold in your age group." },
      { label: "Cheer from a chair", effect: { happiness: 3 }, result: "You cheered louder than anyone there." },
    ] },

  // ---- Any age ----
  { id: "family-reunion", title: "A family reunion is coming up", stage: "any",
    ok: function () { return S.age >= 3; },
    followup: "family-reunion",
    text: "Relatives you barely remember are all coming to the park this weekend.",
    choices: [
      { label: "Bring a favorite dish", effect: { cash: -15, relationship: 3, happiness: 6 }, result: "Your dish was gone in ten minutes, and an aunt asked for the recipe." },
      { label: "Collect stories from everyone", effect: { smarts: 1, relationship: 2, flag: "familyStories" }, result: "You filled a notebook with stories nobody had ever told you." },
    ] },
  { id: "followup-stories", title: "Years later, those stories still matter", stage: "any",
    ok: function () { return !!(S.life.flags && S.life.flags.familyStories); },
    followup: "family-stories",
    text: "You find that notebook of family stories in a drawer.",
    choices: [
      { label: "Write them down for the family", effect: { smarts: 2, happiness: 5, flag: "familyArchive" }, result: "You made a small book of them, and everyone wanted a copy." },
      { label: "Tell the stories at a gathering", effect: { charisma: 2, relationship: 3 }, result: "You told them at dinner, and the youngest ones asked for more." },
    ] },
  { id: "community-garden", title: "A community garden is taking shape", stage: "any",
    ok: function () { return S.age >= 3; },
    text: "Your neighbors are turning an empty lot into a garden.",
    choices: [
      { label: "Grow vegetables with neighbors", effect: { karma: 2, health: 2, relationship: 2 }, result: "You grew one enormous zucchini, and everyone had to admire it." },
      { label: "Design a welcoming sign", effect: { looks: 1, charisma: 1, happiness: 3 }, result: "Your sign is crooked, and people say that is the charm of it." },
    ] },

  // ---- Prison ----
  { id: "prison-cellmate", title: "Your new cellmate", prison: true,
    text: "Your new cellmate is called Tiny. Tiny is not tiny.",
    choices: [
      { label: "Be friendly", outcomes: [
        { chance: 0.6, stat: "charisma", effect: { happiness: 5, charisma: 1 }, result: "Tiny turned out to love crosswords, and now you do them together." },
        { effect: { health: -3, happiness: -3 }, result: "Tiny wanted the top bunk and made that very clear." } ] },
      { label: "Keep to yourself", effect: { smarts: 1, happiness: -1 }, result: "You read a lot of books and said very little." },
    ] },
  { id: "prison-class", title: "A class inside", prison: true,
    text: "The prison offers evening classes, and there is one seat left.",
    choices: [
      { label: "Sign up", effect: { smarts: 3, karma: 2, happiness: 2 }, result: "You learned basic accounting and now help everyone with their paperwork." },
      { label: "Work in the laundry", effect: { cash: 15, health: 1 }, result: "You folded a mountain of laundry and earned $15." },
    ] },
  { id: "prison-parole", title: "A hearing with the board", prison: true,
    ok: function () { return S.life.prisonYears >= 1; },
    text: "The parole board wants to know whether you've changed.",
    choices: [
      { label: "Tell them honestly", outcomes: [
        { chance: 0.4, stat: "karma", effect: { happiness: 10, karma: 2 }, act: function () { S.life.prisonYears = 0; }, result: "They believed you and released you early." },
        { effect: { happiness: -3, karma: 1 }, result: "They said not yet, but they noted your honesty." } ] },
      { label: "Give a dramatic speech", outcomes: [
        { chance: 0.25, stat: "charisma", effect: { happiness: 10, charisma: 1 }, act: function () { S.life.prisonYears = 0; }, result: "You moved one board member to tears and walked out early." },
        { effect: { happiness: -4 }, result: "The board asked you to stop, and then asked again." } ] },
    ] },
];
var LIFE_CAREERS = [
  { id: "artist", title: "Community artist", building: "Clothing Boutique", wage: 45, smarts: 5, charisma: 4 },
  { id: "teacher", title: "School tutor", building: "School", wage: 65, smarts: 12, charisma: 6, recordRestricted: true },
  { id: "nurse", title: "Clinic assistant", building: "Hospital", wage: 70, smarts: 10, charisma: 5, recordRestricted: true },
  { id: "engineer", title: "Junior engineer", building: "Office", wage: 105, smarts: 18, charisma: 7, recordRestricted: true },
  { id: "chef", title: "Cafe chef", building: "Cafe", wage: 60, smarts: 6, charisma: 4 },
  { id: "athlete", title: "City athlete", building: "Gym", wage: 75, strength: 10, charisma: 4, special: "sports" },
  { id: "organizer", title: "Community organizer", building: "Office", wage: 80, karma: 8, charisma: 8, special: "politics" },
  { id: "creator", title: "Independent creator", building: "Office", wage: 55, charisma: 7, special: "fame" },
  { id: "business", title: "Small business owner", building: "Office", wage: 90, charisma: 7, special: "business" },
];
var LIFE_CRIMES = [
  { title: "Pocket a novelty souvenir", difficulty: 4, prize: 25, heat: 0.25 },
  { title: "Sneak out with a giant foam trophy", difficulty: 9, prize: 80, heat: 0.5 },
  { title: "Try a cartoonish midnight getaway", difficulty: 15, prize: 180, heat: 0.9 },
];
var VEHICLES = [
  ["bicycle", "Bicycle", 145, 5.3, "🚲"],
  ["scooter", "Scooter", 575, 7, "🛵"],
  ["motorcycle", "Motorcycle", 1020, 8.5, "🏍️"],
  ["car", "City car", 1900, 10, "🚙"],
  ["sportscar", "Sports car", 7200, 13, "🏎️"],
  ["sedan", "Luxury sedan", 14400, 11, "🚘"],
  ["limo", "Stretch limo", 30000, 10.5, "🚙"],
  ["hypercar", "Hypercar", 96000, 15, "🏎️"],
];
var CAR_KEYS = ["car", "sportscar", "sedan", "limo", "hypercar"],
  LICENSE_BOAT = 240,
  LICENSE_LESSON = 1200,
  PILOT_LESSONS = 3;
// Marketplace catalog. resale: share of the price it is worth once bought.
// keep: yearly value change. swing: yearly random range. use: once-a-year action.
var LIFE_SHOP = [
  {
    id: "property", label: "Homes", icon: "🏡",
    items: [
      { key: "cabin", name: "a lakeside cabin", icon: "🛖", price: 9600, upkeep: 96, rent: 288, keep: 1.02,
        use: { label: "Visit for the weekend", effect: { happiness: 6, health: 2 }, story: "You fished badly and slept wonderfully at the cabin." } },
      { key: "penthouse", name: "a downtown penthouse", icon: "🏙️", price: 24000, upkeep: 240, rent: 720, keep: 1.02,
        use: { label: "Host friends upstairs", effect: { happiness: 7, charisma: 1 }, story: "Everyone agreed your penthouse view was better than the party." } },
      { key: "villa", name: "a beachfront villa", icon: "🏖️", price: 72000, upkeep: 720, rent: 2160, keep: 1.02,
        use: { label: "Spend a month there", effect: { happiness: 10, health: 3 }, story: "You spent a month at the villa and forgot what day it was." } },
      { key: "island", name: "a private island", icon: "🏝️", price: 300000, upkeep: 3000, rent: 9000, keep: 1.02,
        use: { label: "Sail out to your island", effect: { happiness: 14, health: 4 }, story: "You named a palm tree on your island. It did not object." } },
    ],
  },
  {
    id: "cars", label: "Cars", icon: "🚘",
    items: [
      { key: "sedan", name: "a luxury sedan", icon: "🚘", price: 14400, type: "vehicle" },
      { key: "limo", name: "a stretch limo", icon: "🚙", price: 30000, type: "vehicle" },
      { key: "hypercar", name: "a hypercar", icon: "🏎️", price: 96000, type: "vehicle" },
    ],
  },
  {
    id: "boats", label: "Boats", icon: "⛵",
    items: [
      { key: "kayak", name: "a kayak", icon: "🛶", price: 360, upkeep: 10, resale: 0.85, keep: 0.96, age: 12,
        use: { label: "Paddle the harbor", effect: { happiness: 4, health: 2 }, story: "You paddled in a slow circle and called it exercise." } },
      { key: "sailboat", name: "a sailboat", icon: "⛵", price: 7200, upkeep: 150, resale: 0.85, keep: 0.96, license: "boat",
        use: { label: "Take it out", effect: { happiness: 6 }, story: "The wind cooperated, and you felt like a real sailor." } },
      { key: "speedboat", name: "a speedboat", icon: "🚤", price: 21600, upkeep: 500, resale: 0.85, keep: 0.96, license: "boat",
        use: { label: "Take it out", effect: { happiness: 8 }, story: "You raced across the bay and soaked every passenger." } },
      { key: "yacht", name: "a superyacht", icon: "🛥️", price: 180000, upkeep: 5000, resale: 0.85, keep: 0.96, license: "boat",
        use: { label: "Throw a party on deck", effect: { happiness: 12, charisma: 1 }, story: "The whole marina could hear your yacht party." } },
    ],
  },
  {
    id: "air", label: "Aircraft", icon: "✈️",
    items: [
      { key: "plane", name: "a light plane", icon: "🛩️", price: 48000, upkeep: 1500, resale: 0.85, keep: 0.95, license: "pilot",
        use: { label: "Fly over the city", effect: { happiness: 9 }, story: "From up there, Stick City looked like a very tidy drawing." } },
      { key: "helicopter", name: "a helicopter", icon: "🚁", price: 108000, upkeep: 3500, resale: 0.85, keep: 0.95, license: "pilot",
        use: { label: "Skip the traffic", effect: { happiness: 11 }, story: "You landed on a roof and waved at the traffic below." } },
      { key: "jet", name: "a private jet", icon: "✈️", price: 360000, upkeep: 12000, resale: 0.85, keep: 0.95, license: "pilot",
        use: { label: "Fly somewhere for lunch", effect: { happiness: 14, charisma: 1 }, story: "You crossed an ocean for a sandwich. It was a good sandwich." } },
    ],
  },
  {
    id: "jewelry", label: "Jewelry", icon: "💎",
    items: [
      { key: "stallring", name: "a street stall ring", icon: "💍", price: 120, resale: 0.8, keep: 1.01, multi: 1, fakeChance: 0.4, detail: "A bargain, if it's real" },
      { key: "necklace", name: "a mall necklace", icon: "📿", price: 600, resale: 0.7, keep: 1.01, multi: 1, fakeChance: 0.05, detail: "Reliable, but overpriced" },
      { key: "diamond", name: "a fine diamond ring", icon: "💎", price: 4800, resale: 0.85, keep: 1.01, multi: 1, detail: "Certified and always real" },
    ],
  },
  {
    id: "music", label: "Music", icon: "🎸",
    items: [
      { key: "ukulele", name: "a ukulele", icon: "🪕", price: 96, resale: 0.7, keep: 0.97, age: 8,
        use: { label: "Practice", effect: { happiness: 3, charisma: 1 }, story: "You learned three chords and used them on everyone." } },
      { key: "guitar", name: "a guitar", icon: "🎸", price: 360, resale: 0.7, keep: 0.97, age: 8,
        use: { label: "Practice", effect: { happiness: 3, charisma: 2 }, story: "Your fingers hurt, but that solo almost sounded right." } },
      { key: "drums", name: "a drum kit", icon: "🥁", price: 1080, resale: 0.7, keep: 0.97, age: 8,
        use: { label: "Practice", effect: { happiness: 4, charisma: 2 }, story: "The neighbors now know your practice schedule by heart." } },
      { key: "grandpiano", name: "a concert piano", icon: "🎹", price: 6000, resale: 0.8, keep: 0.99, age: 8,
        use: { label: "Practice", effect: { happiness: 5, charisma: 3, smarts: 1 }, story: "You played until the room went quiet, then played some more." } },
    ],
  },
  {
    id: "collect", label: "Collect", icon: "🖼️",
    items: [
      { key: "comic", name: "a vintage comic", icon: "📕", price: 240, resale: 0.9, swing: [-0.1, 0.16], multi: 1, age: 8, detail: "Value changes every year" },
      { key: "card", name: "a rare trading card", icon: "🃏", price: 1200, resale: 0.9, swing: [-0.14, 0.2], multi: 1, age: 8, detail: "Value changes every year" },
      { key: "print", name: "a signed skyline print", icon: "🌆", price: 6000, resale: 0.9, swing: [-0.12, 0.18], multi: 1, detail: "Value changes every year" },
      { key: "masterpiece", name: "a modern masterpiece", icon: "🖼️", price: 48000, resale: 0.9, swing: [-0.15, 0.22], multi: 1, detail: "A big gamble that might pay off" },
    ],
  },
  {
    id: "life", label: "Lifestyle", icon: "🥂",
    items: [
      { group: "Yearly help", key: "trainer", name: "a personal trainer", icon: "💪", price: 600, type: "sub", detail: "+4 health, +1 strength each year", effect: { health: 4, strength: 1 } },
      { group: "Yearly help", key: "chef", name: "a private chef", icon: "👨‍🍳", price: 1800, type: "sub", detail: "+3 health, +2 happiness each year", effect: { health: 3, happiness: 2 } },
      { group: "Yearly help", key: "staff", name: "house staff", icon: "🧹", price: 3600, type: "sub", detail: "+5 happiness each year", effect: { happiness: 5 } },
      { group: "Looks", key: "makeover", name: "a salon makeover", icon: "💇", price: 180, type: "service", detail: "+5 looks", effect: { looks: 5 }, story: "You left the salon looking like your own better-rested cousin." },
      { group: "Looks", key: "touchup", name: "a cosmetic touch-up", icon: "💉", price: 1200, type: "service", detail: "+12 looks, small risk", effect: { looks: 12 }, story: "The touch-up was subtle. Your friends just think you're on vacation.",
        risk: { chance: 0.15, effect: { looks: -6, happiness: -3 }, story: "Your eyebrows now look permanently surprised. So does everyone you meet." } },
      { group: "Looks", key: "glam", name: "a full glam overhaul", icon: "✨", price: 6000, type: "service", detail: "+20 looks, small risk", effect: { looks: 20, happiness: 3 }, story: "A team of six people made you look effortless.",
        risk: { chance: 0.1, effect: { looks: -8, happiness: -4 }, story: "The glam team tried something bold. Several pigeons stared." } },
      { group: "Trips", key: "roadtrip", name: "a road trip", icon: "🚌", price: 240, type: "service", detail: "+8 happiness", effect: { happiness: 8 }, story: "You took a wrong turn and found your new favorite diner." },
      { group: "Trips", key: "islandtrip", name: "an island holiday", icon: "🌴", price: 1800, type: "service", detail: "+15 happiness, +3 health", effect: { happiness: 15, health: 3 }, story: "You came home with a tan and no memory of your email password." },
      { group: "Trips", key: "worldtour", name: "a world tour", icon: "🌍", price: 12000, type: "service", detail: "+25 happiness, +2 charisma", effect: { happiness: 25, charisma: 2 }, story: "Nine countries later, you have opinions about breakfast everywhere." },
      { group: "Parties", key: "houseparty", name: "a house party", icon: "🎉", price: 360, type: "service", detail: "+6 happiness, +1 charisma", effect: { happiness: 6, charisma: 1 }, story: "Someone brought a keyboard. The party lasted until sunrise." },
      { group: "Parties", key: "gala", name: "a charity gala", icon: "🥂", price: 4800, type: "service", detail: "+10 happiness, +3 charisma, +3 karma", effect: { happiness: 10, charisma: 3, karma: 3 }, story: "The whole city dressed up for your gala, and the speeches were mercifully short." },
      { group: "Giving", key: "donatesmall", name: "a small donation", icon: "🤲", price: 120, type: "service", age: 0, detail: "+2 karma", effect: { karma: 2 }, story: "The food bank sent a thank-you card drawn in crayon." },
      { group: "Giving", key: "donatebig", name: "a big donation", icon: "💝", price: 1200, type: "service", detail: "+8 karma, +2 happiness", effect: { karma: 8, happiness: 2 }, story: "Your donation paid for a new playground slide." },
      { group: "Giving", key: "donatehuge", name: "a huge donation", icon: "🏛️", price: 12000, type: "service", detail: "+20 karma, +4 happiness", effect: { karma: 20, happiness: 4 }, story: "They named a library reading room after you." },
      { group: "Lottery", key: "ticket", name: "a lottery ticket", icon: "🎟️", price: 12, type: "service", tickets: 1, detail: "A long shot at $100,000", story: "" },
      { group: "Lottery", key: "tickets", name: "a bundle of 10 tickets", icon: "🎫", price: 120, type: "service", tickets: 10, detail: "Ten long shots", story: "" },
    ],
  },
];
var SHOP_ITEMS = {
  "Clothing Boutique": [
    ["Blue jacket", 110, "Blue"],
    ["Red jacket", 130, "Red"],
    ["Green outfit", 115, "Green"],
    ["Purple outfit", 145, "Purple"],
    ["Golden outfit", 215, "Gold"],
    ["Black suit", 300, "Black"],
    ["Pink outfit", 120, "Pink"],
  ],
  Supermarket: [
    ["Fresh fruit", 10, "fruit"],
    ["Meal box", 19, "meal"],
    ["Groceries for a week", 54, "groceries"],
  ],
  "Furniture Gallery": [
    ["Comfy sofa", 110, "sofa"],
    ["Study desk", 130, "desk"],
    ["Houseplants", 42, "plants"],
    ["Large TV", 300, "tv"],
    ["Bookshelf", 90, "bookshelf"],
    ["Piano", 780, "piano"],
    ["Dining table", 215, "table"],
    ["Floor lamp", 54, "lamp"],
    ["Cozy rug", 72, "rug"],
    ["Painting", 145, "painting"],
  ],
};
var FURN = [
  ["sofa", "🛋️"],
  ["desk", "🖥️"],
  ["plants", "🪴"],
  ["tv", "📺"],
  ["bookshelf", "📚"],
  ["piano", "🎹"],
  ["table", "🪑"],
  ["lamp", "💡"],
  ["rug", "🟠"],
  ["painting", "🖼️"],
];
// Each item sits in its own spot (0-9) unless the player moved it.
function furnSlot(k) {
  var s = S.decorSlots[k];
  if (s === undefined)
    s = FURN.map(function (f) {
      return f[0];
    }).indexOf(k);
  return ((s % 10) + 10) % 10;
}
function seasonName() {
  return ["Spring", "Summer", "Autumn", "Winter"][
    Math.floor((S.day - 1) / 15) % 4
  ];
}
function netWorth() {
  var homes =
      Math.round(
        (S.owns.apartment ? 850 : 0) *
          (1 - (typeof lifeHomeWear === "function" ? lifeHomeWear("apartment") : 0)),
      ) +
      Math.round(
        (S.owns.townhouse ? 2050 : 0) *
          (1 - (typeof lifeHomeWear === "function" ? lifeHomeWear("townhouse") : 0)),
      ) +
      Math.round(
        (S.mansion ? 3600 : 0) *
          (1 - (typeof lifeHomeWear === "function" ? lifeHomeWear("mansion") : 0)),
      ),
    vehicles = VEHICLES.reduce(function (total, vehicle) {
      return S.garage && S.garage[vehicle[0]]
        ? total +
            Math.round(
              vehicle[2] *
                (1 -
                  (typeof lifeVehicleWear === "function"
                    ? lifeVehicleWear(vehicle[0])
                    : 0)),
            )
        : total;
    }, 0),
    investments = typeof invested === "function" ? invested() : 0,
    businessValues = { cafe: 720, delivery: 1020, arcade: 1320, store: 1620, factory: 2640 },
    businesses = Object.keys(S.businesses || {}).reduce(function (total, key) {
      return total + (businessValues[key] || 500);
    }, 0),
    furniture = Object.keys(S.furniture || {}).reduce(function (total, key) {
      var item = Object.keys(SHOP_ITEMS).reduce(function (found, shop) {
        return found || SHOP_ITEMS[shop].filter(function (entry) {
          return entry[2] === key;
        })[0];
      }, null);
      return total + (item ? item[1] : 25);
    }, 0),
    jewelry = (S.life && S.life.assets && S.life.assets.jewelry) || 0,
    debt = (S.life && S.life.debt) || 0;
  return S.cash + S.bank + homes + vehicles + investments + businesses + furniture + jewelry - debt + (typeof shopWorth === "function" ? shopWorth() : 0);
}
function claimAchievement(m) {
  if (S.achievementClaims[m[0]] || !m[4]()) return;
  S.achievementClaims[m[0]] = 1;
  S.cash += m[3];
  S.lifetimeEarned += m[3];
  cityNotice("🏆 Achievement: " + m[1] + "! +" + fmtCash(m[3]));
  cityAchievements();
}
