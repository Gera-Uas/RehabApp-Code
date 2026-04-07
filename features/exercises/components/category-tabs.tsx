"use client"

import { motion } from "framer-motion"
import type { Category } from "@/src/types"

interface CategoryTabsProps {
  selectedCategory: Category
  onCategoryChange: (category: Category) => void
}

const categories = [
  { id: "estiramientos" as const, label: "Estiramientos" },
  { id: "movilidad" as const, label: "Movilidad" },
  { id: "fortalecimiento" as const, label: "Fortalecimiento" },
]

export default function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center justify-center gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`relative px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
            selectedCategory === category.id ? "text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          {selectedCategory === category.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl shadow-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{category.label}</span>
        </button>
      ))}
    </div>
  )
}
