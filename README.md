# ByLestherGames — Text RPG Collection

**7 Text-Based Decision Games** built with Next.js 16, TypeScript, and Tailwind CSS v4. Each game simulates a professional/business scenario where every decision has consequences.

🎮 **Play at:** https://games.bylesther.dev

---

## 🎮 Games Collection

| Game | Category | Difficulty | Duration | Description |
|------|----------|------------|----------|-------------|
| 🤝 **Negociación Maestra** | Ventas | ⭐⭐⭐ | 8 min | Negotiate a $120K contract against a tough procurement director |
| 🎧 **Atención al Cliente Premium** | Servicio | ⭐⭐ | 6 min | Crisis management for VIP and Enterprise accounts |
| 🎯 **Cazador de Leads** | Prospección | ⭐⭐⭐ | 12 min | Realistic B2B sales pipeline with BANT qualification |
| 👥 **Líder de Equipo** | Liderazgo | ⭐⭐⭐ | 15 min | Engineering management: hiring, tech debt, scaling |
| 📊 **Gestor de Cartera** | Ventas | ⭐⭐⭐ | 15 min | Account management: retention, expansion, pipeline |
| 💡 **Desarrollo de Producto** | Producto | ⭐⭐⭐ | 18 min | PM simulation: Launch, Growth, Platform phases |
| 🚀 **Expansión Internacional** | Internacional | ⭐⭐⭐ | 20 min | Global expansion: LATAM → EMEA → APAC |

---

## 🎮 How to Play

Each game is a **text-based decision simulator**:

1. **Read the scenario** — Immersive business context
2. **Make choices** — 3 options per decision with trade-offs
3. **See consequences** — Stats change, narrative unfolds
4. **Reach an ending** — Rank S (perfect) to D (failure)
5. **Replay** — Different paths, different outcomes

**No graphics, no grinding — pure decision-making.**

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| State | React hooks + localStorage persistence |
| PRNG | Deterministic Mulberry32 (seeded per game) |
| Build | Static export (SSG) |

---

## 🏗 Architecture

```
src/
├── app/
│   ├── games/[slug]/page.tsx    # Game pages (static routes)
│   ├── page.tsx                 # Home / collection
│   └── layout.tsx               # Root layout
├── components/
│   ├── game/TextGame.tsx        # Core game engine (1200+ lines)
│   └── global/                  # Navbar, PerfilJugador
├── lib/games/
│   ├── types.ts                 # Shared types (Stat, Choice, Event, etc.)
├── lib/games/*.ts               # Game data (scenarios, stats, events, endings)
│   ├── negociacion.ts
│   ├── atencion-cliente.ts
│   ├── cazador-leads.ts
│   ├── lider-equipo.ts
│   ├── gestor-cartera.ts
│   ├── desarrollo-producto.ts
│   └── expansion-internacional.ts
├── lib/games/
│   ├── types.ts                 # Shared types
│   ├── progress.ts              # localStorage persistence
│   ├── achievements.ts          # Achievements system
│   ├── random.ts                # Deterministic PRNG (Mulberry32)
│   └── achievements.ts
└── components/game/TextGame.tsx # Main game engine
```

---

## 🎮 Core Game Engine (`TextGame.tsx`)

### Key Features
- **Dynamic Round System** — 7 rounds with narrative constraints (fixed apertura/cierre/alianza, shuffled middle)
- **Probabilistic Outcomes** — BANT scoring, probabilistic success/failure
- **Dynamic Choices** — Context-aware choices per round type
- **Surprise Events** — Random events with branching choices
- **Persistence** — localStorage save/load with versioning
- **Achievements** — Unlockable across games
- **Sharing** — Web Share API + image capture (html-to-image)

### Phase System
```
intro → scene → (event) → feedback → scene → ... → ending
```

---

## 🎮 Adding a New Game

### 1. Create Game Data (`src/lib/games/nuevo-juego.ts`)

