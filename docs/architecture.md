# Architecture Documentation

## Overview

ByLestherGames is a collection of text-based decision RPGs built as a static Next.js application. The core philosophy is **text-first decision making** where every choice has meaningful consequences.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App (SSG)                    │
├─────────────────────────────────────────────────────────────┤
│  app/                                                        │
│  ├── page.tsx              ← Home / Collection              │
│  ├── games/[slug]/page.tsx ← Game pages (dynamic routes)    │
│  └── layout.tsx            ← Root layout + providers        │
├─────────────────────────────────────────────────────────────┤
│  components/                                                │
│  ├── game/TextGame.tsx     ← Main game engine (1200+ lines)│
│  ├── game/Leaderboard.tsx  ← Global rankings                │
│  └── global/               ← Navbar, PerfilJugador          │
├─────────────────────────────────────────────────────────────┤
│  lib/games/                                               │
│  ├── types.ts              ← Shared TypeScript types        │
│  ├── progress.ts           ← localStorage persistence       │
│  ├── achievements.ts       ← Achievement system             │
│  ├── random.ts             ← Deterministic PRNG (Mulberry32)│
│  ├── achievements.ts       ← Achievement definitions        │
│  └── *.ts                  ← Individual game data files     │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Game Engine (`TextGame.tsx`)

### State Machine
```
┌──────┐     ┌──────┐     ┌────────┐     ┌──────┐     ┌────────┐
│ intro│ ──▶ │scene │ ──▶ │feedback│ ──▶ │scene │ ──▶ │ ending │
└──────┘     └──────┘     └────────┘     └──────┘     └────────┘
     ▲                                                  │
     └────────────────── restart ──────────────────────┘
```

### Key State Variables
```typescript
type Phase = "intro" | "scene" | "event" | "feedback" | "ending";

interface GameState {
  phase: Phase;
  sceneId: string;           // Current round identifier
  rondaActual: number;       // 1-7 (chronological)
  poolBarajado: string[];    // Shuffled round types
  stats: Record<string, number>;
  log: DecisionLogEntry[];
  flags: string[];           // Event flags
  eventsDisparados: number;
  currentEvent: GameEvent | null;
  pendingNextSceneId: string;
  eventResultText: string | null;
  feedback: Feedback | null;
  ending: Ending | null;
}
```

---

## Round System (7 Rounds)

### Pool Configuration
```typescript
const POOL = [
  "apertura",        // Fixed: Round 1
  "investigacion",   // Shuffled pool (pick 4)
  "tecnica",
  "precio",
  "contraoferta",
  "cierre",          // Fixed: Round 6
  "alianza",         // Fixed: Round 7
  "riesgo",          // Available for shuffle
  "validacion",
  "sorpresa"
];
```

### Round Constraints
| Position | Constraint | Types Allowed |
|----------|------------|---------------|
| 1        | Fixed      | `apertura`    |
| 2-5      | Shuffled   | 4 from middle pool |
| 6        | Fixed      | `cierre`      |
| 7        | Fixed      | `alianza`     |

### Shuffling Algorithm (Fisher-Yates)
```typescript
const medio = disponibles.filter(t => !Object.values(fijos).includes(t));
for (let i = medio.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [medio[i], medio[j]] = [medio[j], medio[i]];
}
const resultado = [fijos[1], medio[0], medio[1], medio[2], medio[3], fijos[6], fijos[7]];
```

---

## Probabilistic Outcome System

### BANT Scoring
```typescript
const scoreBANT = (presupuesto + necesidad + autoridad + plazo) / 400; // 0-1
const multTemp = temperatura === "hot" ? 1.3 : temperatura === "warm" ? 1.0 : 0.6;
const baseProb = scoreBANT * multTemp * factorAccion;
```

### Action Factors
| Action | Factor | Description |
|--------|--------|-------------|
| `linkedin` | 0.3 | Low impact, relationship building |
| `email` | 0.4 | Information gathering |
| `llamada` | 0.5 | Direct contact |
| `seguimiento` | 0.4 | Maintenance |
| `demo` | 0.7 | High impact, validates need |
| `propuesta` | 0.8 | High commitment |
| `reunión` | 0.9 | Executive engagement |
| `descartar` | 1.0 | Certain outcome (removal) |

### Final Probability
```typescript
probabilidad = Math.min(0.95, Math.max(0.05, baseProb));
```

---

## State Persistence

### Save Structure
```typescript
interface SavedProgress {
  slug: string;
  scope: string;           // Scenario ID
  phase: "scene" | "ending";
  sceneId: string;
  stats: Record<string, number>;
  log: DecisionLogEntry[];
  savedAt: number;
  payload?: unknown;       // Flags, events seen, seeds, etc.
}
```

### Storage Key
```
games:progress:{slug}:{scope}
```

### Auto-Save Triggers
- Phase transitions (`scene` → `feedback` → `scene`)
- Round completion
- Event completion
- Ending reached

---

## Deterministic Randomness (Mulberry32)

```typescript
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashTexto(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
```

### Seed Sources
- Game slug + scenario ID + round number
- Daily leads: `${escenarioId}:${dia.dia}`
- Deterministic per session, varies per playthrough

---

## Types System (`types.ts`)

### Core Interfaces
```typescript
interface Stat {
  key: string;
  label: string;
  icon: string;
  max: number;
  initial?: number;
  format?: "money" | "number";
}

interface Effect {
  stat: string;
  delta: number;
}

interface Choice {
  label: string;
  hint?: string;
  effects: Effect[];
  next: string;
  result: string;
  flag?: string;
}

interface GameEvent {
  id: string;
  titulo: string;
  texto: string;
  icono: string;
  prob: number;
  requiere?: EndingCondition[];
  efectos?: Effect[];
  opciones?: EventChoice[];
  unaVez?: boolean;
}

interface EndingCondition {
  stat: string;
  min?: number;
  max?: number;
}
```

---

## Build Pipeline

### TypeScript Config (Strict)
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

### Next.js Config (Static Export)
```javascript
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};
```

---

## Adding a New Game (Checklist)

1. **Create** `src/lib/games/nuevo-juego.ts` with GameData export
2. **Create** `src/app/games/nuevo-juego/page.tsx`
3. **Add** import + registration in `src/app/page.tsx`
4. **Add** image to `/public/img/nuevo-juego.jpg`
5. **Run** `pnpm tsc --noEmit && pnpm next build`
6. **Commit** with conventional message

---

## Performance Considerations

- **Static Generation**: All pages pre-rendered at build
- **Code Splitting**: Automatic per-route via Next.js
- **Font Optimization**: `next/font` with variable fonts
- **Image Optimization**: Static images in `/public`
- **Bundle Analysis**: `ANALYZE=true pnpm next build`

---

## Monitoring & Analytics

No external analytics by design (privacy-first). Game metrics tracked internally:
- Completion rates per ending rank
- Average rounds played
- Choice distribution
- Replay rate

---

*Architecture v1.0 — Last updated: 2026-11-05*