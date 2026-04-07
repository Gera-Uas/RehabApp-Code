import type { Exercise } from "@/src/types"

export interface RecommendationResult {
  exercise: Exercise
  similarityScore: number
  matchReasons: string[]
}

export interface SimilarityWeights {
  metrics: number      // Peso de similitud en métricas (0-1)
  tags: number         // Peso de tags comunes
  muscles: number      // Peso de músculos objetivo
  equipment: number    // Peso de mismo equipamiento
  movementType: number // Peso de tipo de movimiento
}

export const DEFAULT_SIMILARITY_WEIGHTS: SimilarityWeights = {
  metrics: 0.35,
  tags: 0.30,
  muscles: 0.20,
  equipment: 0.10,
  movementType: 0.05,
}
