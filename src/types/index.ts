export type Category = "estiramientos" | "movilidad" | "fortalecimiento" | null

export interface ExerciseMetrics {
  difficulty: number      // 1-10
  duration: number        // minutos
  effectiveness: number   // 1-5
  frequency: number       // veces/semana
}

export interface  Exercise {
  id: string
  name: string
  imageSet: string
  videoUrl: string
  steps: number
  metrics?: ExerciseMetrics
  // Campos para filtrado por contenido
  tags?: string[]
  equipment?: string
  targetMuscles?: string[]
  movementType?: string
  level?: "principiante" | "intermedio" | "avanzado"
  position?: string
}

export interface ExerciseData {
  groupId: string
  zoneId?: string
  category: Category
  exercises: Exercise[]
}

export interface BodyZone {
  id: string
  name: string
  type: "joint" | "muscle" | "limb"
}
