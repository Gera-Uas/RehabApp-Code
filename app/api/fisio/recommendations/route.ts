import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validación de schema
const recommendationSchema = z.object({
  patientId: z.string().min(1),
  exercises: z.array(
    z.object({
      exerciseId: z.string().min(1),
      order: z.number().int().min(1)
    })
  ).min(0)
})

/**
 * GET /api/fisio/recommendations
 * Retorna lista de recomendaciones del fisioterapeuta autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'FISIOTERAPEUTA') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Obtener pacientes del fisio con sus recomendaciones
    const recommendations = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        patients: {
          select: {
            id: true,
            name: true,
            email: true,
            recommendations: {
              select: {
                id: true,
                exercises: {
                  select: {
                    exerciseId: true,
                    order: true,
                    exercise: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  },
                  orderBy: { order: 'asc' }
                }
              }
            }
          },
          orderBy: { name: 'asc' }
        }
      }
    })

    return NextResponse.json({
      data: recommendations?.patients || []
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Error al obtener recomendaciones' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/fisio/recommendations
 * Crea o actualiza una recomendación de ejercicios para un paciente
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'FISIOTERAPEUTA') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = recommendationSchema.parse(body)

    // Validar que el paciente existe
    const patient = await prisma.user.findUnique({
      where: { id: validated.patientId }
    })

    if (!patient || patient.role !== 'PACIENTE') {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    // Si el paciente no está asignado, asignarlo al fisioterapeuta actual
    if (!patient.fisioId) {
      await prisma.user.update({
        where: { id: validated.patientId },
        data: { fisioId: session.user.id }
      })
    }

    // Crear o actualizar recomendación (upsert)
    const recommendation = await prisma.exerciseRecommendation.upsert({
      where: { patientId: validated.patientId },
      update: {
        exercises: {
          deleteMany: {},
          createMany: {
            data: validated.exercises
          }
        }
      },
      create: {
        patientId: validated.patientId,
        exercises: {
          createMany: {
            data: validated.exercises
          }
        }
      },
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                videoUrl: true,
                metrics: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(
      {
        message: 'Recomendación guardada',
        data: recommendation
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating recommendation:', error)
    return NextResponse.json(
      { error: 'Error al guardar recomendación' },
      { status: 500 }
    )
  }
}
