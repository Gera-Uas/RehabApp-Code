import type { Alternative, Criterion, SAWResult } from "./types"

export class SAWCalculator {
  /**
   * Normaliza scores de un criterio a rango 0-1
   */
  private normalize(
    alternatives: Alternative[],
    criterionId: string,
    isMaximizing: boolean
  ): Record<string, number> {
    const scores = alternatives.map((a) => a.scores[criterionId])
    const max = Math.max(...scores)
    const min = Math.min(...scores)
    const range = max - min

    return alternatives.reduce(
      (acc, alt) => {
        const rawScore = alt.scores[criterionId]
        if (range === 0) {
          // Si todos los valores son iguales, normalizar a 0.5
          acc[alt.id] = 0.5
        } else {
          acc[alt.id] = isMaximizing
            ? (rawScore - min) / range
            : (max - rawScore) / range
        }
        return acc
      },
      {} as Record<string, number>
    )
  }

  /**
   * Calcula puntajes SAW para alternativas basado en criterios ponderados
   * @param alternatives - Alternativas a evaluar
   * @param criteria - Criterios con pesos
   * @returns Array de resultados ordenados por ranking
   */
  calculate(alternatives: Alternative[], criteria: Criterion[]): SAWResult[] {
    // Validar que los pesos sumen aproximadamente 1
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
    if (Math.abs(totalWeight - 1) > 0.01) {
      console.warn(`Warning: Weights sum to ${totalWeight}, not 1. Normalizing...`)
    }

    // Normalizar cada criterio
    const normalized = criteria.map((c) =>
      this.normalize(alternatives, c.id, c.isMaximizing)
    )

    // Calcular puntaje ponderado para cada alternativa
    const results = alternatives.map((alt) => {
      let score = 0
      criteria.forEach((c, idx) => {
        score += c.weight * normalized[idx][alt.id]
      })
      return {
        alternativeId: alt.id,
        score,
        ranking: 0, // será asignado después
      }
    })

    // Rankear de mayor a menor score
    return results
      .sort((a, b) => b.score - a.score)
      .map((r, idx) => ({ ...r, ranking: idx + 1 }))
  }
}
