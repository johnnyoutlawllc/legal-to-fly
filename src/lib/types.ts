export type Difficulty = 'easy' | 'medium' | 'hard'

export type Choice = {
  id: string
  label: string
  body: string
  is_correct: boolean
  rationale: string | null
  sort_order: number
  /** Wrong choices only: 1 obvious, 2 plausible, 3 tricky. See lib/difficulty. */
  tier?: number | null
}

export type Question = {
  id: string
  slug: string
  stem: string
  explanation: string
  acs_element_code: string
  difficulty: Difficulty
  citation: string | null
  choices: Choice[]
  figure?: {
    src: string
    label: string
    alt: string
  }
}

export type AcsArea = {
  code: string
  title: string
  weight_min: number
  weight_max: number
  sort_order: number
}

/** Fisher-Yates. */
export function shuffle<T>(input: T[]): T[] {
  const a = [...input]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 'UA.I.B.K21b' -> 'I' */
export function areaFromElement(code: string): string {
  return code.split('.')[1] ?? ''
}
