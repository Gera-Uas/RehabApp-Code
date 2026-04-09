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

/**
 * PUT /api/exercises/[id]
 * Actualiza un ejercicio
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, videoUrl, level, movementType, position, equipment, metrics, targetMuscles } = body

    // Verificar que el ejercicio existe
    const exercise = await prisma.exercise.findUnique({
      where: { id }
    })

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      )
    }

    // Actualizar ejercicio
    const updated = await prisma.exercise.update({
      where: { id },
      data: {
        name: name || exercise.name,
        videoUrl: videoUrl ?? exercise.videoUrl,
        level: level || exercise.level,
        movementType: movementType || exercise.movementType,
        position: position || exercise.position,
        equipment: equipment || exercise.equipment,
        metrics: metrics || exercise.metrics,
        targetMuscles: targetMuscles || exercise.targetMuscles
      },
      include: {
        group: true
      }
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Error updating exercise:', error)
    return NextResponse.json(
      { error: 'Failed to update exercise' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/exercises/[id]
 * Elimina un ejercicio
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que el ejercicio existe
    const exercise = await prisma.exercise.findUnique({
      where: { id }
    })

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      )
    }

    // Eliminar ejercicio
    await prisma.exercise.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting exercise:', error)
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 }
    )
  }
}
