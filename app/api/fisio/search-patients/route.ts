import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/fisio/search-patients
 * Busca pacientes registrados en el sistema
 * Query params:
 * - q: término de búsqueda (nombre o email)
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
        { error: `No autorizado. Tu rol es: ${session.user.role}` },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    // Buscar pacientes registrados
    const patients = await prisma.user.findMany({
      where: {
        role: 'PACIENTE',
        ...(query ? {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } }
          ]
        } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        fisioId: true
      },
      orderBy: { name: 'asc' },
      take: 20
    })

    return NextResponse.json({
      data: patients
    })
  } catch (error) {
    console.error('Error searching patients:', error)
    return NextResponse.json(
      {
        error: 'Error al buscar pacientes',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
