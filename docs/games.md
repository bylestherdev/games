# Game Guides

Individual documentation for each game in the collection.

---

## 🤝 Negociación Maestra
**File:** `src/lib/games/negociacion.ts`  
**Route:** `/games/negociacion`

### Overview
Single-scenario negotiation simulator vs Verónica Salas, procurement director who beats 38/40 vendors.

### Stats (3)
| Key | Label | Icon | Max |
|-----|-------|------|-----|
| `rel` | Relación | 🤝 | 100 |
| `mar` | Margen | 📈 | 100 |
| `pal` | Palanca | ⚔️ | 100 |

### Mechanics
- 7 fixed rounds with shuffled middle (apertura → investigacion/tecnica/precio/contraoferta/riesgo/validacion/sorpresa → cierre → alianza)
- 1 surprise event (Competencia Baja - 25% chance)
- 4 endings (S/A/B/D)

### Endings
| Rank | Title | Conditions |
|------|-------|------------|
| S | Maestra de la Negociación | rel≥70, mar≥55, pal≥55 |
| A | Cierre Profesional | rel≥50, mar≥40 |
| B | Acuerdo Aceptable | mar≥45 |
| D | Oportunidad Perdida | fallback |

---

## 🎧 Atención al Cliente Premium
**File:** `src/lib/games/atencion-cliente.ts`  
**Route:** `/games/atencion-cliente`

### Scenarios (2)

#### VIP: Crisis de Ana Rojas
**Stats:** Satisfacción / Paciencia / Valor de cuenta ($)
**Events:** Gerente enojado (Slack), Filtración a prensa
**Endings:** 4 (S/A/B/D)

#### Enterprise: Black Friday GlobalCorp
**Stats:** Satisfacción / Paciencia / Valor de cuenta ($)
**Events:** GDPR breach scare, Filtración a prensa
**Endings:** 3 (S/A/D)

---

## 🎯 Cazador de Leads
**File:** `src/lib/games/cazador-leads.ts`  
**Route:** `/games/cazador-leads`

### Scenarios (3)
| Scenario | Meta | Days | Slots/Day | Theme |
|----------|------|------|-----------|-------|
| Semana 1 | $180K | 5 | 3-4 | Onboarding |
| Verano | $280K | 5 | 3-5 | Alta velocidad |
| Enterprise | $500K | 20 (4 weeks) | 2-4 | Ciclo largo |

### Actions (8)
| Action | Cost | States | Description |
|--------|------|--------|-------------|
| `llamada` | 1 slot | nuevo, contactado | Direct contact, high impact if decision-maker |
| `email` | 1 slot | nuevo, contactado | Scalable BANT discovery |
| `linkedin` | 0.5 slot | nuevo | Warm connection, low pressure |
| `demo` | 2 slots | contactado, calificado | Technical validation |
| `propuesta` | 1 slot | calificado, propuesta_enviada, negociando | Formal proposal |
| `seguimiento` | 0.5 slot | contactado, calificado, enfriado | Reactivate/maintain |
| `reunión` | 3 slots | negociando, propuesta_enviada | Executive close |
| `descartar` | 0 | nuevo, contactado, enfriado | Free up slot |

### Lead States
```
nuevo → contactado → calificado → propuesta_enviada → negociando → calificado (cerrado)
                    ↓
               enfriado → (seguimiento 40% reactiva) → contactado
```

### Probabilistic System
- **BANT Score** = (presupuesto + necesidad + autoridad + plazo) / 400
- **Temperatura multiplier**: hot=1.3, warm=1.0, cold=0.6
- **Action factors**: linkedin=0.3, email=0.4, llamada=0.5, demo=0.7, propuesta=0.8, reunión=0.9
- **Final prob** = clamp(5%-95%, BANT × temp × factor)

### Scenarios Details

#### Semana 1 (Onboarding)
- $180K meta, 5 days, 3-4 slots/day
- 15 leads total (3-4/day)
- Daily events: manager pressure, lead cooling

#### Verano (Alta Velocidad)
- $280K meta, 5 days, 3-5 slots/day
- 4-5 leads/day, vacation-mode decision makers
- Competitor pressure

