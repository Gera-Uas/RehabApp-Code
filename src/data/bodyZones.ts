export const BODY_ZONES: Record<string, { name: string; group: string; type?: string }> = {
  neck: { name: "Cuello", group: "neck", type: "joint" },
  shoulder_right: { name: "Hombro derecho", group: "shoulder", type: "joint" },
  shoulder_left: { name: "Hombro izquierdo", group: "shoulder", type: "joint" },
  shoulder: { name: "Hombro", group: "shoulder", type: "joint" },
  elbow_right: { name: "Codo derecho", group: "elbow", type: "joint" },
  elbow_left: { name: "Codo izquierdo", group: "elbow", type: "joint" },
  elbow: { name: "Codo", group: "elbow", type: "joint" },
  wrist_right: { name: "Muñeca derecha", group: "wrist", type: "joint" },
  wrist_left: { name: "Muñeca izquierda", group: "wrist", type: "joint" },
  wrist: { name: "Muñeca", group: "wrist", type: "joint" },
  hip_right: { name: "Cadera derecha", group: "hip", type: "joint" },
  hip_left: { name: "Cadera izquierda", group: "hip", type: "joint" },
  hip: { name: "Cadera", group: "hip", type: "joint" },
  knee_right: { name: "Rodilla derecha", group: "knee", type: "joint" },
  knee_left: { name: "Rodilla izquierda", group: "knee", type: "joint" },
  knee: { name: "Rodilla", group: "knee", type: "joint" },
  ankle_right: { name: "Tobillo derecho", group: "ankle", type: "joint" },
  ankle_left: { name: "Tobillo izquierdo", group: "ankle", type: "joint" },
  ankle: { name: "Tobillo", group: "ankle", type: "joint" },

  chest: { name: "Pecho", group: "chest", type: "muscle" },
  back: { name: "Espalda", group: "back", type: "muscle" },
  abdomen: { name: "Abdomen", group: "abdomen", type: "muscle" },
  pelvis: { name: "Pelvis", group: "pelvis", type: "muscle" },

  arm_right: { name: "Brazo derecho", group: "arm", type: "limb" },
  arm_left: { name: "Brazo izquierdo", group: "arm", type: "limb" },
  arm: { name: "Brazo", group: "arm", type: "limb" },

  forearm_right: { name: "Antebrazo derecho", group: "forearms", type: "limb" },
  forearm_left: { name: "Antebrazo izquierdo", group: "forearms", type: "limb" },
  forearm: { name: "Antebrazo", group: "forearms", type: "limb" },

  leg_right: { name: "Pierna derecha", group: "leg", type: "limb" },
  leg_left: { name: "Pierna izquierda", group: "leg", type: "limb" },
  leg: { name: "Pierna", group: "leg", type: "limb" },

  lowerleg_right: { name: "Pierna inferior derecha", group: "lowerlegs", type: "limb" },
  lowerleg_left: { name: "Pierna inferior izquierda", group: "lowerlegs", type: "limb" },
  lowerleg: { name: "Pierna inferior", group: "lowerlegs", type: "limb" },
}

export const ZONE_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(BODY_ZONES).map(([k, v]) => [k, v.name]),
)

export default BODY_ZONES
