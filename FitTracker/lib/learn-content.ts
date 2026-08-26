// Static reference content for the /learn hub — general fitness, nutrition,
// and recovery education aimed at beginners. This isn't user data, so it
// lives in code rather than the database; edit this file to update it.

export type LearnArticle = {
  id: string;
  title: string;
  body: string[];
};

export type LearnCategory = {
  id: string;
  title: string;
  articles: LearnArticle[];
};

export const LEARN_CATEGORIES: LearnCategory[] = [
  {
    id: "training",
    title: "Training fundamentals",
    articles: [
      {
        id: "progressive-overload",
        title: "Progressive overload: the one principle that matters most",
        body: [
          "If you take away every other piece of training advice, keep this one: your body only has a reason to build muscle or get stronger if you consistently ask it to do a little more than it's used to. That's progressive overload — gradually increasing the weight, reps, or sets you do over weeks and months. Without it, you can train hard forever and just maintain what you already have.",
          "It doesn't need to be dramatic. Adding 2.5-5 lbs to a lift every week or two, adding one more rep before you increase weight, or adding one more set to a exercise over time are all valid ways to progress. What matters is that you're tracking your numbers (this app does that for you) so you actually know whether you're progressing or just repeating the same workout indefinitely.",
        ],
      },
      {
        id: "sets-reps",
        title: "How many sets and reps you actually need",
        body: [
          "Research on training volume consistently points to somewhere around 10-20 hard sets per muscle group per week for most lifters, spread across the week rather than crammed into one session. Fewer sets than that and you're likely leaving progress on the table; a lot more and you're often just adding fatigue without added benefit, especially for beginners.",
          "Rep ranges matter less than people think. Building muscle happens across a wide range — roughly 5 to 30 reps per set — as long as the set is taken reasonably close to failure. Lower reps (3-6) with heavier weight tend to build strength slightly more efficiently; moderate reps (8-15) are the easiest to recover from and track; higher reps (15-30+) work well for smaller, more resilient muscles and joints that don't tolerate heavy loading as well. Most well-designed programs, including this one's suggested defaults, mix all three.",
        ],
      },
      {
        id: "frequency",
        title: "Training frequency — how often to hit each muscle",
        body: [
          "Training a muscle group twice a week tends to outperform training it once a week for the same total volume, because it spreads the stimulus out and gives you more chances to progress each set. This is a big part of why full-body and upper/lower splits are so popular for people training 3-4 days a week, while a 5-6 day body-part split works well for people training more often.",
          "There's no single correct split. What matters more than the specific split you choose is whether you can actually recover between sessions and whether you'll stick with it consistently for months.",
        ],
      },
      {
        id: "proximity-to-failure",
        title: "Training to failure — how hard is hard enough?",
        body: [
          "You don't need to take every set to complete failure (the point where you physically cannot do another rep) to make progress, and doing so on every set is actually a fast way to burn out and get hurt. Most research suggests stopping most sets 1-3 reps short of failure — sometimes described as leaving \"1-3 reps in the tank\" — builds muscle just as effectively as training to failure, with much less fatigue and injury risk.",
          "Save true failure or near-failure efforts for your last set of an exercise, or for isolation movements (like curls or leg extensions) where failing safely is much easier than under a heavy barbell squat or bench press.",
        ],
      },
      {
        id: "deloads",
        title: "Deload weeks: rest is part of the program, not a break from it",
        body: [
          "A deload is a planned week of reduced training volume or intensity, typically every 4-8 weeks depending on how hard you've been training. It feels counterintuitive to beginners — why would you train less on purpose? — but accumulated fatigue from weeks of hard training builds up faster than most people realize, and a deload lets your joints, connective tissue, and nervous system catch up before it turns into an injury or a training plateau.",
          "You don't need to overthink it: a week of noticeably lighter weight or fewer sets, or occasionally just a few extra rest days, is enough for most beginners and intermediates.",
        ],
      },
    ],
  },
  {
    id: "nutrition",
    title: "Nutrition",
    articles: [
      {
        id: "calories-macros",
        title: "Calories and macros: the foundation everything else sits on",
        body: [
          "Whether you gain, lose, or maintain weight comes down to calories in versus calories out — everything else (meal timing, food quality, supplements) is a smaller lever on top of that foundation. Eat more calories than you burn consistently and you'll gain weight; eat fewer and you'll lose it, regardless of the diet plan or philosophy wrapped around it.",
          "Within that calorie total, protein, carbohydrates, and fat (your \"macros\") determine how your body uses those calories. Protein is the one that matters most for anyone training — it's the raw material your body uses to repair and build muscle, and it's also the macro that keeps you fullest per calorie, which matters a lot when you're trying to lose fat without feeling starved.",
        ],
      },
      {
        id: "bulk-cut-maintain",
        title: "Bulking, cutting, and maintaining — what they actually mean",
        body: [
          "A bulk means deliberately eating in a calorie surplus (more than you burn) to build muscle, accepting that some fat gain comes along with it. A well-run bulk targets a modest surplus — roughly 200-500 calories a day above maintenance — and modest weight gain of about 0.25-0.5% of bodyweight per week. Bulking faster than that mostly just adds fat, not muscle, since your body can only build muscle so quickly regardless of how much extra food you eat.",
          "A cut means eating in a calorie deficit to lose fat while trying to hold onto as much muscle as possible — which means keeping protein high and continuing to train hard (not just harder cardio) throughout. A sustainable cut is usually a deficit of 300-500 calories a day, aiming to lose about 0.5-1% of bodyweight per week; faster than that and you start losing meaningful muscle along with the fat.",
          "Maintaining means eating at roughly your maintenance calories — enough to fuel your training and keep your weight stable — and is a completely valid long-term choice, especially if you're happy with your body composition and just want to keep training consistently and get stronger.",
        ],
      },
      {
        id: "protein",
        title: "How much protein you actually need",
        body: [
          "For anyone strength training, research generally supports somewhere around 0.7-1g of protein per pound of bodyweight per day (roughly 1.6-2.2g per kg) to maximize muscle growth and retention. Eating more than that doesn't seem to add meaningful benefit for most people — protein needs have a ceiling, they're not a \"more is always better\" macro.",
          "How you spread it across the day matters less than hitting your daily total, though spreading it across 3-5 meals with 25-40g of protein each tends to be a practical, sustainable way to get there without needing to eat huge amounts in one sitting.",
        ],
      },
      {
        id: "meal-timing",
        title: "Meal timing and the \"anabolic window\" — does it actually matter?",
        body: [
          "You may have heard you need to eat protein within 30 minutes of finishing a workout or you'll \"miss the window\" for muscle growth. This has been studied extensively, and the window is much wider than that old advice suggests — as long as you're eating adequate protein and calories across the day, the exact timing around your workout makes little to no difference for most people.",
          "The one exception worth knowing: if you train fasted or it's been many hours since you last ate, having some protein and carbs within a couple hours of training is a reasonable, low-effort habit — just not something to stress over to the minute.",
        ],
      },
    ],
  },
  {
    id: "recovery",
    title: "Sleep and recovery",
    articles: [
      {
        id: "why-sleep-matters",
        title: "Why sleep matters as much as your training",
        body: [
          "Sleep is when the actual repair and growth from your training happens — the muscle breakdown you cause in the gym gets rebuilt, stronger, mostly while you sleep. Consistently sleeping less than about 6-7 hours a night has been shown to reduce muscle protein synthesis, blunt strength gains, increase appetite and cravings (working against a cut), and lower testosterone — all of which directly undercut the training and eating you're putting effort into.",
          "Sleep also affects recovery from soreness and injury risk. Under-slept lifters report more perceived fatigue and soreness at the same training loads, and are measurably more likely to get injured, especially in overuse-type injuries from accumulated fatigue.",
          "If you only fix one non-training habit, prioritizing 7-9 hours of consistent sleep will likely do more for your results than any supplement or program tweak.",
        ],
      },
      {
        id: "rest-days",
        title: "Rest days and overtraining",
        body: [
          "Muscle doesn't grow while you're lifting — it grows in the days after, while you're recovering. Training the same muscle group again before it's recovered doesn't add extra stimulus, it just adds fatigue on top of a muscle that hasn't finished repairing, which is counterproductive.",
          "True overtraining syndrome is fairly rare and takes a long time of serious overreaching to develop, but the more common version — persistent fatigue, stalled progress, and nagging joint pain from too much volume without enough recovery — is common among motivated beginners who think more is always better. If your lifts have stalled or gone backward for a few weeks despite eating and sleeping well, that's usually a sign to take extra rest days or a deload, not to push harder.",
        ],
      },
    ],
  },
  {
    id: "supplements",
    title: "Supplements",
    articles: [
      {
        id: "proven-supplements",
        title: "What's actually backed by research",
        body: [
          "Very few supplements have strong, consistent research behind them — most of the industry is built on marketing, not evidence. The handful that do hold up:",
          "Creatine monohydrate is the most well-researched supplement in sports science, consistently shown to modestly increase strength, power, and muscle mass when combined with training. A standard dose is about 3-5g per day, taken any time — no loading phase or cycling is necessary, and it's safe for long-term daily use in healthy adults.",
          "Protein powder (whey, casein, or plant-based) isn't magic — it's just a convenient, cheap way to hit your daily protein target if you struggle to get there from food alone. If you already eat enough protein from food, powder adds nothing extra.",
          "Caffeine reliably improves strength, endurance, and focus in training when taken about 30-60 minutes beforehand, at a dose of roughly 3-6mg per kg of bodyweight. Regular use builds tolerance, so its edge fades if you take it before every single session.",
        ],
      },
      {
        id: "unproven-supplements",
        title: "What's mostly hype",
        body: [
          "BCAAs (branched-chain amino acids) sound useful but provide little benefit if you're already eating enough total protein — you're better off spending that money on real food or a complete protein powder.",
          "Fat burners and \"testosterone boosters\" sold over the counter are almost universally underdosed, unproven, or both. No pill replaces a calorie deficit for fat loss or resistance training for building testosterone-driving muscle. If a supplement's marketing sounds too good to be true relative to how it's regulated and sold, it is.",
          "Pre-workout supplements are mostly caffeine plus a marketing story — check the label, and know that most of the benefit you feel is from the caffeine dose (and sometimes a placebo effect from the ritual itself).",
          "A simple rule of thumb: if a supplement's benefit isn't replicated across multiple independent studies, treat any impressive claim about it with real skepticism.",
        ],
      },
    ],
  },
  {
    id: "peds",
    title: "Performance-enhancing drugs — an honest overview",
    articles: [
      {
        id: "peds-context",
        title: "Why this section exists",
        body: [
          "You will encounter people online and at the gym talking about steroids, SARMs, and peptides, often casually and often with bad information. This section explains what these substances broadly are and what the real, documented risks are — it is not instructions for using them, and this app does not provide dosing, cycling, or sourcing guidance for any of them. If you're considering using any of these, that decision should involve a doctor, not a fitness app.",
          "The honest starting point: the vast majority of people training naturally have not come close to their genetic potential for muscle and strength through consistent training, adequate protein, a calorie surplus, and good sleep alone. Most people overestimate how much these substances would even help them and dramatically underestimate the health tradeoffs.",
        ],
      },
      {
        id: "anabolic-steroids",
        title: "Anabolic steroids — what they are and the real risks",
        body: [
          "Anabolic-androgenic steroids are synthetic versions of testosterone that increase muscle protein synthesis, allowing significantly faster muscle growth and recovery than is possible naturally. In most countries, including the U.S., they are controlled substances — legal only with a prescription for specific medical conditions, and illegal to possess or use for physique or performance purposes without one.",
          "The documented health risks are serious and well-established: suppression of your body's own natural testosterone production (which can persist or become permanent), cardiovascular strain including elevated blood pressure and adverse changes to cholesterol that raise heart attack and stroke risk, liver stress (especially with oral compounds), mood and psychiatric effects including aggression and depression during use or withdrawal, and for men, testicular atrophy and infertility risk. Because they're typically sourced through unregulated markets, users also face real risk from contaminated, mislabeled, or counterfeit products with unknown actual contents.",
        ],
      },
      {
        id: "sarms-peptides",
        title: "SARMs and peptides — \"research chemical\" doesn't mean safe",
        body: [
          "SARMs (selective androgen receptor modulators) are drugs designed to bind to the same receptors as testosterone with theoretically fewer side effects, but in practice none are approved for human use anywhere — every SARM sold as a supplement is an unapproved, unregulated research chemical, and studies have found many products don't even contain what their label claims, or contain undisclosed steroids instead.",
          "Growth hormone-related peptides (like GHRPs or growth hormone secretagogues) are marketed similarly and carry the same fundamental problem: they're sold outside any regulatory oversight, dosing and purity aren't verified, and the long-term safety data that exists for approved medications simply doesn't exist for these products.",
          "The common thread across SARMs and peptides sold for fitness is that \"not FDA-approved\" isn't a technicality — it means there's no reliable data on what a normal, safe dose is, or what it actually does to your body over months or years of use.",
        ],
      },
    ],
  },
  {
    id: "mistakes",
    title: "Common beginner mistakes",
    articles: [
      {
        id: "gym-mistakes",
        title: "In the gym",
        body: [
          "Program hopping — switching to a new program every couple of weeks because you saw something more exciting online — is probably the single biggest thing that keeps beginners from progressing. Nearly any reasonable program works if you stick with it long enough to actually apply progressive overload; the program matters much less than consistency with one.",
          "Ego lifting (using more weight than you can control with good form) mainly just increases injury risk and often works the wrong muscles as your body compensates with momentum or bad positioning. Dropping the weight and controlling the full range of motion almost always builds more muscle than half-repping something heavier.",
          "Not tracking your workouts means you're guessing whether you're actually progressing. Write down (or log in this app) your weights and reps every session — it's the only reliable way to know if you're getting stronger over time.",
          "Skipping warm-up sets before your heaviest work — especially on squats, deadlifts, and bench press — increases injury risk and often means your first \"real\" set is worse than it should be because your body isn't primed yet.",
        ],
      },
      {
        id: "lifestyle-mistakes",
        title: "Outside the gym",
        body: [
          "Undereating protein while training hard is extremely common, especially for beginners who don't realize how much they actually need (see the protein article above) — without enough raw material, your training stimulus has nothing to build with.",
          "Chronically undersleeping while expecting gym progress is one of the most common self-sabotaging habits in fitness — see the sleep article above for why this matters as much as anything you do in the gym.",
          "All-or-nothing thinking — deciding that one missed workout or one off-plan meal has \"ruined\" the week and giving up until Monday — turns small setbacks into much bigger ones. Consistency over months matters far more than perfection in any single week.",
          "Comparing your week-one progress to someone else's years of training (especially people online who may not be natural, may be using enhanced photography or angles, or are simply further along) is a fast way to get discouraged for no good reason. Compare yourself to your own numbers from a month or two ago instead.",
        ],
      },
    ],
  },
];
