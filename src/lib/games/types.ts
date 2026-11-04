export interface Stat {
  key: string;
  label: string;
  icon: string;
  max: number;
  /** Valor inicial; si se omite, arranca en 50% del máximo. */
  initial?: number;
  /** "money" muestra el valor como pesos chilenos ($48.000). */
  format?: "money" | "number";
}

export interface Effect {
  stat: string;
  delta: number;
}

export interface Choice {
  label: string;
  hint?: string;
  effects: Effect[];
  next: string;
  result: string;
  /** Marca opcional que queda registrada y puede desbloquear logros. */
  flag?: string;
}

/** Tipo de ronda dentro de la baraja dinámica */
export type RoundType =
  | "apertura"
  | "investigacion"
  | "tecnica"
  | "precio"
  | "contraoferta"
  | "cierre"
  | "alianza"
  | "riesgo"
  | "validacion"
  | "sorpresa";

/** Configuración de una ronda del mazo */
export interface RoundConfig {
  type: RoundType;
  title: string;
  text: string[];
  choices: Choice[];
  positionRestrictions: {
    minPosition: number;
    maxPosition: number;
    requiredStats?: { stat: string; min: number };
    forbiddenAfter?: RoundType[];
  };
}

export interface Scene {
  id: string;
  chapter: string;
  title: string;
  text: string[];
  choices: Choice[];
}

export interface EndingCondition {
  stat: string;
  min?: number;
  max?: number;
}

export interface Ending {
  id: string;
  rank: "S" | "A" | "B" | "C" | "D";
  title: string;
  text: string;
  /** Todas las condiciones deben cumplirse (AND). Sin condiciones = fallback. */
  conditions?: EndingCondition[];
}

/** Opción ofrecida dentro de un evento inesperado. */
export interface EventChoice {
  label: string;
  hint?: string;
  effects: Effect[];
  resultado: string;
}

/**
 * Evento inesperado: algo que pasa en la vida real y cambia el juego
 * (una lesión, una caída del mercado, un cliente que se pone nervioso).
 */
export interface GameEvent {
  id: string;
  titulo: string;
  texto: string;
  icono: string;
  /** Probabilidad de disparo (0 a 1). */
  prob: number;
  /** Solo puede dispararse si se cumplen estas condiciones sobre los stats. */
  requiere?: EndingCondition[];
  /** Efectos aplicados al dispararse el evento. */
  efectos?: Effect[];
  /** Si tiene opciones, el jugador decide cómo responder. */
  opciones?: EventChoice[];
  /** Un evento de un solo uso no se repite en la misma partida. */
  unaVez?: boolean;
}

/** Un escenario es una partida base distinta (cliente, campaña, semana). */
export interface Escenario {
  id: string;
  titulo: string;
  contexto: string;
  /** Etiqueta corta del escenario (ej: "Incidente"). */
  etiqueta: string;
  /** Id de la escena inicial. */
  inicio: string;
  stats: Stat[];
  escenas: Scene[];
  eventos: GameEvent[];
  finales: Ending[];
  /** Pool de tipos de ronda disponibles para la baraja dinámica (10 tipos). */
  poolRondasDisponibles: RoundType[];
}

export interface GameData {
  slug: string;
  title: string;
  tagline: string;
  icon: string;
  category: string;
  difficulty: 1 | 2 | 3;
  minutes: number;
  description: string;
  accent: string;
  /** Ruta de la imagen de portada en /public. */
  imagen?: string;
  escenarioInicial: string;
  escenarios: Escenario[];
}