#### Enterprise (Ciclo Largo)
- $500K meta, 20 weeks (4 months)
- 2-4 leads/week, complex stakeholders
- Mapping, discovery, business case, politics

### Finals (5)
| Rank | Title | Conditions |
|------|-------|------------|
| S | Cazador de Élite | pipeline≥350K, calificados≥7, ticket≥45K |
| A | Pipeline de Acero | pipeline≥200K, calificados≥5 |
| B | Cumpliste el Cupo | pipeline≥120K, calificados≥3 |
| C | Semana de Supervivencia | pipeline≥50K |
| D | Cero Pipeline | fallback |

---

## 👥 Líder de Equipo
**File:** `src/lib/games/lider-equipo.ts`  
**Route:** `/games/lider-equipo`

### Scenarios (3)

#### Primer Equipo (Onboarding)
**Stats:** Entrega / Salud / Innovación
**Events:** Senior conflict, Junior burnout, Tech debt explosion
**Finals:** S/A/B/C/D

#### Deuda Técnica (Turnaround)
**Stats:** Estabilidad / Velocidad / Confianza
**Events:** Production outage, Refactor rebellion
**Finals:** S/A/B/D

#### Hipercrecimiento (Scaling 6→30)
**Stats:** Hiring / Cultura / Ejecución
**Events:** Culture clash, Bad hire
**Finals:** S/A/B/D

---

## 📊 Gestor de Cartera
**File:** `src/lib/games/gestor-cartera.ts`  
**Route:** `/games/gestor-cartera`

### Scenarios (2)

#### Cartera B2B (20 cuentas)
**Stats:** Retención / Expansión / Pipeline
**Events:** Churn risk, Upsell opportunity, Competitor attack
**Finals:** S/A/B/D

#### Cartera Enterprise (5 Whales)
**Stats:** Forecast / Relaciones / Cerrados
**Events:** Champion leaves, M&A surprise
**Finals:** S/A/B/D

---

## 💡 Desarrollo de Producto
**File:** `src/lib/games/desarrollo-producto.ts`  
**Route:** `/games/desarrollo-producto`

### Scenarios (3)

#### PM Launch (0→1)
**Stats:** Adopción / Calidad / Velocidad
**Events:** Founder scope creep, Competitor launch, Tech debt crisis
**Finals:** S/A/B/D

#### PM Growth (10K→100K)
**Stats:** Activación / Retención / Viralidad
**Events:** Activation wall, Churn spike
**Finals:** S/A/B/D

#### PM Platform (Producto→Plataforma)
**Stats:** Adopción Dev / Estabilidad API / Ecosistema $
**Events:** Breaking change v2.0, Competitor free platform
**Finals:** S/A/B/D

---

## 📊 Gestor de Cartera
**File:** `src/lib/games/gestor-cartera.ts`  
**Route:** `/games/gestor-cartera`

### Scenarios (2)

#### Cartera B2B (20 cuentas)
**Stats:** Retención / Expansión / Pipeline
**Events:** Churn risk, Upsell opportunity, Competitor attack
**Finals:** S/A/B/D

#### Cartera Enterprise (5 Whales)
**Stats:** Forecast / Relaciones / Cerrados
**Events:** Champion leaves, M&A surprise
**Finals:** S/A/B/D

---

## 🚀 Expansión Internacional
**File:** `src/lib/games/expansion-internacional.ts`  
**Route:** `/games/expansion-internacional`

### Scenarios (3)

#### LATAM (Primer Mercado)
**Stats:** Penetración / Confianza / Eficiencia
**Events:** Local competitor, Regulatory surprise (SAT/CFDI), CM resignation
**Finals:** S/A/B/D

#### EMEA (Europa Fragmentada)
**Stats:** Cobertura / Compliance / ROI
**Events:** GDPR near-breach, Brexit fallout
**Finals:** S/A/B/D

#### APAC (Última Frontera)
**Stats:** Localización / Red / Paciencia
**Events:** Japan distributor trap, China IP risk
**Finals:** S/A/B/D