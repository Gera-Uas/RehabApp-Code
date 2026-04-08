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

// POST - Crear ejercicio
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const data = await req.json();
    const validated = exerciseSchema.parse(data);

    // Generar un ID único para el ejercicio
    const exerciseId = `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Crear o obtener el grupo de ejercicio
    const group = await prisma.exerciseGroup.upsert({
      where: {
        groupId_category: {
          groupId: "user-created",
          category: "fortalecimiento", // Por defecto
        },
      },
      update: {},
      create: {
        groupId: "user-created",
        category: "fortalecimiento",
      },
    });

    // Crear el ejercicio
    const exercise = await prisma.exercise.create({
      data: {
        id: exerciseId,
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
        groupId: group.id,
      },
    });

    // Crear tags si existen
    if (validated.tags && validated.tags.length > 0) {
      for (const tagName of validated.tags) {
        const tag = await prisma.exerciseTag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });

        await prisma.exerciseTagRelation.create({
          data: {
            exerciseId: exercise.id,
            tagId: tag.id,
          },
        });
      }
    }

    return NextResponse.json(
      { message: "Ejercicio creado", data: exercise },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating exercise:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear ejercicio" },
      { status: 500 }
    );
  }
}
