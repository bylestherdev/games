# Contributing to ByLestherGames

Thank you for your interest in contributing! This guide explains how to add new games, fix bugs, and improve the platform.

---

## 🎯 Ways to Contribute

1. **Add a new game** — Create a complete text RPG scenario
2. **Fix bugs** — Game logic, UI, text typos
3. **Improve balance** — Adjust stats, probabilities, endings
4. **Enhance UI/UX** — Animations, accessibility, mobile UX
5. **Documentation** — Game guides, architecture docs
5. **Translation** — Spanish/English localization

---

## 🎮 Adding a New Game (Step-by-Step)

### 1. Design Phase

Before coding, define:
- [ ] **Concept**: What professional scenario? What skill does it teach?
- [ ] **3 Stats**: Must have meaningful trade-offs (e.g., Speed vs Quality vs Cost)
- [ ] **7 Round Types**: Use shared pool or custom
- [ ] **3-5 Events**: Surprise events with branching choices
- [ ] **4-5 Endings**: S/A/B/C/D ranks with distinct narratives
- [ ] **Acronyms**: All technical terms explained (SLA → Service Level Agreement / Acuerdo de Nivel de Servicio)

### 2. Create Game Data (`src/lib/games/nuevo-juego.ts`)

```typescript
import type { GameData, Escenario, Stat, Choice, GameEvent, Ending } from "./types";

const MI_ESCENARIO: Escenario = {
  id: "mi-escenario",
  titulo: "Título Descriptivo",
  etiqueta: "Categoría",
  contexto: "Narrativa inmersiva en 2-3 párrafos...",
  inicio: "apertura",
  stats: [
    { key: "stat1", label: "Stat 1", icon: "📊", max: 100 },
    { key: "stat2", label: "Stat 2", icon: "📈", max: 100 },
    { key: "stat3", label: "Stat 3", icon: "💡", max: 100 },
  ],
  eventos: [
    {
      id: "evento-unico",
      titulo: "Evento Sorpresa",
      icono: "⚡",
      prob: 0.3,
      unaVez: true,
      texto: "Narrativa del evento...",
      requiere: [{ stat: "stat1", max: 60 }],
      efectos: [{ stat: "stat1", delta: -10 }],
      opciones: [
        { label: "Opción A", hint: "Trade-off explicado", effects: [{ stat: "stat1", delta: 10 }], resultado: "Resultado narrativo...", next: "next" },
        { label: "Opción B", hint: "Trade-off explicado", effects: [{ stat: "stat2", delta: 10 }], resultado: "Resultado narrativo...", next: "next" },
        { label: "Opción C", hint: "Trade-off explicado", effects: [{ stat: "stat3", delta: 10 }], resultado: "Resultado narrativo...", next: "next" },
      ],
    },
  ],
  poolRondasDisponibles: [
    "apertura", "investigacion", "tecnica", "precio",
    "contraoferta", "cierre", "alianza", "riesgo", "validacion", "sorpresa"
  ],
  finales: [
    { id: "exito", rank: "S", title: "Éxito", conditions: [{ stat: "stat1", min: 70 }], text: "..." },
    { id: "bueno", rank: "A", title: "Bueno", conditions: [{ stat: "stat1", min: 50 }], text: "..." },
    { id: "regular", rank: "B", title: "Regular", conditions: [{ stat: "stat1", min: 30 }], text: "..." },
    { id: "fracaso", rank: "D", title: "Fracaso", text: "..." },
  ],
};

export const miJuego: GameData = {
  slug: "mi-juego",
  title: "Título del Juego",
  tagline: "Tagline memorable",
  icon: "🎯",
  category: "Categoría",
  difficulty: 3, // 1-3
  minutes: 15,
  description: "Descripción para SEO y listado",
  accent: "#HEXCOLOR",
  imagen: "/img/mi-juego.jpg",
  escenarioInicial: "escenario-unico",
  escenarios: [MI_ESCENARIO],
};

export default miJuego;
```

### 2. Create Page Route

