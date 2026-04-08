import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const exerciseSchema = z.object({
  name: z.string().min(1),
  videoUrl: z.string().url(),
  level: z.enum(["principiante", "intermedio", "avanzado"]),
  movementType: z.enum(["controlado", "dinamico", "pendular", "estatico", "isometrico"]),
  position: z.enum(["sentado", "de_pie", "cuatro_puntos", "acostado_supino", "acostado_prono", "inclinado"]),
  equipment: z.enum(["sin_equipo", "pared", "banda_elastica", "pesas_ligeras"]),
  difficulty: z.number().min(1).max(10),
  duration: z.number().min(1),
  effectiveness: z.number().min(1).max(5),
  frequency: z.number().min(1),
  targetMuscles: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// PUT - Actualizar ejercicio
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const data = await req.json();
    const validated = exerciseSchema.parse(data);

    const exercise = await prisma.exercise.update({
      where: { id: params.id },
      data: {
        name: validated.name,
        videoUrl: validated.videoUrl,
        level: validated.level,
        movementType: validated.movementType,
        position: validated.position,
        equipment: validated.equipment,
        metrics: {
          difficulty: validated.difficulty,
          duration: validated.duration,
          effectiveness: validated.effectiveness,
          frequency: validated.frequency,
        },
        targetMuscles: validated.targetMuscles || [],
      },
    });

    return NextResponse.json(
      { message: "Ejercicio actualizado", data: exercise },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating exercise:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Ejercicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar ejercicio" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar ejercicio
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.exercise.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Ejercicio eliminado" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting exercise:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Ejercicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al eliminar ejercicio" },
      { status: 500 }
    );
  }
}
