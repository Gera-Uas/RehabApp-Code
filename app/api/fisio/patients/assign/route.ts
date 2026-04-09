import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/fisio/patients/assign
 * Asigna un paciente al fisioterapeuta autenticado
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

    const { patientId } = await request.json()

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID requerido' },
        { status: 400 }
      )
    }

    // Validar que el paciente existe
    const patient = await prisma.user.findUnique({
      where: { id: patientId }
    })

    if (!patient || patient.role !== 'PACIENTE') {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    // Asignar el paciente al fisioterapeuta
    await prisma.user.update({
      where: { id: patientId },
      data: { fisioId: session.user.id }
    })

    return NextResponse.json({
      message: 'Paciente asignado exitosamente'
    })
  } catch (error) {
    console.error('Error assigning patient:', error)
    return NextResponse.json(
      { error: 'Error al asignar paciente' },
      { status: 500 }
    )
  }
}
