import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/exercises/search
 * Búsqueda y filtrado de ejercicios
 * Query params:
 * - q: término de búsqueda (nombre, etiquetas)
 * - level: filtrar por nivel (principiante, intermedio, avanzado)
 * - movementType: filtrar por tipo de movimiento
 * - position: filtrar por posición
 * - category: filtrar por categoría
 * - tags: etiquetas separadas por coma
 * - limit: máximo de resultados (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const q = searchParams.get('q')
    const level = searchParams.get('level')
    const movementType = searchParams.get('movementType')
    const position = searchParams.get('position')
    const category = searchParams.get('category')
    const tagsParam = searchParams.get('tags')
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))

    // Construir filtros
    const where: any = {}

    // Filtro de búsqueda de texto
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { tags: { some: { tag: { name: { contains: q } } } } }
      ]
    }

    // Filtros por campos
    if (level) {
      where.level = level
    }
    if (movementType) {
      where.movementType = movementType
    }
    if (position) {
      where.position = position
    }
    if (category) {
      where.group = {
        category: category as any
      }
    }

    // Filtros por tags
    if (tagsParam) {
      const tagNames = tagsParam.split(',').map(t => t.trim())
      where.tags = {
        some: {
          tag: {
            name: {
              in: tagNames
            }
          }
        }
      }
    }

    // Obtener ejercicios
    const exercises = await prisma.exercise.findMany({
      where,
      include: {
        group: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

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
      count: data.length
    })
  } catch (error) {
    console.error('Error searching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to search exercises' },
      { status: 500 }
    )
  }
}
