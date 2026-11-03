export interface Stat {
  key: string;
  label: string;
  icon: string;
  max: number;
  /** Valor inicial; si se omite, arranca en 50% del máximo. */
  initial?: number;
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
  stats: Stat[];
  start: string;
  scenes: Scene[];
  /** Se evalúan en orden; gana la primera que cumple. La última sin condiciones es el fallback. */
  endings: Ending[];
}
