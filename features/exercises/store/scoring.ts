import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ScoringWeights {
  difficulty: number      // Importancia de la dificultad
  duration: number        // Importancia de la duración
  effectiveness: number   // Importancia de la efectividad
  frequency: number       // Importancia de la frecuencia
}

interface ScoringStore {
  weights: ScoringWeights
  setWeights: (weights: ScoringWeights) => void
  updateWeight: (criterion: keyof ScoringWeights, value: number) => void
  resetWeights: () => void
  getNormalizedWeights: () => ScoringWeights
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  difficulty: 0.25,
  duration: 0.25,
  effectiveness: 0.35,
  frequency: 0.15,
}

export const useScoringStore = create<ScoringStore>()(
  persist(
    (set, get) => ({
      weights: DEFAULT_WEIGHTS,

      setWeights: (weights: ScoringWeights) => set({ weights }),

      updateWeight: (criterion: keyof ScoringWeights, value: number) =>
        set((state: ScoringStore) => ({
          weights: {
            ...state.weights,
            [criterion]: Math.max(0, Math.min(1, value)),
          },
        })),

      resetWeights: () => set({ weights: DEFAULT_WEIGHTS }),

      getNormalizedWeights: () => {
        const state = get()
        const total = (Object.values(state.weights) as number[]).reduce((a: number, b: number) => a + b, 0)
        if (total === 0) return DEFAULT_WEIGHTS

        return {
          difficulty: state.weights.difficulty / total,
          duration: state.weights.duration / total,
          effectiveness: state.weights.effectiveness / total,
          frequency: state.weights.frequency / total,
        }
      },
    }),
    {
      name: 'scoring-preferences',
    }
  )
)
