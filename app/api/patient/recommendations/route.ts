import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "PACIENTE") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const recommendations = await prisma.exerciseRecommendation.findUnique({
      where: { patientId: token.sub as string },
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
                videoUrl: true,
                level: true,
                movementType: true,
                position: true,
                equipment: true,
                metrics: true,
                targetMuscles: true,
                group: {
                  select: {
                    category: true,
                    groupId: true,
                  },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: recommendations?.exercises || [],
    });
  } catch (error) {
    console.error("Error fetching patient recommendations:", error);
    return NextResponse.json(
      { error: "Error al obtener recomendaciones" },
      { status: 500 }
    );
  }
}
