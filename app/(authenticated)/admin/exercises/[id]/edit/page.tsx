"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface Exercise {
  id: string
  name: string
  videoUrl: string
  level: string
  movementType: string
  position: string
  equipment: string
  metrics: {
    difficulty: number
    duration: number
    effectiveness: number
    frequency: number
  }
  targetMuscles: string[]
}

export default function EditExercisePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    videoUrl: "",
    level: "principiante",
    movementType: "controlado",
    position: "de_pie",
    equipment: "sin_equipo",
    difficulty: 5,
    duration: 10,
    effectiveness: 4,
    frequency: 3,
    targetMuscles: "",
    tags: "",
  })

  useEffect(() => {
    fetchExercise()
  }, [id])

  const fetchExercise = async () => {
    try {
      const res = await fetch(`/api/exercises/${id}`)
      const data = await res.json()
      const exercise = data.data

      setFormData({
        name: exercise.name,
        videoUrl: exercise.videoUrl,
        level: exercise.level,
        movementType: exercise.movementType,
        position: exercise.position,
        equipment: exercise.equipment,
        difficulty: exercise.metrics?.difficulty || 5,
        duration: exercise.metrics?.duration || 10,
        effectiveness: exercise.metrics?.effectiveness || 4,
        frequency: exercise.metrics?.frequency || 3,
        targetMuscles: Array.isArray(exercise.targetMuscles)
          ? exercise.targetMuscles.join(", ")
          : "",
        tags: "",
      })
    } catch (err) {
      setError("Error al cargar el ejercicio")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("difficulty") || name.includes("duration") || name.includes("effectiveness") || name.includes("frequency")
        ? parseInt(value)
        : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const payload = {
        ...formData,
        targetMuscles: formData.targetMuscles.split(",").map((m) => m.trim()).filter(Boolean),
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }

      const res = await fetch(`/api/admin/exercises/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al actualizar ejercicio")
      }

      router.push("/admin/exercises")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al actualizar ejercicio")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <p className="text-gray-600">Cargando ejercicio...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Editar Ejercicio</h1>
        <p className="mt-2 text-gray-600">Modifica los datos del ejercicio</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-6">
        {/* Nombre */}
        <div>
          <Label htmlFor="name">Nombre del Ejercicio *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Flexiones de brazos"
            className="mt-1"
          />
        </div>

        {/* Video URL */}
        <div>
          <Label htmlFor="videoUrl">URL del Video *</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            type="url"
            required
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="https://youtube.com/..."
            className="mt-1"
          />
        </div>

        {/* Nivel */}
        <div>
          <Label htmlFor="level">Nivel *</Label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>

        {/* Tipo de Movimiento */}
        <div>
          <Label htmlFor="movementType">Tipo de Movimiento *</Label>
          <select
            id="movementType"
            name="movementType"
            value={formData.movementType}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="controlado">Controlado</option>
            <option value="dinamico">Dinámico</option>
            <option value="pendular">Pendular</option>
            <option value="estatico">Estático</option>
            <option value="isometrico">Isométrico</option>
          </select>
        </div>

        {/* Posición */}
        <div>
          <Label htmlFor="position">Posición *</Label>
          <select
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="sentado">Sentado</option>
            <option value="de_pie">De pie</option>
            <option value="cuatro_puntos">Cuatro puntos</option>
            <option value="acostado_supino">Acostado supino</option>
            <option value="acostado_prono">Acostado prono</option>
            <option value="inclinado">Inclinado</option>
          </select>
        </div>

        {/* Equipo */}
        <div>
          <Label htmlFor="equipment">Equipo *</Label>
          <select
            id="equipment"
            name="equipment"
            value={formData.equipment}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="sin_equipo">Sin equipo</option>
            <option value="pared">Pared</option>
            <option value="banda_elastica">Banda elástica</option>
            <option value="pesas_ligeras">Pesas ligeras</option>
          </select>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="difficulty">Dificultad (1-10) *</Label>
            <Input
              id="difficulty"
              name="difficulty"
              type="number"
              min="1"
              max="10"
              required
              value={formData.difficulty}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="duration">Duración (minutos) *</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              min="1"
              required
              value={formData.duration}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="effectiveness">Efectividad (1-5) *</Label>
            <Input
              id="effectiveness"
              name="effectiveness"
              type="number"
              min="1"
              max="5"
              required
              value={formData.effectiveness}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="frequency">Frecuencia (veces/semana) *</Label>
            <Input
              id="frequency"
              name="frequency"
              type="number"
              min="1"
              required
              value={formData.frequency}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>

        {/* Músculos Target */}
        <div>
          <Label htmlFor="targetMuscles">Músculos Target (separados por coma)</Label>
          <textarea
            id="targetMuscles"
            name="targetMuscles"
            value={formData.targetMuscles}
            onChange={handleChange}
            placeholder="Ej: Pecho, tríceps, hombros"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags">Tags (separados por coma)</Label>
          <textarea
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Ej: brazos, fortalecimiento, básico"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>

          <Link href="/admin/exercises">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
