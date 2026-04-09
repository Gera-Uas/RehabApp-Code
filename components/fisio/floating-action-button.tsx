"use client"

import { motion } from "framer-motion"
import { Clipboard } from "lucide-react"

interface FloatingActionButtonProps {
  onClick: () => void
  isVisible?: boolean
}

export default function FloatingActionButton({
  onClick,
  isVisible = true,
}: FloatingActionButtonProps) {
  if (!isVisible) return null

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 z-30 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      aria-label="Abrir recomendaciones"
      title="Gestionar recomendaciones de ejercicios"
    >
      <Clipboard className="w-7 h-7" />

      {/* Pulse animation */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full border-2 border-white opacity-0"
      />
    </motion.button>
  )
}
