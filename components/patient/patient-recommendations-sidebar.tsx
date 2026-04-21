"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Exercise } from "@/src/types";

interface RecommendedExercise {
  exerciseId: string;
  order: number;
  exercise: {
    id: string;
    name: string;
    videoUrl?: string;
    level?: string;
    movementType?: string;
    position?: string;
    equipment?: string;
    metrics?: any;
    targetMuscles?: any;
    group?: {
      category: string;
      groupId: string;
    };
  };
}

interface PatientRecommendationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (data: { exercise: any; zone: string; category: string }) => void;
}

export default function PatientRecommendationsSidebar({
  isOpen,
  onClose,
  onSelectExercise,
}: PatientRecommendationsSidebarProps) {
  const hasLoadedRef = useRef(false);
  const [exercises, setExercises] = useState<RecommendedExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar ejercicios recomendados al montar el componente
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchRecommendations();
    }
  }, []);

  // Limpiar error automáticamente
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/patient/recommendations");

      if (!response.ok) {
        throw new Error("Error al obtener recomendaciones");
      }

      const result = await response.json();
      setExercises(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseClick = (exercise: RecommendedExercise) => {
    // Convertir el ejercicio recomendado a formato Exercise para el modal
    const exerciseData: Exercise = {
      id: exercise.exercise.id,
      name: exercise.exercise.name,
      groupId: exercise.exercise.group?.groupId || "",
      videoUrl: exercise.exercise.videoUrl || "",
      metrics: exercise.exercise.metrics,
      level: exercise.exercise.level,
      movementType: exercise.exercise.movementType,
      position: exercise.exercise.position,
      equipment: exercise.exercise.equipment,
      targetMuscles: exercise.exercise.targetMuscles,
    };

    const zone = exercise.exercise.group?.groupId || "";
    const category = exercise.exercise.group?.category || "";

    onSelectExercise({
      exercise: exerciseData,
      zone,
      category,
    });
    onClose();
  };

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
            <div className="flex items-center justify-between p-8 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">📚 Mis Ejercicios</h2>
                <p className="text-base text-slate-600 mt-1">Ejercicios Recomendados</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/80 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-8 space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Exercises List */}
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-slate-500 mt-3">Cargando ejercicios...</p>
                  </div>
                ) : exercises.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-600 text-lg font-medium">No hay ejercicios asignados</p>
                    <p className="text-slate-400 mt-2">Tu fisioterapeuta aún no ha asignado ejercicios</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 font-medium">
                      Total: {exercises.length} ejercicio(s)
                    </p>
                    {exercises.map((exercise, idx) => {
                      const category = exercise.exercise.group?.category || "N/A";
                      const zone = exercise.exercise.group?.groupId || "N/A";
                      const categoryLabel =
                        category === "estiramientos"
                          ? "Estiramiento"
                          : category === "movilidad"
                          ? "Movilidad"
                          : category === "fortalecimiento"
                          ? "Fortalecimiento"
                          : category;

                      return (
                        <motion.button
                          key={`${exercise.exerciseId}-${idx}`}
                          onClick={() => handleExerciseClick(exercise)}
                          className="w-full text-left p-5 border border-slate-200 rounded-xl hover:shadow-lg hover:border-purple-300 transition-all bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-lg font-semibold text-slate-900 mb-2">
                                {idx + 1}. {exercise.exercise.name}
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                  {categoryLabel}
                                </span>
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                  {zone}
                                </span>
                              </div>
                            </div>
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              whileHover={{ opacity: 1, x: 0 }}
                              className="text-purple-600 font-medium text-sm mt-1"
                            >
                              Ver →
                            </motion.div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
