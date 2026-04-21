"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Search, Plus, Trash2, ChevronDown, Heart, Loader2, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Exercise } from "@/src/types"

interface Patient {
  id: string
  name: string
  email: string
  fisioId: string | null
  recommendations?: {
    id: string
    exercises: Array<{
      exerciseId: string
      exercise: {
        id: string
        name: string
      }
    }>
  } | null
}

interface RecommendationsSidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedExercise?: Exercise | null
  patients: Patient[]
  setPatients: (patients: Patient[]) => void
}

export default function RecommendationsSidebar({
  isOpen,
  onClose,
  selectedExercise,
  patients,
  setPatients,
}: RecommendationsSidebarProps) {
  const hasLoadedRef = useRef(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Cargar pacientes al montar el componente (solo una vez)
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      fetchPatients()
    }
  }, [])

  // Limpiar error automáticamente después de 4 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("")
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Buscar pacientes en tiempo real cuando cambia searchQuery
  useEffect(() => {
    if (searchQuery.length > 0) {
      searchPatients()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const fetchPatients = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/fisio/patients")

      if (!response.ok) {
        throw new Error("Error al obtener pacientes")
      }

      const result = await response.json()
      setPatients(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const searchPatients = async () => {
    setIsSearching(true)
    setError("")
    try {
      const response = await fetch(`/api/fisio/search-patients?q=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        console.error('Search error response:', errorData)
        throw new Error(errorData.error || `Error ${response.status} al buscar pacientes`)
      }

      const result = await response.json()
      setSearchResults(result.data || [])
    } catch (err) {
      console.error('Error searching patients:', err)
      setError(err instanceof Error ? err.message : "Error al buscar pacientes")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddPatient = async (patient: Patient) => {
    try {
      // Asignar paciente en la BD
      const response = await fetch('/api/fisio/patients/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(errorData.error || 'Error al asignar paciente')
      }

      // Agregar paciente a la lista local
      if (!patients.find(p => p.id === patient.id)) {
        setPatients([...patients, { ...patient, fisioId: null }])
      }
      setSearchQuery("")
      setShowSearch(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar paciente")
    }
  }

  const handleRemovePatient = async (patientId: string) => {
    const confirmed = confirm("¿Eliminar este paciente del catálogo?")
    if (!confirmed) return

    try {
      // Eliminar del servidor
      const response = await fetch(
        `/api/fisio/patients/${patientId}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(errorData.error || "Error al eliminar paciente")
      }

      // Remover de la lista local
      setPatients(patients.filter(p => p.id !== patientId))
      if (expandedPatient === patientId) {
        setExpandedPatient(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar paciente")
    }
  }

  const handleAddExerciseToPatient = async (patientId: string) => {
    if (!selectedExercise) return

    try {
      const patient = patients.find(p => p.id === patientId)
      if (!patient) return

      // Obtener ejercicios actuales
      const currentExercises = patient.recommendations?.exercises || []

      // Verificar si el ejercicio ya está asignado
      if (currentExercises.some(e => e.exerciseId === selectedExercise.id)) {
        setError(`El ejercicio "${selectedExercise.name}" ya está asignado a este paciente`)
        return
      }

      const allExercises = [
        ...currentExercises,
        { exerciseId: selectedExercise.id, exercise: { id: selectedExercise.id, name: selectedExercise.name } }
      ]

      const payload = {
        patientId,
        exercises: allExercises.map((ex, idx) => ({
          exerciseId: typeof ex === 'object' ? (ex as any).exerciseId || ex.id : ex,
          order: idx + 1
        }))
      }

      const response = await fetch("/api/fisio/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error("Error al agregar ejercicio")
      }

      const result = await response.json()

      // Actualizar lista local
      setPatients(
        patients.map(p =>
          p.id === patientId
            ? {
              ...p,
              recommendations: result.data
            }
            : p
        )
      )

      setError("") // Limpiar errores si había alguno
      alert("Ejercicio agregado exitosamente")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const handleRemoveExerciseFromPatient = async (patientId: string, exerciseIdToRemove: string) => {
    try {
      const patient = patients.find(p => p.id === patientId)
      if (!patient) return

      // Filtrar el ejercicio a eliminar
      const updatedExercises = (patient.recommendations?.exercises || [])
        .filter(e => e.exerciseId !== exerciseIdToRemove)

      const payload = {
        patientId,
        exercises: updatedExercises.map((ex, idx) => ({
          exerciseId: typeof ex === 'object' ? (ex as any).exerciseId || ex.id : ex,
          order: idx + 1
        }))
      }

      const response = await fetch("/api/fisio/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error("Error al eliminar ejercicio")
      }

      const result = await response.json()

      // Actualizar lista local
      setPatients(
        patients.map(p =>
          p.id === patientId
            ? {
              ...p,
              recommendations: result.data
            }
            : p
        )
      )

      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar ejercicio")
    }
  }

  const handleMoveExercise = async (patientId: string, exerciseIndex: number, direction: 'up' | 'down') => {
    try {
      const patient = patients.find(p => p.id === patientId)
      if (!patient) return

      const exercises = patient.recommendations?.exercises || []

      // Validar que el índice es válido
      if (direction === 'up' && exerciseIndex === 0) return
      if (direction === 'down' && exerciseIndex === exercises.length - 1) return

      // Crear copia y intercambiar
      const newExercises = [...exercises]
      const swapIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1
      const temp = newExercises[exerciseIndex]
      newExercises[exerciseIndex] = newExercises[swapIndex]
      newExercises[swapIndex] = temp

      const payload = {
        patientId,
        exercises: newExercises.map((ex, idx) => ({
          exerciseId: typeof ex === 'object' ? (ex as any).exerciseId || ex.id : ex,
          order: idx + 1
        }))
      }

      const response = await fetch("/api/fisio/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error("Error al mover ejercicio")
      }

      const result = await response.json()

      // Actualizar lista local
      setPatients(
        patients.map(p =>
          p.id === patientId
            ? {
              ...p,
              recommendations: result.data
            }
            : p
        )
      )

      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al mover ejercicio")
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 600 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 600 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[700px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-8 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">📋 Catálogo</h2>
                <p className="text-base text-slate-600 mt-1">Mis Pacientes y Ejercicios</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/80 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Content with Scrollbar */}
            <ScrollArea className="flex-1 overflow-hidden">
              <div className="p-8 space-y-5 pr-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Botón Agregar Paciente */}
                <Button
                  onClick={() => setShowSearch(!showSearch)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-base py-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Agregar Paciente
                </Button>

                {/* Search Input */}
                <AnimatePresence>
                  {showSearch && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar paciente..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                          autoFocus
                        />
                      </div>

                      {/* Search Results */}
                      {isSearching ? (
                        <div className="text-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
                          {searchResults.map(patient => (
                            <motion.button
                              key={patient.id}
                              onClick={() => handleAddPatient(patient)}
                              className="w-full text-left p-3 bg-white border border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="font-semibold text-slate-900">{patient.name}</div>
                              <div className="text-xs text-slate-500">{patient.email}</div>
                            </motion.button>
                          ))}
                        </div>
                      ) : searchQuery ? (
                        <p className="text-center text-slate-500 text-sm">No hay resultados</p>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Patients List */}
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No hay pacientes aún</p>
                    <p className="text-sm text-slate-400 mt-2">Agrega pacientes para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patients.map(patient => (
                      <motion.div
                        key={patient.id}
                        className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow"
                        layout
                      >
                        {/* Patient Header */}
                        <div
                          onClick={() => setExpandedPatient(
                            expandedPatient === patient.id ? null : patient.id
                          )}
                          className="w-full p-5 flex items-start justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="text-left flex-1">
                            <div className="font-semibold text-lg text-slate-900">{patient.name}</div>
                            <div className="text-base text-slate-500">{patient.email}</div>
                            {patient.recommendations?.exercises && patient.recommendations.exercises.length > 0 && (
                              <div className="text-sm text-blue-600 mt-2 font-medium">
                                {patient.recommendations.exercises.length} ejercicio(s)
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: expandedPatient === patient.id ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-6 h-6 text-slate-400" />
                            </motion.div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemovePatient(patient.id)
                              }}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </div>

                        {/* Patient Details */}
                        <AnimatePresence>
                          {expandedPatient === patient.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-slate-200 bg-slate-50"
                            >
                              <div className="p-5 space-y-5">
                                {/* Ejercicios Recomendados */}
                                {patient.recommendations?.exercises && patient.recommendations.exercises.length > 0 ? (
                                  <div>
                                    <h4 className="font-semibold text-base text-slate-900 mb-4">
                                      Ejercicios Recomendados:
                                    </h4>
                                    {/* Tabla */}
                                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                      <table className="w-full text-sm">
                                        <thead className="bg-slate-100 border-b border-slate-200">
                                          <tr>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Categoría</th>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Zona</th>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Ejercicio</th>
                                            <th className="text-center px-4 py-3 font-semibold text-slate-700">Acciones</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {patient.recommendations.exercises.map((ex, idx) => {
                                            const category = (ex.exercise as any).group?.category || "N/A"
                                            const zone = (ex.exercise as any).group?.groupId || "N/A"
                                            const categoryLabel = category === "estiramientos" ? "Estiramiento"
                                              : category === "movilidad" ? "Movilidad"
                                              : category === "fortalecimiento" ? "Fortalecimiento"
                                              : category

                                            return (
                                              <tr key={`${ex.exerciseId}-${idx}`} className="border-b border-slate-200 hover:bg-slate-100">
                                                <td className="px-4 py-3">
                                                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    {categoryLabel}
                                                  </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 font-medium">{zone}</td>
                                                <td className="px-4 py-3 font-semibold text-slate-900">{ex.exercise.name}</td>
                                                <td className="px-4 py-3 text-right space-x-2">
                                                  <button
                                                    onClick={() => handleMoveExercise(patient.id, idx, 'up')}
                                                    disabled={idx === 0}
                                                    className="p-2 hover:bg-blue-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-block"
                                                    title="Mover arriba"
                                                  >
                                                    <ArrowUp className="w-4 h-4 text-blue-600" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleMoveExercise(patient.id, idx, 'down')}
                                                    disabled={idx === patient.recommendations.exercises.length - 1}
                                                    className="p-2 hover:bg-blue-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-block"
                                                    title="Mover abajo"
                                                  >
                                                    <ArrowDown className="w-4 h-4 text-blue-600" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleRemoveExerciseFromPatient(patient.id, ex.exerciseId)}
                                                    className="p-2 hover:bg-red-100 rounded transition-colors inline-block"
                                                    title="Eliminar ejercicio"
                                                  >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                  </button>
                                                </td>
                                              </tr>
                                            )
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-base text-slate-500">Sin ejercicios recomendados</p>
                                )}

                                {/* Botón Agregar Ejercicio */}
                                {selectedExercise && (
                                  <motion.button
                                    onClick={() => handleAddExerciseToPatient(patient.id)}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-base"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Heart className="w-5 h-5 fill-current" />
                                    Agregar Ejercicio Actual
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
