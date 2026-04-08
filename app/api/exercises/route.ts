import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/exercises
 * Retorna lista paginada de ejercicios
 * Query params:
 * - page: número de página (default 1)
 * - limit: ejercicios por página (default 20, max 100)
 * - category: filtrar por categoría (movilidad, estiramientos, fortalecimiento)
 * - groupId: filtrar por grupo
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
    const category = searchParams.get('category')
    const groupId = searchParams.get('groupId')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (category) {
      where.group = {
        category: category as any
      }
    }
    if (groupId) {
      where.group = {
        ...where.group,
        groupId: groupId
      }
    }

    // Obtener ejercicios
    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        include: {
          group: true,
          tags: {
            include: {
              tag: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.exercise.count({ where })
    ])

    // Mapear respuesta
    const data = exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      videoUrl: ex.videoUrl,
      level: ex.level,
      movementType: ex.movementType,
      position: ex.position,
      equipment: ex.equipment,
      metrics: ex.metrics,
      targetMuscles: ex.targetMuscles,
      groupId: ex.group.groupId,
      category: ex.group.category,
      tags: ex.tags.map(rel => rel.tag.name)
    }))

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}
