import type { Exercise } from "@/src/types"
import type { RecommendationResult, SimilarityWeights } from "./types"
import { DEFAULT_SIMILARITY_WEIGHTS } from "./types"

export class ContentBasedRecommender {
  private weights: SimilarityWeights

  constructor(weights: SimilarityWeights = DEFAULT_SIMILARITY_WEIGHTS) {
    this.weights = weights
  }

  /**
   * Calcula similitud Jaccard entre dos arrays
   */
  private jaccardSimilarity(arr1: string[], arr2: string[]): number {
    if (!arr1.length || !arr2.length) return 0

    const set1 = new Set(arr1)
    const set2 = new Set(arr2)
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size
  }

  /**
   * Calcula distancia euclidiana normalizada entre métricas
   */
  private calculateMetricSimilarity(ex1: Exercise, ex2: Exercise): number {
    if (!ex1.metrics || !ex2.metrics) return 0

    // Normalizar valores a escala 0-1
    const diffDifficulty = Math.abs(ex1.metrics.difficulty - ex2.metrics.difficulty) / 10
    const diffDuration = Math.abs(ex1.metrics.duration - ex2.metrics.duration) / 20 // Asumiendo max 20 min
    const diffEffectiveness = Math.abs(ex1.metrics.effectiveness - ex2.metrics.effectiveness) / 5
    const diffFrequency = Math.abs(ex1.metrics.frequency - ex2.metrics.frequency) / 7 // Asumiendo max 7/semana

    // Promedio de similitudes (1 - diferencia)
    const avgSimilarity = (
      (1 - diffDifficulty) +
      (1 - diffDuration) +
      (1 - diffEffectiveness) +
      (1 - diffFrequency)
    ) / 4

    return Math.max(0, avgSimilarity)
  }

  /**
   * Calcula score de similitud total entre dos ejercicios
   */
  private calculateSimilarity(
    source: Exercise,
    target: Exercise
  ): { score: number; reasons: string[] } {
    const reasons: string[] = []
    let totalScore = 0

    // 1. Similitud de métricas (35%)
    const metricSim = this.calculateMetricSimilarity(source, target)
    totalScore += metricSim * this.weights.metrics
    if (metricSim > 0.7) {
      reasons.push("Métricas similares")
    }

    // 2. Similitud de tags (30%)
    if (source.tags && target.tags) {
      const tagSim = this.jaccardSimilarity(source.tags, target.tags)
      totalScore += tagSim * this.weights.tags
      if (tagSim > 0.4) {
        const commonTags = source.tags.filter(t => target.tags?.includes(t))
        reasons.push(`Comparten: ${commonTags.slice(0, 2).join(", ")}`)
      }
    }

    // 3. Similitud de músculos objetivo (20%)
    if (source.targetMuscles && target.targetMuscles) {
      const muscleSim = this.jaccardSimilarity(source.targetMuscles, target.targetMuscles)
      totalScore += muscleSim * this.weights.muscles
      if (muscleSim > 0.3) {
        reasons.push("Músculos relacionados")
      }
    }

    // 4. Mismo equipamiento (10%)
    if (source.equipment && target.equipment) {
      const equipMatch = source.equipment === target.equipment ? 1 : 0
      totalScore += equipMatch * this.weights.equipment
      if (equipMatch && source.equipment !== "sin-equipo") {
        reasons.push(`Usa ${source.equipment}`)
      }
    }

    // 5. Mismo tipo de movimiento (5%)
    if (source.movementType && target.movementType) {
      const movementMatch = source.movementType === target.movementType ? 1 : 0
      totalScore += movementMatch * this.weights.movementType
    }

    return { score: totalScore, reasons }
  }

  /**
   * Encuentra ejercicios similares al ejercicio dado
   * @param sourceExercise - Ejercicio de referencia
   * @param allExercises - Pool de todos los ejercicios disponibles
   * @param topN - Número de recomendaciones a retornar
   * @param excludeSameGroup - Si excluir ejercicios del mismo groupId+category
   */
  findSimilar(
    sourceExercise: Exercise,
    allExercises: Exercise[],
    topN: number = 5,
    excludeSameGroup: boolean = true
  ): RecommendationResult[] {
    const results: RecommendationResult[] = []

    for (const exercise of allExercises) {
      // No recomendar el mismo ejercicio
      if (exercise.id === sourceExercise.id) continue

      const { score, reasons } = this.calculateSimilarity(sourceExercise, exercise)

      // Filtro de score mínimo (30% de similitud)
      if (score >= 0.3) {
        results.push({
          exercise,
          similarityScore: score,
          matchReasons: reasons,
        })
      }
    }

    // Ordenar por score descendente y tomar top N
    return results
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, topN)
  }

  /**
   * Encuentra ejercicios complementarios (diferentes pero beneficiosos)
   * Por ejemplo: si haces estiramiento de cuádriceps, recomienda fortalecimiento de isquiotibiales
   */
  findComplementary(
    sourceExercise: Exercise,
    allExercises: Exercise[],
    topN: number = 3
  ): RecommendationResult[] {
    const complementaryMuscles: Record<string, string[]> = {
      "cuádriceps": ["isquiotibiales", "glúteo-mayor"],
      "isquiotibiales": ["cuádriceps", "glúteo-medio"],
      "pectoral-mayor": ["trapecio-medio", "romboides"],
      "bíceps": ["tríceps"],
      "tríceps": ["bíceps"],
      "flexores-muñeca": ["extensores-muñeca"],
      "extensores-muñeca": ["flexores-muñeca"],
      "gastrocnemio": ["tibial-anterior"],
      "recto-abdominal": ["erector-espinal"],
      "erector-espinal": ["recto-abdominal"],
    }

    const results: RecommendationResult[] = []
    const sourceTargets = sourceExercise.targetMuscles || []

    for (const exercise of allExercises) {
      if (exercise.id === sourceExercise.id) continue

      const targetMuscles = exercise.targetMuscles || []
      let hasComplementary = false

      // Verificar si tiene músculos complementarios
      for (const sourceMuscle of sourceTargets) {
        const complements = complementaryMuscles[sourceMuscle] || []
        if (targetMuscles.some(m => complements.includes(m))) {
          hasComplementary = true
          break
        }
      }

      if (hasComplementary) {
        results.push({
          exercise,
          similarityScore: 0.8, // Score fijo alto para complementarios
          matchReasons: ["Ejercicio complementario", "Equilibra el entrenamiento"],
        })
      }
    }

    return results.slice(0, topN)
  }
}
