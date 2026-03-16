# Seeing Systems — System Dynamics Learning Website

## Project Overview
An interactive, bilingual (EN/TH) educational website for learning **System Dynamics (SD)**, **Agent-Based Modeling (ABM)**, and **Hybrid SD+ABM** with an **Economics** focus. Inspired by [Seeing Theory](https://seeing.brown.edu/) (a visual statistics learning site). Hosted free on **GitHub Pages**.

- **Repo**: https://github.com/kritpipatethean-hub/seeing-systems
- **Live site**: https://kritpipatethean-hub.github.io/seeing-systems/
- **Owner GitHub**: `kritpipatethean-hub`

## Tech Stack
- **Pure HTML/CSS/JavaScript** — no build tools, no frameworks
- **D3.js** — for complex interactive visualizations (add via CDN when needed)
- **KaTeX** — for math equations (loaded via CDN in chapter pages)
- **Canvas API** — for animations (hero page particles)
- **SVG** — for diagrams (causal loops, stock-flow)
- **GitHub Pages** — static hosting from `main` branch, root `/`

## Project Structure
```
SD Website/                  ← working directory
├── CLAUDE.md                ← this file
├── index.html               ← landing page (hero + chapter cards)
├── css/style.css            ← all styles (dark theme, responsive)
├── js/
│   ├── main.js              ← navbar, sidebar, hero animation
│   ├── i18n.js              ← bilingual system (EN/TH)
│   └── chapters/
│       └── ch1.js           ← Chapter 1 interactive simulations
├── chapters/
│   ├── ch1/index.html       ← Chapter 1: Thinking in Systems (DONE)
│   ├── ch2/index.html       ← Chapter 2: SD - The Language of Feedback (placeholder)
│   ├── ch3/index.html       ← Chapter 3: SD for Economics (placeholder)
│   ├── ch4/index.html       ← Chapter 4: ABM - Thinking from the Bottom Up (placeholder)
│   ├── ch5/index.html       ← Chapter 5: Agent-Based Computational Economics (placeholder)
│   ├── ch6/index.html       ← Chapter 6: Hybrid SD+ABM Modeling (placeholder)
│   ├── ch7/index.html       ← Chapter 7: Policy Applications (placeholder)
│   └── ch8/index.html       ← Chapter 8: Building Your Own Models (placeholder)
├── data/
│   └── references.json      ← 12 academic paper references (SD + ABM + Econ)
├── assets/images/           ← images (empty for now)
├── input data/              ← source markdown from papers (NOT deployed, in .gitignore)
└── Web_Ex_Pic/              ← reference screenshots (NOT deployed, in .gitignore)
```

## Content Plan (8 Chapters)
Learning flow: Foundations → SD → ABM → Hybrid → Applications → Practice

1. **Thinking in Systems** — Stocks, flows, feedback loops, counterintuitive behavior (Meadows, Forrester) ✅ DONE
2. **SD: The Language of Feedback** — SD methodology, behavior patterns, system archetypes, leverage points (Meadows Ch4-5, Radzicki)
3. **SD for Economics** — Minsky cycles, debt dynamics, disequilibrium economics, financial crisis (Radzicki, Keen)
4. **ABM: Thinking from the Bottom Up** — Agent rules, emergence, Schelling, Game of Life, Simple Economy (Macal/North, Wilensky)
5. **Agent-Based Computational Economics** — ACE, market emergence, path dependence, learning agents (Tesfatsion, Arthur*)
6. **Hybrid SD+ABM Modeling** — 6 hybrid designs, framework, SD-ABM integration (Nguyen et al.)
7. **Policy Applications** — Tobacco tax modeling, SimSmoke Thailand, health impact (Tesche, Levy)
8. **Building Your Own Models** — Modeling process, model type selection, validation, tools (All papers, Meadows Ch7)

*Arthur (2014) referenced conceptually via Tesfatsion + Wilensky (no input data file)

## Bilingual System (i18n)
- All translatable text uses `data-i18n="key"` attributes → looked up in `js/i18n.js` translations object
- For inline bilingual content: `data-i18n-en="English text" data-i18n-th="ภาษาไทย"`
- For HTML content: `data-i18n-html="key"`
- Language preference saved in `localStorage('sd-lang')`
- When adding new content, always add both EN and TH translations

## CSS Design System
- Dark theme: `--bg-dark: #1a1a2e`, `--bg-darker: #16213e`
- Each chapter has a color: `--ch1-color` through `--ch8-color`
- Accent colors: `--accent-1` (red), `--accent-2` (cyan), `--accent-3` (green), `--accent-4` (yellow)
- Interactive containers: `.interactive-container`, `.content-row` (text + interactive side by side)
- Buttons: `.btn-primary`, `.btn-secondary`, `.btn-accent`
- Sliders: styled `input[type="range"]`

## Important Rules

### DO NOT
- **Never delete or modify files outside this project folder** (`SD Website/`)
- **Never delete `input data/` or `Web_Ex_Pic/`** — these are source reference materials
- **Never commit `input data/` or `Web_Ex_Pic/`** to git (they are in .gitignore)
- **Never use frameworks or build tools** — keep it pure HTML/CSS/JS for GitHub Pages simplicity
- **Never break existing working chapters** when adding new ones
- **Never push without confirming with the user first**

### DO
- Always maintain bilingual support (EN + TH) for any new content
- Keep interactive elements working on both desktop and mobile
- Add KaTeX CDN to chapter pages that use math equations
- Test that all relative paths work (chapters are 2 levels deep: `../../css/style.css`)
- Add new papers to `data/references.json` when referencing them
- Follow the existing code style and structure

## Git Workflow
- Git identity: `kritpipatethean-hub` / `kritpipatethean-hub@users.noreply.github.com`
- Remote: `origin` → `https://github.com/kritpipatethean-hub/seeing-systems.git`
- Branch: `main`
- GitHub Pages deploys from `main` branch root

## Adding a New Chapter
1. Create `js/chapters/chN.js` with interactive simulation code
2. Edit `chapters/chN/index.html` — replace placeholder with full content
3. Add translations to `js/i18n.js` for all new text
4. Add references to `data/references.json`
5. Ensure navigation links work (prev/next chapter)
6. Test bilingual switching
