# Data Engineering & Visualization: Study Companion

An interactive study companion for **Data Engineering & Visualization**: six lectures and five labs turned into notes you can play with, built for midterm preparation.

## What's inside

| Area | Content |
|---|---|
| **Lectures 1-6** | Data engineering and ETL, the modern data stack, data types, statistics, visual perception, chart choice, Gestalt, color, preprocessing |
| **Labs 1-5** | Web scraping and EDA, cleaning and outliers, Power BI (ETL and interactivity), data storytelling with Data Studio |
| **49 simulators** | ETL pipeline, batch vs stream latency, central-tendency playground, box-plot builder, Anscombe's quartet, a timed pre-attentive search test, all 8 Gestalt principles, color schemes with a grayscale check, Power Query and Merge Queries emulators, drill down vs drill through, a dashboard makeover and the 10-second test |
| **Real lab data** | `placement.csv` (Lab 2) drives the histogram and outlier simulators; `adult.csv` (Lab 1) and the remote-work CSV (Lab 3) supply real counts and outputs |
| **Practice** | 107 exam-style questions with explanations, 106 flashcards with spaced repetition, a searchable glossary and a printable cheat sheet |

Progress (sections understood, quiz history, flashcard boxes) is saved in your browser's local storage.

## Run it

It is a static site with no build step. ES modules need to be served over HTTP:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Design notes

- The visual system follows the course's own Lab 5 rule: grey carries context, one orange accent carries the point.
- Light and dark themes, keyboard shortcuts (`/` search, `1-4` answer, `Space` flip a card), and `prefers-reduced-motion` support.
- Every animation has a job: it shows a state change, a data flow, or feedback on an answer.
- Motion layer (`css/motion.css`, `js/motion.js`): animated chart logo, page and circular theme transitions (View Transitions API), scroll reveals, charts that draw in on first view, a sliding nav indicator, a staggered mobile drawer, and answer feedback.
- Exam practice setup (`js/quiz-setup.js`): topic tiles with per-topic accuracy, a keyboard-accessible length dropdown and a weak-spots switch.

## Structure

```
index.html
css/styles.css
js/app.js          router, home, module pages, quiz, flashcards, glossary, cheat sheet, search
js/modules.js      lecture and lab content
js/bank.js         questions and glossary
js/store.js        local progress
js/viz.js          SVG and statistics helpers
js/placement.js    Lab 2 dataset
js/widgets/        the simulators
```
