"use client"

import { useState, useEffect, useRef } from "react"
import { Play } from "lucide-react"
import type { Exercise } from "@/src/types"
import type { ExerciseData } from "@/src/types"
import { RecommendedExercises } from "@features/exercises/components/recommended-exercises"

interface ExercisePlayerProps {
  exercise: Exercise
  exerciseData: ExerciseData
  onExerciseSelect?: (exercise: Exercise) => void
  onScrollToTop?: () => void
}

export default function ExercisePlayer({ exercise, exerciseData, onExerciseSelect, onScrollToTop }: ExercisePlayerProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      let videoId = urlObj.searchParams.get("v")
      if (!videoId && urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1)
      }
      return videoId
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (exercise?.videoUrl) {
      const videoId = getYouTubeVideoId(exercise.videoUrl)
      if (videoId) {
        // Use YouTube thumbnail API - maxresdefault or hqdefault as fallback
        const url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        setThumbnailUrl(url)
      } else {
        setThumbnailUrl(null)
      }
    } else {
      setThumbnailUrl(null)
    }
  }, [exercise])

  // Scroll al inicio cuando cambia el ejercicio
  useEffect(() => {
    if (onScrollToTop) {
      onScrollToTop()
    }
  }, [exercise.id, onScrollToTop])

  const openVideo = () => {
    if (exercise?.videoUrl) {
      window.open(exercise.videoUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-center mb-2">
        <h3 className="text-2xl font-bold text-slate-900 text-center">
          {exercise.name}
        </h3>
      </div>


      {/* YouTube Thumbnail Display */}
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden aspect-video flex items-center justify-center border-2 border-slate-200 cursor-pointer group" onClick={openVideo}>
        {thumbnailUrl ? (
          <>
            <img
              src={thumbnailUrl}
              alt={`${exercise.name} miniatura`}
              className="w-full h-full object-cover group-hover:brightness-75 transition-all"
            />
            {/* YouTube Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-red-600 rounded-full p-4 group-hover:bg-red-700 transition-colors shadow-lg">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </>
        ) : (
          <div className="text-slate-400 text-sm">Miniatura no disponible</div>
        )}
      </div>

      {/* Métricas del ejercicio */}
      {exercise.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-600 font-medium mb-1">Dificultad</p>
            <p className="text-lg font-bold text-blue-900">{exercise.metrics.difficulty}/10</p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-xs text-green-600 font-medium mb-1">Duración</p>
            <p className="text-lg font-bold text-green-900">{exercise.metrics.duration}m</p>
          </div>
          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-xs text-orange-600 font-medium mb-1">Efectividad</p>
            <p className="text-lg font-bold text-orange-900">{exercise.metrics.effectiveness}/5</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-xs text-purple-600 font-medium mb-1">Frecuencia</p>
            <p className="text-lg font-bold text-purple-900">{exercise.metrics.frequency}/sem</p>
          </div>
        </div>
      )}

      {/* Tags y detalles */}
      {exercise.tags && exercise.tags.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Características:</p>
          <div className="flex flex-wrap gap-2">
            {exercise.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones basadas en contenido */}
      {onExerciseSelect && (
        <RecommendedExercises 
          currentExercise={exercise} 
          onExerciseSelect={onExerciseSelect}
          onScrollToTop={onScrollToTop}
        />
      )}
    </div>
  )
}
