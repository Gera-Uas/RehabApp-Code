"use client"

import { useMemo, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, TrendingUp } from "lucide-react"
import type { Exercise } from "@/src/types"
import { ContentBasedRecommender } from "@/lib/recommendations/content-based"

interface RecommendedExercisesProps {
  currentExercise: Exercise
  onExerciseSelect: (exercise: Exercise) => void
  onScrollToTop?: () => void
}

export function RecommendedExercises({ currentExercise, onExerciseSelect, onScrollToTop }: RecommendedExercisesProps) {
  const [allExercises, setAllExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all exercises from API
  useEffect(() => {
    const fetchAllExercises = async () => {
      try {
        const response = await fetch('/api/exercises?limit=200', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch exercises')
        }

        const result = await response.json()
        setAllExercises(result.data || [])
      } catch (error) {
        console.error('Error fetching exercises:', error)
        setAllExercises([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllExercises()
  }, [])

  const recommendations = useMemo(() => {
    if (allExercises.length === 0) {
      return { similar: [], complementary: [] }
    }

    // Calcular recomendaciones
    const recommender = new ContentBasedRecommender()
    const similar = recommender.findSimilar(currentExercise, allExercises, 3)
    const complementary = recommender.findComplementary(currentExercise, allExercises, 2)

    return { similar, complementary }
  }, [currentExercise.id, allExercises])

  if (recommendations.similar.length === 0 && recommendations.complementary.length === 0) {
    return null
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Ejercicios Similares */}
      {recommendations.similar.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-cyan-600" />
            <h3 className="text-lg font-semibold text-slate-900">Ejercicios Relacionados</h3>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Basado en las características de este ejercicio
          </p>
          <div className="grid gap-3">
            {recommendations.similar.map((rec) => (
              <motion.button
                key={rec.exercise.id}
                onClick={() => {
                  if (onScrollToTop) onScrollToTop()
                  onExerciseSelect(rec.exercise)
                }}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-cyan-300 hover:shadow-sm transition-all text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100">
                      <span className="text-xs font-bold text-cyan-700">
                        {Math.round(rec.similarityScore * 100)}%
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900">{rec.exercise.name}</h4>
                  </div>
                  {rec.matchReasons.length > 0 && (
                    <p className="text-xs text-slate-500">
                      {rec.matchReasons.join(" • ")}
                    </p>
                  )}
                  {rec.exercise.metrics && (
                    <div className="flex gap-3 mt-2 text-xs text-slate-400">
                      <span>Duración: {rec.exercise.metrics.duration}m</span>
                      <span>Dificultad: {rec.exercise.metrics.difficulty}/10</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {rec.exercise.level && (
                    <span className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-600 capitalize">
                      {rec.exercise.level}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Ejercicios Complementarios */}
      {recommendations.complementary.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            <h3 className="text-lg font-semibold text-slate-900">Ejercicios Complementarios</h3>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Para equilibrar tu entrenamiento
          </p>
          <div className="grid gap-3">
            {recommendations.complementary.map((rec) => (
              <motion.button
                key={rec.exercise.id}
                onClick={() => {
                  if (onScrollToTop) onScrollToTop()
                  onExerciseSelect(rec.exercise)
                }}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-violet-200 bg-violet-50/50 hover:border-violet-300 hover:shadow-sm transition-all text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">{rec.exercise.name}</h4>
                  <p className="text-xs text-violet-700 mb-2">
                    {rec.matchReasons.join(" • ")}
                  </p>
                  {rec.exercise.metrics && (
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span>Duración: {rec.exercise.metrics.duration}m</span>
                      <span>Dificultad: {rec.exercise.metrics.difficulty}/10</span>
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