**File:** `src/app/games/mi-juego/page.tsx`
```tsx
import type { Metadata } from "next";
import TextGame from "@/components/game/TextGame";
import { miJuego } from "@/lib/games/mi-juego";

export const metadata: Metadata = { title: miJuego.title };

export default function Page() {
  return <TextGame game={miJuego} />;
}
```

### 3. Register in Home Page

Edit `src/app/page.tsx`:
```typescript
import { miJuego } from "@/lib/games/mi-juego";

export default function HomePage() {
  const games = [/* ...existing */, miJuego];
  // ...
}
```

### 5. Add Image
Place `/public/img/mi-juego.jpg` (1200x630 recommended)

### 6. Verify
```bash
pnpm tsc --noEmit
pnpm next build
```

---

## 🎯 Game Design Guidelines

### Stat Design
- **3 stats per scenario** — Enough for trade-offs, not overwhelming
- **Max 100** — Consistent scale
- **Meaningful trade-offs** — Every choice affects 2-3 stats (some up, some down)
- **Color thresholds**: 🔴 <30% | 🟡 30-70% | 🟢 >70%

### Choice Design
```typescript
{
  label: "Acción clara y accionable",
  hint: "Explica el trade-off estratégico en 1 frase",
  effects: [
    { stat: "stat1", delta: +10 },  // Positive
    { stat: "stat2", delta: -5 },   // Negative (trade-off!)
  ],
  result: "Narrativa que explica QUÉ pasó y POR QUÉ",
  next: "next" // or "END" for terminal
}
```

### Event Design
- **Probability**: 25% base per round
- **Conditions**: `requiere: [{ stat: "stat", min: 50 }]`
- **One-time**: `unaVez: true`
- **Branching choices**: 3 options with distinct trade-offs

### Ending Conditions
```typescript
{
  id: "exito",
  rank: "S",
  title: "Título Épico",
  conditions: [
    { stat: "stat1", min: 70 },
    { stat: "stat2", min: 60 }
  ],
  text: "Narrativa épica del final perfecto..."
}
```
**Order matters** — First matching condition wins. Put S first, D last (no conditions = fallback).

---

## 🎨 Writing Style Guide

### Narrative Voice
- **Second person** ("Tú decides", "Te sientas frente a...")
- **Present tense** ("Verónica pone sobre la mesa...")
- **Specific numbers** ("$120K", "Q2", "3 sprints")
- **Named characters** ("Verónica Salas", "Ana Rojas")

### Acronyms Policy
**ALWAYS** explain on first use:
- ✅ `SLA (Service Level Agreement / Acuerdo de Nivel de Servicio)`
- ❌ `SLA` alone

### Trade-off Language
- Use: "Ganas X, pierdes Y"
- Avoid: "Ganas X" (sin coste)
- Explain **why** in result text

---

## 🧪 Testing Checklist

Before submitting PR:
- [ ] `pnpm tsc --noEmit` — No TypeScript errors
- [ ] `pnpm next build` — Production build passes
- [ ] Play through all 3+ paths to each ending
- [ ] Verify stats never exceed 100 or go below 0
- [ ] Check acronyms have explanations
- [ ] Test save/load (refresh mid-game)
- [ ] Test mobile viewport (375px)
- [ ] Verify all 4+ endings reachable
- [ ] Check no console errors

---

## 📝 Commit Convention

```
feat: add new game "X"
fix: fix probability calculation in demo action
refactor: extract round shuffling utility
docs: add architecture documentation
style: improve choice button hover states
test: add unit tests for BANT scoring
```

---

## 🔍 Code Review Focus Areas

Reviewers should check:
- [ ] Stats stay within 0-100 bounds
- [ ] Probabilities clamped 5%-95%
- [ ] No deterministic "always win" paths
- [ ] Acronyms explained on first use
- [ ] Trade-offs clear in hints/results
- [ ] Endings have distinct, satisfying narratives
- [ ] No hardcoded strings that should be constants
- [ ] Accessibility: keyboard navigation, screen readers
- [ ] Mobile: touch targets ≥44px, readable text

---

## 📞 Getting Help

- **Issues**: GitHub Issues for bugs/features
- **Discussions**: Game design questions
- **Discord/Slack**: [Link if available]

---

*Thank you for contributing to ByLestherGames! 🎮*