import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/exercises/[id]
 * Retorna un ejercicio específico por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Exercise ID is required' },
        { status: 400 }
      )
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        group: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      )
    }

    const data = {
      id: exercise.id,
      name: exercise.name,
      videoUrl: exercise.videoUrl,
      level: exercise.level,
      movementType: exercise.movementType,
      position: exercise.position,
      equipment: exercise.equipment,
      metrics: exercise.metrics,
      targetMuscles: exercise.targetMuscles,
      groupId: exercise.group.groupId,
      category: exercise.group.category,
      tags: exercise.tags.map(rel => rel.tag.name)
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching exercise:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercise' },
      { status: 500 }
    )
  }
}
