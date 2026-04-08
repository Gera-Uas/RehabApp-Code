"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Exercise {
  id: string
  name: string
  level: string
  movementType: string
  position: string
  equipment: string
}

export default function ExercisesPage() {
  const { data: session } = useSession()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    try {
      const res = await fetch("/api/exercises?limit=100")
      const data = await res.json()
      setExercises(data.data || [])
    } catch (err) {
      setError("Error al cargar ejercicios")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este ejercicio?")) return

    try {
      const res = await fetch(`/api/admin/exercises/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setExercises(exercises.filter((e) => e.id !== id))
      } else {
        setError("Error al eliminar ejercicio")
      }
    } catch (err) {
      setError("Error al eliminar ejercicio")
      console.error(err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Gestionar Ejercicios</h1>
          <p className="mt-2 text-gray-600">
            Crea, edita y elimina ejercicios en el sistema
          </p>
        </div>

        <Link href="/admin/exercises/create">
          <Button className="bg-green-600 hover:bg-green-700">
            + Crear Nuevo Ejercicio
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando ejercicios...</p>
        </div>
      ) : exercises.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">No hay ejercicios aún</p>
        </Card>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Movimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posición
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exercises.map((exercise) => (
                  <tr key={exercise.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {exercise.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {exercise.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {exercise.movementType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {exercise.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {exercise.equipment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/admin/exercises/${exercise.id}/edit`}>
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(exercise.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link href="/admin">
          <Button variant="outline">← Volver al Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
