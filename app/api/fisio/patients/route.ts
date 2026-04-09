import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/fisio/patients
 * Retorna lista de pacientes asignados al fisioterapeuta autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Validar autenticación
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Validar rol
    if (session.user.role !== 'FISIOTERAPEUTA') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Obtener pacientes asignados al fisioterapeuta
    const patients = await prisma.user.findMany({
      where: {
        fisioId: session.user.id,
        role: 'PACIENTE'
      },
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
                    name: true,
                    group: {
                      select: {
                        groupId: true,
                        category: true
                      }
                    }
                  }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      data: patients
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { error: 'Error al obtener pacientes' },
      { status: 500 }
    )
  }
}
