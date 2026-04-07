// Archivo: features/exercises/hooks/useExerciseRecommendations.ts
// Hook helper para usar SAW fácilmente en componentes

import { useCallback } from 'react'
import { SAWCalculator } from '@/lib/mcdm/saw'
import type { Alternative, Criterion, SAWResult } from '@/lib/mcdm/types'
import type { Exercise } from '@/src/types'
import { useScoringStore } from '@features/exercises/store/scoring'

export interface UseExerciseRecommendationsOptions {
  isMaximizingDifficulty?: boolean // por defecto false (preferir menor)
  isMaximizingDuration?: boolean   // por defecto false (preferir menor)
  isMaximizingEffectiveness?: boolean // por defecto true (preferir mayor)
  isMaximizingFrequency?: boolean // por defecto false (preferir menor)
}

export function useExerciseRecommendations(
  options: UseExerciseRecommendationsOptions = {}
) {
  const { getNormalizedWeights } = useScoringStore()

  const {
    isMaximizingDifficulty = false,
    isMaximizingDuration = false,
    isMaximizingEffectiveness = true,
    isMaximizingFrequency = false,
  } = options

  const calculateRecommendations = useCallback(
    (exercises: Exercise[]): (Exercise & { ranking: number; score: number })[] => {
      if (exercises.length === 0) return []

      const weights = getNormalizedWeights()

      // Crear alternativas
      const alternatives: Alternative[] = exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        scores: {
          difficulty: ex.metrics?.difficulty ?? 5,
          duration: ex.metrics?.duration ?? 10,
          effectiveness: ex.metrics?.effectiveness ?? 3,
          frequency: ex.metrics?.frequency ?? 3,
        },
      }))

      // Definir criterios
      const criteria: Criterion[] = [
        {
          id: 'difficulty',
          name: 'Dificultad',
          weight: weights.difficulty,
          isMaximizing: isMaximizingDifficulty,
        },
        {
          id: 'duration',
          name: 'Duración',
          weight: weights.duration,
          isMaximizing: isMaximizingDuration,
        },
        {
          id: 'effectiveness',
          name: 'Efectividad',
          weight: weights.effectiveness,
          isMaximizing: isMaximizingEffectiveness,
        },
        {
          id: 'frequency',
          name: 'Frecuencia',
          weight: weights.frequency,
          isMaximizing: isMaximizingFrequency,
        },
      ]

      // Calcular SAW
      const saw = new SAWCalculator()
      const results = saw.calculate(alternatives, criteria)

      // Mapear resultados con ejercicios originales
      return results
        .map((result) => {
          const exercise = exercises.find((ex) => ex.id === result.alternativeId)
          return exercise
            ? { ...exercise, ranking: result.ranking, score: result.score }
            : null
        })
        .filter(Boolean) as (Exercise & { ranking: number; score: number })[]
    },
    [getNormalizedWeights, isMaximizingDifficulty, isMaximizingDuration, isMaximizingEffectiveness, isMaximizingFrequency]
  )

  return { calculateRecommendations }
}
