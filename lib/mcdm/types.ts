export interface Criterion {
  id: string
  name: string
  weight: number // 0-1, suma total debe ser 1
  isMaximizing: boolean // true: mayor es mejor, false: menor es mejor
}

export interface Alternative {
  id: string
  name: string
  scores: Record<string, number> // criterion.id -> score
}

export interface SAWResult {
  alternativeId: string
  score: number
  ranking: number
}