```typescript
import type { GameData, Escenario, Stat, Choice, GameEvent, Ending } from "./types";

const ESCENARIO_EJEMPLO: Escenario = {
  id: "escenario-unico",
  titulo: "Título del Escenario",
  etiqueta: "Categoría",
  contexto: "Contexto narrativo inmersivo...",
  inicio: "apertura",
  stats: [
    { key: "stat1", label: "Stat 1", icon: "📊", max: 100 },
    { key: "stat2", label: "Stat 2", icon: "📈", max: 100 },
    { key: "stat3", label: "Stat 3", icon: "💡", max: 100 },
  ],
  eventos: [/* eventos con opciones ramificadas */],
  poolRondasDisponibles: [
    "apertura", "investigacion", "tecnica", "precio",
    "contraoferta", "cierre", "alianza", "riesgo", "validacion", "sorpresa"
  ],
  finales: [
    { id: "exito", rank: "S", title: "Éxito", conditions: [...], text: "..." },
    { id: "bueno", rank: "A", title: "Bueno", conditions: [...], text: "..." },
    { id: "regular", rank: "B", title: "Regular", conditions: [...], text: "..." },
    { id: "fracaso", rank: "D", title: "Fracaso", text: "..." },
  ],
};

export const nuevoJuego: GameData = {
  slug: "nuevo-juego",
  title: "Título del Juego",
  tagline: "Tagline atractivo",
  icon: "🎯",
  category: "Categoría",
  difficulty: 3, // 1-3
  minutes: 15,
  description: "Descripción para SEO y listado",
  accent: "#HEXCOLOR",
  imagen: "/img/nuevo-juego.jpg",
  escenarioInicial: "escenario-unico",
  escenarios: [ESCENARIO_UNICO],
};
```

### 2. Add Route (`src/app/games/nuevo-juego/page.tsx`)

```tsx
import type { Metadata } from "next";
import TextGame from "@/components/game/TextGame";
import { nuevoJuego } from "@/lib/games/nuevo-juego";

export const metadata: Metadata = { title: nuevoJuego.title };

export default function Page() {
  return <TextGame game={nuevoJuego} />;
}
```

### 3. Register in Home (`src/app/page.tsx`)

```typescript
import { nuevoJuego } from "@/lib/games/nuevo-juego";

export default function HomePage() {
  const games = [/* ...existing */, nuevoJuego];
  // ...
}
```

### 5. Add Image
Place `/public/img/nuevo-juego.jpg` (recommended 1200x630)

---

## 🎯 Designing Good Games

### Core Principles
1. **Every choice has trade-offs** — Stats go up AND down
2. **Probabilistic outcomes** — No deterministic "win buttons"
3. **Narrative consequences** — Text explains *why* stats changed
4. **Meaningful endings** — S/A/B/C/D ranks with distinct narratives

### Stat Design
- 3 stats per scenario (max 100)
- Color-coded thresholds: 🔴 <30% | 🟡 30-70% | 🟢 >70%
- Each choice affects 2-3 stats (trade-offs)

### Round Structure (7 rounds)
```
1. Apertura (fixed)          → Context setting
2-5. Shuffled middle         → Variable challenges
6. Cierre (fixed)            → Decision point
7. Alianza (fixed)           → Long-term outcome
```

### Event System
- 25% base probability per round
- Conditional triggers (stat thresholds)
- Branching choices with stat effects

---

## 🎨 Visual Design System

### Colors
```css
--color-accent-kinetic: #D946EF    /* Primary magenta */
--color-accent-lavender: #C084FC   /* Light purple */
--color-accent-emerald: #10B981    /* Success green */
--color-accent-amber: #F59E0B      /* Warning amber */
--color-canvas: #09090E            /* Deep background */
--color-surface: #13141E           /* Card surface */
--color-border: rgba(255,255,255,0.1)
```

### Typography
- **Serif** (Georgia): Titles, narrative text
- **Mono** (JetBrains Mono): Stats, labels, shortcuts
- **Sans** (Inter): UI, buttons, body

---

## 💾 Persistence & Achievements

### Save System (`lib/games/progress.ts`)
- localStorage with game slug + scenario scope
- Auto-save on phase transitions
- Resume from intro or mid-game

### Achievements (`lib/games/achievements.ts`)
- Per-game unlockables
- Cross-game meta-achievements
- Shareable achievement cards

---

## 🧪 Testing & Quality

```bash
# Type checking
pnpm tsc --noEmit

# Production build
pnpm next build

# Lint
pnpm lint

# Dev server
pnpm dev
```

---

## 🚀 Deployment

```bash
# Static export (SSG)
pnpm next build

# Deploy to Vercel/Netlify/Static hosting
# Output: /out directory
```

---

## 📝 Conventions

### Code Style
- TypeScript strict mode
- Functional components + hooks
- JSDoc for complex functions
- `useCallback`/`useMemo` for stability

### Naming
- Files: `kebab-case.ts` / `PascalCase.tsx`
- Variables: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

### Git
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- Feature branches from `main`
- Squash merge to `main`

---

## 📚 Game Design References

Each game implements these patterns:

| Pattern | Example |
|---------|---------|
| **Trade-off choices** | "Gain Margen +10, lose Relación -8" |
| **Probabilistic outcomes** | "70% success based on BANT score" |
| **State machine** | `intro → scene → feedback → scene → ending` |
| **Narrative consequences** | Text explains *why* stats changed |
| **Progressive disclosure** | Round types revealed progressively |

---

## 📄 License

MIT License — feel free to fork, extend, create new games.

---

*Generated for ByLestherGames — Text RPGs for professional skill building*