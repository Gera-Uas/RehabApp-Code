"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2 } from "lucide-react"
import type { Category, Exercise } from "@/src/types"
import BODY_ZONES from "@/src/data/bodyZones"
import { Button } from "@/components/ui/button"

interface ExerciseFormDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedZone: string | null
  zoneName: string
  category: Category
  exercise?: Exercise | null
  onSuccess: () => void
}

export default function ExerciseFormDialog({
  isOpen,
  onClose,
  selectedZone,
  zoneName,
  category,
  exercise,
  onSuccess,
}: ExerciseFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const isEditing = !!exercise

  const [formData, setFormData] = useState({
    name: exercise?.name || "",
    videoUrl: exercise?.videoUrl || "",
    level: (exercise?.level as string) || "principiante",
    movementType: (exercise?.movementType as string) || "controlado",
    position: (exercise?.position as string) || "de_pie",
    equipment: (exercise?.equipment as string) || "sin_equipo",
    difficulty: exercise?.metrics?.difficulty || 5,
    duration: exercise?.metrics?.duration || 10,
    effectiveness: exercise?.metrics?.effectiveness || 3,
    frequency: exercise?.metrics?.frequency || 3,
    targetMuscles: exercise?.targetMuscles?.join(", ") || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Convertir selectedZone a groupId igual que en el modal
      const zoneConfig = selectedZone ? BODY_ZONES[selectedZone] : null
      const groupId = zoneConfig?.group || selectedZone

      const payload = {
        name: formData.name,
        videoUrl: formData.videoUrl,
        level: formData.level,
        movementType: formData.movementType,
        position: formData.position,
        equipment: formData.equipment,
        metrics: {
          difficulty: formData.difficulty,
          duration: formData.duration,
          effectiveness: formData.effectiveness,
          frequency: formData.frequency,
        },
        targetMuscles: formData.targetMuscles
          .split(",")
          .map(m => m.trim())
          .filter(m => m),
        ...(isEditing ? {} : { groupId, category }),
      }

      const response = await fetch(
        isEditing ? `/api/exercises/${exercise!.id}` : "/api/exercises",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al guardar el ejercicio")
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-violet-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {isEditing ? "Editar Ejercicio" : "Crear Nuevo Ejercicio"}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {zoneName} • {category}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/80 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Nombre del Ejercicio
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Estiramientos de biceps"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    URL del Video
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Propiedades del Ejercicio */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Nivel
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="principiante">Principiante</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Tipo de Movimiento
                    </label>
                    <select
                      name="movementType"
                      value={formData.movementType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="controlado">Controlado</option>
                      <option value="dinamico">Dinámico</option>
                      <option value="pendular">Pendular</option>
                      <option value="estatico">Estático</option>
                      <option value="isometrico">Isométrico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Posición
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="sentado">Sentado</option>
                      <option value="de_pie">De Pie</option>
                      <option value="cuatro_puntos">Cuatro Puntos</option>
                      <option value="acostado_supino">Acostado Supino</option>
                      <option value="acostado_prono">Acostado Prono</option>
                      <option value="inclinado">Inclinado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Equipo
                    </label>
                    <select
                      name="equipment"
                      value={formData.equipment}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="sin_equipo">Sin Equipo</option>
                      <option value="pared">Pared</option>
                      <option value="banda_elastica">Banda Elástica</option>
                      <option value="pesas_ligeras">Pesas Ligeras</option>
                    </select>
                  </div>
                </div>

                {/* Métricas SAW */}
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Métricas (para algoritmo SAW)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Dificultad (1-10)
                      </label>
                      <input
                        type="range"
                        name="difficulty"
                        min="1"
                        max="10"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="w-full"
                      />
                      <span className="text-sm text-slate-600">{formData.difficulty}/10</span>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Duración (minutos)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        min="1"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Efectividad (1-5)
                      </label>
                      <input
                        type="range"
                        name="effectiveness"
                        min="1"
                        max="5"
                        value={formData.effectiveness}
                        onChange={handleChange}
                        className="w-full"
                      />
                      <span className="text-sm text-slate-600">{formData.effectiveness}/5</span>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Frecuencia (veces/semana)
                      </label>
                      <input
                        type="number"
                        name="frequency"
                        min="1"
                        value={formData.frequency}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Músculos Objetivo */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Músculos Objetivo (separados por comas)
                  </label>
                  <textarea
                    name="targetMuscles"
                    value={formData.targetMuscles}
                    onChange={handleChange}
                    placeholder="Ej: bíceps, hombro, pecho"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <Button
                onClick={onClose}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !formData.name}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Actualizar" : "Crear"} Ejercicio
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
