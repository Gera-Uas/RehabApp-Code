import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/fisio/patients/:patientId
 * Desasigna un paciente del fisioterapeuta y elimina su recomendación
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'FISIOTERAPEUTA') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { patientId } = await params

    // Validar que el paciente pertenece a este fisioterapeuta
    const patient = await prisma.user.findUnique({
      where: { id: patientId }
    })

    if (!patient || patient.fisioId !== session.user.id) {
      return NextResponse.json(
        { error: 'Paciente no encontrado o no asignado a ti' },
        { status: 404 }
      )
    }

    // Eliminar recomendación si existe
    await prisma.exerciseRecommendation.deleteMany({
      where: { patientId }
    })

    // Desasignar paciente del fisioterapeuta
    await prisma.user.update({
      where: { id: patientId },
      data: { fisioId: null }
    })

    return NextResponse.json({
      message: 'Paciente eliminado del catálogo'
    })
  } catch (error) {
    console.error('Error removing patient:', error)
    return NextResponse.json(
      { error: 'Error al eliminar paciente' },
      { status: 500 }
    )
  }
}
