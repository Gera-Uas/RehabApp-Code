// Full updated InteractiveSVGBody.tsx with pelvis triangle added

"use client"

import { useState } from "react"
import type { Category } from "@/src/types"
import { motion } from "framer-motion"
import BODY_ZONES from "@/src/data/bodyZones"

interface InteractiveSVGBodyProps {
  selectedCategory: Category
  selectedZone: string | null
  onZoneSelect: (zoneId: string) => void
}

type BodyZoneId = keyof typeof BODY_ZONES

function isBodyZoneId(id: string): id is BodyZoneId {
  return id in BODY_ZONES
}

export default function InteractiveSVGBody({ selectedCategory, selectedZone, onZoneSelect }: InteractiveSVGBodyProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)

  const isZoneInteractive = (zoneId: string) => {
    const zone = BODY_ZONES[zoneId as keyof typeof BODY_ZONES]
    if (!zone) return false

    if (selectedCategory === "movilidad") return zone.type === "joint"
    if (selectedCategory === "estiramientos" || selectedCategory === "fortalecimiento")
      return zone.type === "muscle" || zone.type === "limb"

    return false
  }

  const getZoneOpacity = (zoneId: string) => (isZoneInteractive(zoneId) ? 1 : 0.3)

  const getZoneColor = (zoneId: string) => {
    if (selectedZone === zoneId) return "#0891b2"
    if (hoveredZone === zoneId && isZoneInteractive(zoneId)) return "#06b6d4"
    return isZoneInteractive(zoneId) ? "#67e8f9" : "#cbd5e1"
  }

  const handleZoneClick = (zoneId: string) => {
    if (!isZoneInteractive(zoneId)) return
    if (!isBodyZoneId(zoneId)) return

    // Send only zoneId to parent. Modal will resolve groupId internally.
    onZoneSelect(zoneId)
  }



  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          {selectedCategory === "movilidad" && "Selecciona una articulación"}
          {selectedCategory === "estiramientos" && "Selecciona un grupo muscular"}
          {selectedCategory === "fortalecimiento" && "Selecciona un grupo muscular"}
        </h3>
        <p className="text-sm text-slate-600">
          {selectedCategory === "movilidad" && "Las articulaciones están resaltadas"}
          {(selectedCategory === "estiramientos" || selectedCategory === "fortalecimiento") &&
            "Los músculos y extremidades están resaltados"}
        </p>
      </div>

      <svg viewBox="0 0 400 800" className="w-full max-w-md h-auto" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="200" cy="60" rx="40" ry="50" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" />

        {/* Neck */}
        <motion.rect
          x="185"
          y="100"
          width="30"
          height="40"
          rx="8"
          fill={getZoneColor("neck")}
          stroke="#475569"
          strokeWidth="2"
          opacity={getZoneOpacity("neck")}
          onClick={() => handleZoneClick("neck")}
          onMouseEnter={() => setHoveredZone("neck")}
          onMouseLeave={() => setHoveredZone(null)}
          className={isZoneInteractive("neck") ? "cursor-pointer" : "cursor-not-allowed"}
          whileHover={isZoneInteractive("neck") ? { scale: 1.05 } : {}}
          whileTap={isZoneInteractive("neck") ? { scale: 0.95 } : {}}
        />

        {/* back */}
        <motion.rect
          x="150"
          y="140"
          width="100"
          height="125"
          rx="15"
          fill={getZoneColor("back")}
          stroke="#475569"
          strokeWidth="2"
          opacity={getZoneOpacity("back")}
          onClick={() => handleZoneClick("back")}
          onMouseEnter={() => setHoveredZone("back")}
          onMouseLeave={() => setHoveredZone(null)}
          className={isZoneInteractive("back") ? "cursor-pointer" : "cursor-not-allowed"}
          whileHover={isZoneInteractive("back") ? { scale: 1.05 } : {}}
          whileTap={isZoneInteractive("back") ? { scale: 0.95 } : {}}
        />

        {/* chest */}
        <motion.rect
          x="160"
          y="150"
          width="80"
          height="70"
          rx="12"
          fill={getZoneColor("chest")}
          stroke="#475569"
          strokeWidth="2"
          opacity={getZoneOpacity("chest") * 0.7}
          onClick={() => handleZoneClick("chest")}
          onMouseEnter={() => setHoveredZone("chest")}
          onMouseLeave={() => setHoveredZone(null)}
          className={isZoneInteractive("chest") ? "cursor-pointer" : "cursor-not-allowed"}
          whileHover={isZoneInteractive("chest") ? { scale: 1.05 } : {}}
          whileTap={isZoneInteractive("chest") ? { scale: 0.95 } : {}}
        />
        {/* Abdomen */}
        <motion.rect
          x="160"
          y="220"
          width="80"
          height="120"
          rx="12"
          fill={getZoneColor("abdomen")}
          stroke="#475569"
          strokeWidth="2"
          opacity={getZoneOpacity("abdomen")}
          onClick={() => handleZoneClick("abdomen")}
          onMouseEnter={() => setHoveredZone("abdomen")}
          onMouseLeave={() => setHoveredZone(null)}
          className={isZoneInteractive("abdomen") ? "cursor-pointer" : "cursor-not-allowed"}
          whileHover={isZoneInteractive("abdomen") ? { scale: 1.05 } : {}}
          whileTap={isZoneInteractive("abdomen") ? { scale: 0.95 } : {}}
        />

        {/* Shoulders */}
        <motion.circle cx="130" cy="160" r="18" fill={getZoneColor("shoulder_right")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("shoulder_right")} onClick={() => handleZoneClick("shoulder_right")} onMouseEnter={() => setHoveredZone("shoulder_right")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("shoulder_right") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("shoulder_right") ? { scale: 1.1 } : {}} whileTap={isZoneInteractive("shoulder_right") ? { scale: 0.9 } : {}} />
        <motion.circle cx="270" cy="160" r="18" fill={getZoneColor("shoulder_left")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("shoulder_left")} onClick={() => handleZoneClick("shoulder_left")} onMouseEnter={() => setHoveredZone("shoulder_left")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("shoulder_left") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("shoulder_left") ? { scale: 1.1 } : {}} whileTap={isZoneInteractive("shoulder_left") ? { scale: 0.9 } : {}} />

        {/* Arms */}
        <motion.rect x="100" y="170" width="30" height="120" rx="15" fill={getZoneColor("arm_right")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("arm_right")} onClick={() => handleZoneClick("arm_right")} onMouseEnter={() => setHoveredZone("arm_right")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("arm_right") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("arm_right") ? { scale: 1.05 } : {}} whileTap={isZoneInteractive("arm_right") ? { scale: 0.95 } : {}} />
        <motion.rect x="270" y="170" width="30" height="120" rx="15" fill={getZoneColor("arm_left")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("arm_left")} onClick={() => handleZoneClick("arm_left")} onMouseEnter={() => setHoveredZone("arm_left")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("arm_left") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("arm_left") ? { scale: 1.05 } : {}} whileTap={isZoneInteractive("arm_left") ? { scale: 0.95 } : {}} />

        {/* Elbows */}
        <motion.circle cx="115" cy="290" r="15" fill={getZoneColor("elbow_right")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("elbow_right")} onClick={() => handleZoneClick("elbow_right")} onMouseEnter={() => setHoveredZone("elbow_right")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("elbow_right") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("elbow_right") ? { scale: 1.1 } : {}} whileTap={isZoneInteractive("elbow_right") ? { scale: 0.9 } : {}} />
        <motion.circle cx="285" cy="290" r="15" fill={getZoneColor("elbow_left")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("elbow_left")} onClick={() => handleZoneClick("elbow_left")} onMouseEnter={() => setHoveredZone("elbow_left")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("elbow_left") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("elbow_left") ? { scale: 1.1 } : {}} whileTap={isZoneInteractive("elbow_left") ? { scale: 0.9 } : {}} />

        {/* Forearms */}
        <motion.rect
          x="100"
          y="300"
          width="30"
          height="100"
          rx="15"
          fill={getZoneColor("forearm_right")}
          stroke="#475569"
          strokeWidth="2"
          opacity={getZoneOpacity("forearm_right")}
          onClick={() => handleZoneClick("forearm_right")}
          onMouseEnter={() => setHoveredZone("forearm_right")}
          onMouseLeave={() => setHoveredZone(null)}
          className={isZoneInteractive("forearm_right") ? "cursor-pointer" : "cursor-not-allowed"}
          whileHover={isZoneInteractive("forearm_right") ? { scale: 1.05 } : {}}
          whileTap={isZoneInteractive("forearm_right") ? { scale: 0.95 } : {}}
        />
        <motion.rect
          x="270"
          y="300"
          width="30"
          height="100"
          rx="15"
          fill={getZoneColor("forearm_left")}
          stroke="#475569"
          strokeWidth="2"
          opacity={getZoneOpacity("forearm_left")}
          onClick={() => handleZoneClick("forearm_left")}
          onMouseEnter={() => setHoveredZone("forearm_left")}
          onMouseLeave={() => setHoveredZone(null)}
          className={isZoneInteractive("forearm_left") ? "cursor-pointer" : "cursor-not-allowed"}
          whileHover={isZoneInteractive("forearm_left") ? { scale: 1.05 } : {}}
          whileTap={isZoneInteractive("forearm_left") ? { scale: 0.95 } : {}}
        />

        {/* Wrists */}
        <motion.circle cx="115" cy="400" r="12" fill={getZoneColor("wrist_right")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("wrist_right")} onClick={() => handleZoneClick("wrist_right")} onMouseEnter={() => setHoveredZone("wrist_right")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("wrist_right") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("wrist_right") ? { scale: 1.1 } : {}} whileTap={isZoneInteractive("wrist_right") ? { scale: 0.9 } : {}} />
        <motion.circle cx="285" cy="400" r="12" fill={getZoneColor("wrist_left")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("wrist_left")} onClick={() => handleZoneClick("wrist_left")} onMouseEnter={() => setHoveredZone("wrist_left")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("wrist_left") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("wrist_left") ? { scale: 1.1 } : {}} whileTap={isZoneInteractive("wrist_left") ? { scale: 0.9 } : {}} />

        {/* Hands */}
        <ellipse cx="115" cy="430" rx="15" ry="25" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" />
        <ellipse cx="285" cy="430" rx="15" ry="25" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" />
        
        {/* Pelvis (Triangle) */}
        <motion.polygon
          points="200,379 161,340 239,340"
          fill={getZoneColor("pelvis")}
          stroke="#475569"
          strokeWidth="2"
          opacity={getZoneOpacity("pelvis")}
          onClick={() => handleZoneClick("pelvis")}
          onMouseEnter={() => setHoveredZone("pelvis")}
          onMouseLeave={() => setHoveredZone(null)}
          className={isZoneInteractive("pelvis") ? "cursor-pointer" : "cursor-not-allowed"}
          whileHover={isZoneInteractive("pelvis") ? { scale: 1.05 } : {}}
          whileTap={isZoneInteractive("pelvis") ? { scale: 0.95 } : {}}
        />

        {/* Hips */}
        <motion.circle cx="175" cy="380" r="18" fill={getZoneColor("hip_right")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("hip_right")} onClick={() => handleZoneClick("hip_right")} onMouseEnter={() => setHoveredZone("hip_right")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("hip_right") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("hip_right") ? { scale: 1.1 } : {}} whileTap={isZoneInteractive("hip_right") ? { scale: 0.9 } : {}} />
        <motion.circle cx="225" cy="380" r="18" fill={getZoneColor("hip_left")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("hip_left")} onClick={() => handleZoneClick("hip_left")} onMouseEnter={() => setHoveredZone("hip_left")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("hip_left") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("hip_left") ? { scale: 1.1 } : {}} whileTap={isZoneInteractive("hip_left") ? { scale: 0.9 } : {}} />

        {/* Legs */}
        <motion.rect x="155" y="390" width="40" height="140" rx="20" fill={getZoneColor("leg_right")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("leg_right")} onClick={() => handleZoneClick("leg_right")} onMouseEnter={() => setHoveredZone("leg_right")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("leg_right") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("leg_right") ? { scale: 1.05 } : {}} whileTap={isZoneInteractive("leg_right") ? { scale: 0.95 } : {}} />
        <motion.rect x="205" y="390" width="40" height="140" rx="20" fill={getZoneColor("leg_left")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("leg_left")} onClick={() => handleZoneClick("leg_left")} onMouseEnter={() => setHoveredZone("leg_left")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("leg_left") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("leg_left") ? { scale: 1.05 } : {}} whileTap={isZoneInteractive("leg_left") ? { scale: 0.95 } : {}} />

        {/* Knees */}
        <motion.circle cx="175" cy="530" r="16" fill={getZoneColor("knee_right")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("knee_right")} onClick={() => handleZoneClick("knee_right")} onMouseEnter={() => setHoveredZone("knee_right")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("knee_right") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("knee_right") ? { scale: 1.1 } : {}} whileTap={isZoneInteractive("knee_right") ? { scale: 0.9 } : {}} />
        <motion.circle cx="225" cy="530" r="16" fill={getZoneColor("knee_left")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("knee_left")} onClick={() => handleZoneClick("knee_left")} onMouseEnter={() => setHoveredZone("knee_left")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("knee_left") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("knee_left") ? { scale: 1.1 } : {}} whileTap={isZoneInteractive("knee_left") ? { scale: 0.9 } : {}} />

        {/* Lower legs */}
        <motion.rect
          x="160"
          y="540"
          width="30"
          height="140"
          rx="15"
          fill={getZoneColor("lowerleg_right")}
          stroke="#475569"
          strokeWidth="2"
          opacity={getZoneOpacity("lowerleg_right")}
          onClick={() => handleZoneClick("lowerleg_right")}
          onMouseEnter={() => setHoveredZone("lowerleg_right")}
          onMouseLeave={() => setHoveredZone(null)}
          className={isZoneInteractive("lowerleg_right") ? "cursor-pointer" : "cursor-not-allowed"}
          whileHover={isZoneInteractive("lowerleg_right") ? { scale: 1.05 } : {}}
          whileTap={isZoneInteractive("lowerleg_right") ? { scale: 0.95 } : {}}
        />
        <motion.rect
          x="210"
          y="540"
          width="30"
          height="140"
          rx="15"
          fill={getZoneColor("lowerleg_left")}
          stroke="#475569"
          strokeWidth="2"
          opacity={getZoneOpacity("lowerleg_left")}
          onClick={() => handleZoneClick("lowerleg_left")}
          onMouseEnter={() => setHoveredZone("lowerleg_left")}
          onMouseLeave={() => setHoveredZone(null)}
          className={isZoneInteractive("lowerleg_left") ? "cursor-pointer" : "cursor-not-allowed"}
          whileHover={isZoneInteractive("lowerleg_left") ? { scale: 1.05 } : {}}
          whileTap={isZoneInteractive("lowerleg_left") ? { scale: 0.95 } : {}}
        />

        {/* Ankles */}
        <motion.circle cx="175" cy="680" r="14" fill={getZoneColor("ankle_right")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("ankle_right")} onClick={() => handleZoneClick("ankle_right")} onMouseEnter={() => setHoveredZone("ankle_right")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("ankle_right") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("ankle_right") ? { scale: 1.1 } : {}} whileTap={isZoneInteractive("ankle_right") ? { scale: 0.9 } : {}} />
        <motion.circle cx="225" cy="680" r="14" fill={getZoneColor("ankle_left")} stroke="#475569" strokeWidth="2" opacity={getZoneOpacity("ankle_left")} onClick={() => handleZoneClick("ankle_left")} onMouseEnter={() => setHoveredZone("ankle_left")} onMouseLeave={() => setHoveredZone(null)} className={isZoneInteractive("ankle_left") ? "cursor-pointer" : "cursor-not-allowed"} whileHover={isZoneInteractive("ankle_left") ? { scale: 1.1 } : {}} whileTap={isZoneInteractive("ankle_left") ? { scale: 0.9 } : {}} />

        {/* Feet */}
        <ellipse cx="175" cy="720" rx="25" ry="35" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" />
        <ellipse cx="225" cy="720" rx="25" ry="35" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" />
      </svg>

      {hoveredZone && isZoneInteractive(hoveredZone) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
          {BODY_ZONES[hoveredZone as keyof typeof BODY_ZONES]?.name}
        </motion.div>
      )}
    </div>
  )
}
