"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import type { Category, Exercise } from "@/src/types"
import CategoryTabs from "@features/exercises/components/category-tabs"
import BodyModel from "@features/body-map/components/body-model"
import ExerciseModal from "@features/exercises/components/exercise-modal"
import FloatingActionButton from "@/components/fisio/floating-action-button"
import RecommendationsSidebar from "@/components/fisio/recommendations-sidebar"
import PatientFloatingActionButton from "@/components/patient/patient-floating-action-button"
import PatientRecommendationsSidebar from "@/components/patient/patient-recommendations-sidebar"
import { Activity } from "lucide-react"

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

export default function PhysiotherapyPlatform() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  const isFisio = session?.user?.role === "FISIOTERAPEUTA"
  const isPatient = session?.user?.role === "PACIENTE"

  const [selectedCategory, setSelectedCategory] = useState<Category>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showRecommendationsSidebar, setShowRecommendationsSidebar] = useState(false)
  const [showPatientSidebar, setShowPatientSidebar] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])

  const handleCloseModal = () => {
    setSelectedZone(null)
    setSelectedExercise(null)
  }

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise)
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-2xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-[family-name:var(--font-poppins)]">
              Plataforma Educativa
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Aprende técnicas fisioterapéuticas profesionales: estiramientos, movilidad y fortalecimiento
          </p>
        </header>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12">
          <CategoryTabs selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        </div>

        {/* Body Model Area */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12">
          <BodyModel selectedCategory={selectedCategory} selectedZone={selectedZone} onZoneSelect={setSelectedZone} />
        </div>
      </div>

      <ExerciseModal
        isOpen={selectedZone !== null}
        onClose={handleCloseModal}
        selectedZone={selectedZone}
        category={selectedCategory}
        selectedExercise={selectedExercise}
        onExerciseSelect={handleExerciseSelect}
        isAdmin={isAdmin}
        onOpenRecommendations={isFisio ? () => setShowRecommendationsSidebar(true) : undefined}
      />

      {/* Floating Action Button (solo para Fisioterapeutas) */}
      <FloatingActionButton
        isVisible={isFisio}
        onClick={() => setShowRecommendationsSidebar(true)}
      />

      {/* Floating Action Button (solo para Pacientes) */}
      <PatientFloatingActionButton
        isVisible={isPatient}
        onClick={() => setShowPatientSidebar(true)}
      />

      {/* Recommendations Sidebar (Fisioterapeutas) */}
      <RecommendationsSidebar
        isOpen={showRecommendationsSidebar}
        onClose={() => setShowRecommendationsSidebar(false)}
        selectedExercise={selectedExercise}
        patients={patients}
        setPatients={setPatients}
      />

      {/* Patient Recommendations Sidebar (Pacientes) */}
      <PatientRecommendationsSidebar
        isOpen={showPatientSidebar}
        onClose={() => setShowPatientSidebar(false)}
        onSelectExercise={handleExerciseSelect}
      />
    </div>
  )
}

