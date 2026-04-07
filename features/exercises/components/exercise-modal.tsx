"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, Settings } from "lucide-react"
import type { Category, Exercise, ExerciseData } from "@/src/types"
import mockExercises from "../data/mockExercises.json"
import BODY_ZONES from "@/src/data/bodyZones"
import ExercisePlayer from "@features/exercises/components/exercise-player"
import { SAWCalculator } from "@/lib/mcdm/saw"
import type { Criterion, Alternative } from "@/lib/mcdm/types"
import { useScoringStore } from "@features/exercises/store/scoring"
import { ScoringPreferences } from "@features/exercises/components/scoring-preferences"

interface ExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  selectedZone: string | null
  category: Category
  selectedExercise: Exercise | null
  onExerciseSelect: (exercise: Exercise) => void
}

export default function ExerciseModal({
  isOpen,
  onClose,
  selectedZone,
  category,
  selectedExercise,
  onExerciseSelect,
}: ExerciseModalProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [zoneName, setZoneName] = useState<string>("")
  const [zoneData, setZoneData] = useState<ExerciseData | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [rankedExercises, setRankedExercises] = useState<Map<string, number>>(new Map())
  const { getNormalizedWeights, weights } = useScoringStore()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Always run when selectedZone or category change to keep state in sync
    if (selectedZone && category) {
      const zoneConfig = BODY_ZONES[selectedZone]
      const groupId = zoneConfig?.group || selectedZone

      const found = (mockExercises as ExerciseData[]).find(
        (data) => data.groupId === groupId && data.category === category,
      )

      if (found) {
        setExercises(found.exercises)
        setZoneData(found)
        setZoneName(zoneConfig?.name || selectedZone)
        // Calcular ranking con SAW
        calculateRanking(found.exercises)
      } else {
        setExercises([])
        setZoneData(null)
        setZoneName(zoneConfig?.name || selectedZone)
        setRankedExercises(new Map())
      }
    } else {
      setExercises([])
      setZoneData(null)
      setZoneName("")
      setRankedExercises(new Map())
    }
  }, [selectedZone, category])

  const calculateRanking = useCallback((exercisesList: Exercise[]) => {
    const normalizedWeights = getNormalizedWeights()

    // Crear alternativas desde ejercicios
    const alternatives: Alternative[] = exercisesList.map((ex) => ({
      id: ex.id,
      name: ex.name,
      scores: {
        difficulty: ex.metrics?.difficulty || 5,
        duration: ex.metrics?.duration || 10,
        effectiveness: ex.metrics?.effectiveness || 3,
        frequency: ex.metrics?.frequency || 3,
      },
    }))

    // Definir criterios
    const criteria: Criterion[] = [
      {
        id: "difficulty",
        name: "Dificultad",
        weight: normalizedWeights.difficulty,
        isMaximizing: false, // menor dificultad es mejor
      },
      {
        id: "duration",
        name: "Duración",
        weight: normalizedWeights.duration,
        isMaximizing: false, // menos tiempo es mejor
      },
      {
        id: "effectiveness",
        name: "Efectividad",
        weight: normalizedWeights.effectiveness,
        isMaximizing: true, // más efectivo es mejor
      },
      {
        id: "frequency",
        name: "Frecuencia",
        weight: normalizedWeights.frequency,
        isMaximizing: false, // menos frecuencia es mejor
      },
    ]

    // Calcular SAW
    const saw = new SAWCalculator()
    const results = saw.calculate(alternatives, criteria)

    // Crear mapa de id -> ranking
    const rankingMap = new Map(results.map((r) => [r.alternativeId, r.ranking]))
    setRankedExercises(rankingMap)
  }, [getNormalizedWeights])

  // Recalcular ranking cuando cambien los pesos
  useEffect(() => {
    if (exercises.length > 0) {
      calculateRanking(exercises)
    }
  }, [weights, exercises, calculateRanking])

  useEffect(() => {
    if (!isOpen) {
      setShowPlayer(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedExercise) {
      setShowPlayer(true)
    }
  }, [selectedExercise])

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showPlayer) {
          setShowPlayer(false)
        } else {
          onClose()
        }
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, showPlayer, onClose])

  const handleBackToList = () => {
    setShowPlayer(false)
  }

  const handleScrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[85vh] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-violet-50">
              <div className="flex items-center gap-3">
                {showPlayer && (
                  <button
                    onClick={handleBackToList}
                    className="p-2 hover:bg-white/80 rounded-xl transition-colors"
                    aria-label="Volver a la lista"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-poppins)]">
                    {zoneName}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 capitalize">{category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="p-2 hover:bg-white/80 rounded-xl transition-colors"
                  aria-label="Preferencias de scoring"
                >
                  <Settings className="w-6 h-6 text-slate-600" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/80 rounded-xl transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div ref={contentRef} className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {showPreferences ? (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6"
                  >
                    <ScoringPreferences onClose={() => setShowPreferences(false)} />
                  </motion.div>
                ) : !showPlayer ? (
                  <motion.div
                    key="exercise-list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6"
                  >
                    {exercises.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-slate-600">No hay ejercicios disponibles para esta zona.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {[...exercises]
                          .sort((a, b) => {
                            const rankA = rankedExercises.get(a.id) || 999
                            const rankB = rankedExercises.get(b.id) || 999
                            return rankA - rankB
                          })
                          .map((exercise) => {
                          const ranking = rankedExercises.get(exercise.id)
                          return (
                            <motion.button
                              key={exercise.id}
                              onClick={() => onExerciseSelect(exercise)}
                              className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left ${
                                selectedExercise?.id === exercise.id
                                  ? "border-cyan-500 bg-cyan-50 shadow-md"
                                  : "border-slate-200 bg-white hover:border-cyan-300 hover:shadow-sm"
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  {ranking && (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold">
                                      #{ranking}
                                    </span>
                                  )}
                                  <h3 className="font-semibold text-slate-900">{exercise.name}</h3>
                                </div>
                                {exercise.metrics && (
                                  <div className="flex gap-4 text-xs text-slate-500">
                                    <span>Duración: {exercise.metrics.duration}m</span>
                                    <span>Dificultad: {exercise.metrics.difficulty}/10</span>
                                    <span>Efectividad: {exercise.metrics.effectiveness}/5</span>
                                    <span>Frecuencia: {exercise.metrics.frequency}/sem</span>
                                  </div>
                                )}
                              </div>
                              <ChevronRight
                                className={`w-5 h-5 transition-colors flex-shrink-0 ${
                                  selectedExercise?.id === exercise.id ? "text-cyan-600" : "text-slate-400"
                                }`}
                              />
                            </motion.button>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="exercise-player"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {selectedExercise && zoneData && (
                      <ExercisePlayer 
                        exercise={selectedExercise} 
                        exerciseData={zoneData}
                        onExerciseSelect={onExerciseSelect}
                        onScrollToTop={handleScrollToTop}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
