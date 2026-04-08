import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ExerciseData {
  groupId: string
  category: 'movilidad' | 'estiramientos' | 'fortalecimiento'
  exercises: Array<{
    id: string
    name: string
    videoUrl: string
    metrics: {
      difficulty: number
      duration: number
      effectiveness: number
      frequency: number
    }
    tags: string[]
    equipment: string
    targetMuscles: string[]
    movementType: string
    level: string
    position: string
  }>
}

export async function POST(req: NextRequest) {
  try {
    console.log('🌱 Iniciando seed de ejercicios...')

    // Leer mockExercises.json
    const mockPath = path.join(process.cwd(), 'features/exercises/data/mockExercises.json')
    const rawData = fs.readFileSync(mockPath, 'utf-8')
    const mockExercises: ExerciseData[] = JSON.parse(rawData)

    console.log(`📂 Leyendo ${mockExercises.length} grupos de ejercicios...`)

    // Recolectar todos los tags únicos
    const allTags = new Set<string>()
    mockExercises.forEach(group => {
      group.exercises.forEach(ex => {
        ex.tags.forEach(tag => allTags.add(tag))
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
      console.log(`  ✓ Grupo creado`)

      // Insertar ejercicios
      for (const exercise of group.exercises) {
        if (!exercise.id || !exercise.name) {
          console.warn(`  ⚠️ Ejercicio inválido: ${exercise.id}`)
          continue
        }

        try {
          await prisma.exercise.upsert({
            where: { id: exercise.id },
            update: {},
            create: {
              id: exercise.id,
              name: exercise.name,
              videoUrl: exercise.videoUrl,
              level: exercise.level,
              movementType: exercise.movementType,
              position: exercise.position,
              equipment: exercise.equipment,
              metrics: exercise.metrics,
              targetMuscles: exercise.targetMuscles,
              groupId: exerciseGroup.id,
            },
          })

          // Crear relaciones de tags
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

          totalExercises++
        } catch (err) {
          console.error(`  ❌ Error: ${exercise.id}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seed completado',
      data: {
        grupos: mockExercises.length,
        ejercicios: totalExercises,
        tags: allTags.size,
      },
    })
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
