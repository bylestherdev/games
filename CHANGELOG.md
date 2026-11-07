# Changelog

All notable changes to ByLestherGames are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/)

---

## [1.0.0] - 2026-11-05

### ✨ Added
- **7 Complete Games** — Full collection launched
  - 🤝 Negociación Maestra (Ventas)
  - 🎧 Atención al Cliente Premium (Servicio)
  - 🎯 Cazador de Leads (Prospección)
  - 👥 Líder de Equipo (Liderazgo)
  - 📊 Gestor de Cartera (Ventas)
  - 💡 Desarrollo de Producto (Producto)
  - 🚀 Expansión Internacional (Internacional)

### 🎮 Core Engine
- **TextGame.tsx** — Main game engine (1200+ lines)
  - Phase state machine: `intro → scene → event → feedback → scene → ending`
  - Dynamic round system with narrative constraints (7 rounds)
  - Probabilistic outcome system with BANT scoring
  - Surprise events with branching choices
  - localStorage persistence with auto-save
  - Achievement system with cross-game unlocks
  - Web Share API + image capture (html-to-image)

### 🎨 UI/UX
- Modern terminal-style interface with magenta accent
- Round progress indicator with animated progress bar
- Color-coded stats bars (red <30%, yellow 30-70%, green >70%)
- Enhanced choice buttons with gradients, hover states, animated arrows
- Smooth animations: fadeUp, pulse, translate-x transitions
- Responsive design (mobile-first, 375px+)
- Keyboard shortcuts (1/2/3, Enter, Space, R)

### 🎮 Game Mechanics
- **Dynamic Round Pool** — Fisher-Yates shuffle with narrative constraints (apertura/cierre/alianza fixed, middle 4 shuffled)
- **Probabilistic Outcomes** — BANT-based probabilities (5-95%)
- **Trade-off Choices** — Every decision affects 2-3 stats (up + down)
- **Surprise Events** — 25% chance per round, conditional triggers
- **Achievement System** — Per-game + cross-game unlocks
- **Deterministic PRNG** — Mulberry32 seeded per playthrough

### 🎮 Games Implemented
1. **Negociación Maestra** — 7 rounds vs Verónica Salas, 4 endings
2. **Atención al Cliente Premium** — 2 scenarios (VIP + Enterprise), 7 endings
3. **Cazador de Leads** — 3 scenarios, 8 actions, probabilistic BANT system
4. **Líder de Equipo** — 3 scenarios (Onboarding, Tech Debt, Hypergrowth), 12 endings
5. **Gestor de Cartera** — 2 scenarios (B2B + Enterprise), 8 endings
5. **Desarrollo de Producto** — 3 scenarios (Launch, Growth, Platform), 12 endings
6. **Expansión Internacional** — 3 phases (LATAM, EMEA, APAC), 12 endings

### 📝 Content Quality
- All acronyms explained on first use (B2B, SLA, GDPR, MVP, ARR, etc.)
- Trade-offs explicit in every choice (stats up AND down)
- Acronyms explained in parentheses: `SLA (Service Level Agreement / Acuerdo de Nivel de Servicio)`
- Narrative consequences explained in result text

---

## [0.9.0] - 2026-11-04

### 🎮 Games Added
- **Expansión Internacional** — 3 scenarios (LATAM, EMEA, APAC)
- **Desarrollo de Producto** — 3 scenarios (Launch, Growth, Platform)

### 🔧 Fixes
- Fixed infinite loop in round progression (synchronous state updates)
- Removed conflicting useEffect for round advancement
- Fixed TypeScript errors in TextGame.tsx

---

## [0.8.0] - 2026-11-04

### 🎮 Games Added
- **Gestor de Cartera** — 2 scenarios (B2B + Enterprise)
- **Líder de Equipo** — 3 scenarios (Onboarding, Tech Debt, Hypergrowth)

### 🔧 Fixes
- Fixed infinite loop in round advancement
- Fixed TypeScript strict mode errors
- Improved round progression synchronization

---

## [0.7.0] - 2026-11-04

### 🎮 Games Added
- **Cazador de Leads** — Complete rebalance with probabilistic BANT system
- **Desarrollo de Producto** — Initial version

### 🔧 Fixes
- Removed deterministic "always win" mechanics
- Added probabilistic outcomes based on BANT scoring
- Added lead state machine (nuevo → contactado → calificado → propuesta → negociando → calificado)

---

## [0.6.0] - 2026-11-03

### 🎮 Games Added
- **Negociación Maestra** — 7 rounds vs Verónica Salas
- **Atención al Cliente Premium** — 2 scenarios (VIP + Enterprise)

### 🏗 Core Engine
- TextGame.tsx base engine
- Phase state machine
- localStorage persistence
- Achievement system foundation

---

## [0.1.0] - 2026-11-02

### 🎉 Initial Release
- Project scaffolding (Next.js 16, TypeScript, Tailwind v4)
- TextGame core engine v0.1
- First game: Negociación Maestra
- Static export configuration
- CI/CD pipeline ready

---

*Generated with ❤️ for ByLestherGames*