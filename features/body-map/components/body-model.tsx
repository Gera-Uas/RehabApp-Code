"use client"

import type { Category } from "@/src/types"
import { motion, AnimatePresence } from "framer-motion"
import { Hand } from "lucide-react"
import InteractiveSVGBody from "@features/body-map/components/interactive-svg-body"

interface BodyModelProps {
  selectedCategory: Category
  selectedZone: string | null
  onZoneSelect: (zoneId: string) => void
}

export default function BodyModel({ selectedCategory, selectedZone, onZoneSelect }: BodyModelProps) {
  const isDisabled = !selectedCategory

  return (
    <div className="relative flex items-center justify-center min-h-[600px]">
      <AnimatePresence mode="wait">
        {isDisabled ? (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="inline-block"
            >
              <Hand className="w-20 h-20 text-cyan-500 mx-auto" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-poppins)]">
                Selecciona una categoría
              </h2>
              <p className="text-lg text-slate-600">
                Elige entre estiramientos, movilidad o fortalecimiento para comenzar
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="body-model"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-2xl"
          >
            <InteractiveSVGBody
              selectedCategory={selectedCategory}
              selectedZone={selectedZone}
              onZoneSelect={onZoneSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
