"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface PatientFloatingActionButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export default function PatientFloatingActionButton({
  isVisible,
  onClick,
}: PatientFloatingActionButtonProps) {
  if (!isVisible) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 z-30 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-2xl flex items-center justify-center transition-all"
      title="Ver mis ejercicios recomendados"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <BookOpen className="w-7 h-7" />
      </motion.div>
    </motion.button>
  );
}
