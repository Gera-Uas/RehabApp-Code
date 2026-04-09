import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/fisio/recommendations/[id]
 * Elimina una recomendación de ejercicios
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'FISIOTERAPEUTA') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Validar que la recomendación pertenece a un paciente del fisioterapeuta
    const recommendation = await prisma.exerciseRecommendation.findUnique({
      where: { id },
      include: { patient: true }
    })

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recomendación no encontrada' },
        { status: 404 }
      )
    }

    if (recommendation.patient.fisioId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta recomendación' },
        { status: 403 }
      )
    }

    // Eliminar recomendación
    await prisma.exerciseRecommendation.delete({
      where: { id }
    })

    // Desasignar el paciente del fisioterapeuta
    await prisma.user.update({
      where: { id: recommendation.patientId },
      data: { fisioId: null }
    })

    return NextResponse.json({
      message: 'Paciente eliminado del catálogo'
    })
  } catch (error) {
    console.error('Error deleting recommendation:', error)
    return NextResponse.json(
      { error: 'Error al eliminar recomendación' },
      { status: 500 }
    )
  }
}
