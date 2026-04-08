import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
})

interface ExerciseData {
  groupId: string
  category: 'movilidad' | 'estiramientos' | 'fortalecimiento'
  exercises: Array<{
    id: string
    name: string
    videoUrl: string
    metrics?: {
      difficulty: number
      duration: number
      effectiveness: number
      frequency: number
    }
    tags?: string[]
    equipment?: string
    targetMuscles?: string[]
    movementType?: string
    level?: string
    position?: string
  }>
}

function normalizeValue(value: string | undefined): string {
  if (!value) return ''
  return value
    .toLowerCase()
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
}

function getDefaultEnumValue(field: 'level' | 'movementType' | 'position' | 'equipment'): string {
  const defaults: Record<string, string> = {
    level: 'principiante',
    movementType: 'controlado',
    position: 'sentado',
    equipment: 'sin_equipo'
  }
  return defaults[field] || ''
}

async function main() {
  console.log('🌱 Iniciando seed de ejercicios...')

  const mockPath = path.join(__dirname, '../features/exercises/data/mockExercises(01).json')
  const rawData = fs.readFileSync(mockPath, 'utf-8').replace(/^\uFEFF/, '')
  const mockExercises: ExerciseData[] = JSON.parse(rawData)

  console.log(`📂 Leyendo ${mockExercises.length} grupos de ejercicios...`)

  // Recolectar todos los tags únicos
  const allTags = new Set<string>()
  mockExercises.forEach(group => {
    group.exercises.forEach(ex => {
      if (ex.tags) {
        ex.tags.forEach(tag => allTags.add(tag))
      }
    })
  })

  console.log(`🏷️ Tags únicos encontrados: ${allTags.size}`)

  // Crear tags primero
  console.log('📌 Creando tags...')
  const createdTags: Record<string, string> = {}
  for (const tagName of allTags) {
    const tag = await prisma.exerciseTag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    })
    createdTags[tagName] = tag.id
  }
  console.log(`✅ ${Object.keys(createdTags).length} tags creados/verificados`)

  // Insertar grupos y ejercicios
  let totalExercises = 0
  for (const group of mockExercises) {
    console.log(`\n📋 Procesando grupo: ${group.groupId} (${group.category})`)

    // Crear ExerciseGroup
    const exerciseGroup = await prisma.exerciseGroup.upsert({
      where: {
        groupId_category: {
          groupId: group.groupId,
          category: group.category,
        },
      },
      update: {},
      create: {
        groupId: group.groupId,
        category: group.category,
      },
    })
    console.log(`  ✓ Grupo creado: ${exerciseGroup.id}`)

    // Insertar ejercicios
    for (const exercise of group.exercises) {
      if (!exercise.id || !exercise.name) {
        console.warn(`  ⚠️ Ejercicio inválido saltado: ${exercise.id}`)
        continue
      }

      try {
        const level = normalizeValue(exercise.level) || getDefaultEnumValue('level')
        const movementType = normalizeValue(exercise.movementType) || getDefaultEnumValue('movementType')
        const position = normalizeValue(exercise.position) || getDefaultEnumValue('position')
        const equipment = normalizeValue(exercise.equipment) || getDefaultEnumValue('equipment')

        const createdExercise = await prisma.exercise.upsert({
          where: { id: exercise.id },
          update: {},
          create: {
            id: exercise.id,
            name: exercise.name,
            videoUrl: exercise.videoUrl,
            level: level as any,
            movementType: movementType as any,
            position: position as any,
            equipment: equipment as any,
            metrics: exercise.metrics || { difficulty: 1, duration: 5, effectiveness: 3, frequency: 3 },
            targetMuscles: exercise.targetMuscles || [],
            groupId: exerciseGroup.id,
          },
        })

        // Crear relaciones de tags
        if (exercise.tags) {
          for (const tagName of exercise.tags) {
            const tagId = createdTags[tagName]
            if (tagId) {
              await prisma.exerciseTagRelation.upsert({
                where: {
                  exerciseId_tagId: {
                    exerciseId: exercise.id,
                    tagId: tagId,
                  },
                },
                update: {},
                create: {
                  exerciseId: exercise.id,
                  tagId: tagId,
                },
              })
            }
          }
        }

        totalExercises++
        console.log(`  ✓ ${exercise.name}`)
      } catch (err) {
        console.error(`  ❌ Error al insertar ${exercise.id}:`, err)
      }
    }
  }

  console.log(`\n✅ Seed completado!`)
  console.log(`📊 Totales:`)
  console.log(`  - Grupos: ${mockExercises.length}`)
  console.log(`  - Ejercicios: ${totalExercises}`)
  console.log(`  - Tags: ${allTags.size}`)
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
  .catch((e) => {
    console.error('❌ Error durante seed:', e)
    process.exit(1)
  })
