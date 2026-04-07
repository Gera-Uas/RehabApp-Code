# Script para agregar campos de filtrado por contenido a los ejercicios

$jsonPath = "c:\Users\ogra2\OneDrive\Desktop\Preciado\code\features\exercises\data\mockExercises.json"
$exercises = Get-Content $jsonPath -Raw | ConvertFrom-Json

# Mapeo de campos por groupId y category
$fieldMapping = @{
    "neck_movilidad" = @{
        tags = @("movilidad-activa", "rango-articular", "oficina", "bajo-impacto", "tren-superior")
        equipment = "sin-equipo"
        targetMuscles = @("trapecio-superior", "esternocleidomastoideo", "escalenos")
        movementType = "controlado"
        level = "principiante"
        position = "sentado"
    }
    "shoulder_movilidad" = @{
        tags = @("movilidad-activa", "rango-articular", "rehabilitación", "bajo-impacto", "tren-superior")
        equipment = "sin-equipo"
        targetMuscles = @("deltoides-medio", "manguito-rotador", "trapecio-medio")
        movementType = "pendular"
        level = "principiante"
        position = "de-pie"
    }
    "elbow_movilidad" = @{
        tags = @("movilidad-activa", "rango-articular", "rehabilitación", "bajo-impacto", "tren-superior")
        equipment = "sin-equipo"
        targetMuscles = @("bíceps", "tríceps", "braquial")
        movementType = "controlado"
        level = "principiante"
        position = "sentado"
    }
    "wrist_movilidad" = @{
        tags = @("movilidad-activa", "rango-articular", "oficina", "bajo-impacto", "prevención-lesiones")
        equipment = "sin-equipo"
        targetMuscles = @("flexores-muñeca", "extensores-muñeca", "pronadores")
        movementType = "dinámico"
        level = "principiante"
        position = "sentado"
    }
    "hip_movilidad" = @{
        tags = @("movilidad-activa", "rango-articular", "flexibilidad", "tren-inferior", "bajo-impacto")
        equipment = "sin-equipo"
        targetMuscles = @("glúteo-medio", "psoas-iliaco", "tensor-fascia-lata")
        movementType = "dinámico"
        level = "intermedio"
        position = "cuatro-puntos"
    }
    "knee_movilidad" = @{
        tags = @("movilidad-activa", "rango-articular", "rehabilitación", "bajo-impacto", "tren-inferior")
        equipment = "sin-equipo"
        targetMuscles = @("cuádriceps", "isquiotibiales", "gastrocnemio")
        movementType = "controlado"
        level = "principiante"
        position = "sentado"
    }
    "ankle_movilidad" = @{
        tags = @("movilidad-activa", "rango-articular", "equilibrio", "bajo-impacto", "tren-inferior")
        equipment = "sin-equipo"
        targetMuscles = @("gemelos", "tibial-anterior", "peroneos")
        movementType = "dinámico"
        level = "principiante"
        position = "sentado"
    }
    "chest_estiramientos" = @{
        tags = @("flexibilidad", "mejora-postura", "oficina", "estático", "tren-superior")
        equipment = "pared"
        targetMuscles = @("pectoral-mayor", "pectoral-menor", "deltoides-anterior")
        movementType = "estático"
        level = "principiante"
        position = "de-pie"
    }
    "chest_fortalecimiento" = @{
        tags = @("fortalecimiento", "tren-superior", "casa", "progresivo", "fuerza")
        equipment = "sin-equipo"
        targetMuscles = @("pectoral-mayor", "tríceps", "deltoides-anterior")
        movementType = "dinámico"
        level = "principiante"
        position = "inclinado"
    }
    "abdomen_estiramientos" = @{
        tags = @("flexibilidad", "movilidad-activa", "mejora-postura", "bajo-impacto", "casa")
        equipment = "sin-equipo"
        targetMuscles = @("recto-abdominal", "oblicuos-externos", "psoas-iliaco")
        movementType = "estático"
        level = "principiante"
        position = "acostado-prono"
    }
    "abdomen_fortalecimiento" = @{
        tags = @("fortalecimiento-core", "estabilización", "casa", "control-motor", "progresivo")
        equipment = "sin-equipo"
        targetMuscles = @("recto-abdominal", "transverso-abdominal", "multífidos")
        movementType = "isométrico"
        level = "principiante"
        position = "acostado-supino"
    }
    "back_estiramientos" = @{
        tags = @("flexibilidad", "mejora-postura", "oficina", "reducción-dolor", "bajo-impacto")
        equipment = "sin-equipo"
        targetMuscles = @("erector-espinal", "multífidos", "dorsal-ancho")
        movementType = "dinámico"
        level = "principiante"
        position = "cuatro-puntos"
    }
    "back_fortalecimiento" = @{
        tags = @("fortalecimiento-core", "mejora-postura", "prevención-lesiones", "estabilización", "casa")
        equipment = "sin-equipo"
        targetMuscles = @("erector-espinal", "multífidos", "glúteo-mayor")
        movementType = "isométrico"
        level = "intermedio"
        position = "acostado-prono"
    }
    "arm_estiramientos" = @{
        tags = @("flexibilidad", "oficina", "bajo-impacto", "tren-superior", "prevención-lesiones")
        equipment = "sin-equipo"
        targetMuscles = @("bíceps", "tríceps", "deltoides-posterior")
        movementType = "estático"
        level = "principiante"
        position = "de-pie"
    }
    "arm_fortalecimiento" = @{
        tags = @("fortalecimiento", "tren-superior", "casa", "progresivo", "resistencia")
        equipment = "banda-elástica"
        targetMuscles = @("bíceps", "tríceps", "braquial")
        movementType = "dinámico"
        level = "intermedio"
        position = "de-pie"
    }
    "forearms_estiramientos" = @{
        tags = @("flexibilidad", "oficina", "prevención-lesiones", "bajo-impacto", "sedentario")
        equipment = "sin-equipo"
        targetMuscles = @("flexores-muñeca", "extensores-muñeca", "supinadores")
        movementType = "estático"
        level = "principiante"
        position = "sentado"
    }
    "forearms_fortalecimiento" = @{
        tags = @("fortalecimiento", "resistencia", "casa", "progresivo", "control-motor")
        equipment = "pesas-ligeras"
        targetMuscles = @("flexores-muñeca", "extensores-muñeca", "pronadores")
        movementType = "controlado"
        level = "intermedio"
        position = "sentado"
    }
    "lowerlegs_estiramientos" = @{
        tags = @("flexibilidad", "tren-inferior", "bajo-impacto", "deportistas", "prevención-lesiones")
        equipment = "pared"
        targetMuscles = @("gastrocnemio", "sóleo", "tibial-anterior")
        movementType = "estático"
        level = "principiante"
        position = "de-pie"
    }
    "lowerlegs_fortalecimiento" = @{
        tags = @("fortalecimiento", "equilibrio", "tren-inferior", "casa", "progresivo")
        equipment = "sin-equipo"
        targetMuscles = @("gastrocnemio", "sóleo", "tibial-posterior")
        movementType = "dinámico"
        level = "principiante"
        position = "de-pie"
    }
    "leg_estiramientos" = @{
        tags = @("flexibilidad", "tren-inferior", "deportistas", "mejora-postura", "bajo-impacto")
        equipment = "sin-equipo"
        targetMuscles = @("isquiotibiales", "cuádriceps", "aductores")
        movementType = "estático"
        level = "principiante"
        position = "acostado-supino"
    }
    "leg_fortalecimiento" = @{
        tags = @("fortalecimiento", "equilibrio", "tren-inferior", "casa", "coordinación")
        equipment = "sin-equipo"
        targetMuscles = @("cuádriceps", "glúteo-mayor", "isquiotibiales")
        movementType = "dinámico"
        level = "intermedio"
        position = "de-pie"
    }
}

# Procesar cada grupo
foreach ($group in $exercises) {
    $key = "$($group.groupId)_$($group.category)"
    $fields = $fieldMapping[$key]
    
    if ($fields) {
        foreach ($exercise in $group.exercises) {
            # Agregar campos base
            $exercise | Add-Member -NotePropertyName "tags" -NotePropertyValue $fields.tags -Force
            $exercise | Add-Member -NotePropertyName "equipment" -NotePropertyValue $fields.equipment -Force
            $exercise | Add-Member -NotePropertyName "targetMuscles" -NotePropertyValue $fields.targetMuscles -Force
            $exercise | Add-Member -NotePropertyName "movementType" -NotePropertyValue $fields.movementType -Force
            $exercise | Add-Member -NotePropertyName "level" -NotePropertyValue $fields.level -Force
            $exercise | Add-Member -NotePropertyName "position" -NotePropertyValue $fields.position -Force
            
            # Variaciones por dificultad
            if ($exercise.metrics.difficulty -ge 5) {
                $exercise.level = "intermedio"
            }
            if ($exercise.metrics.difficulty -ge 7) {
                $exercise.level = "avanzado"
            }
        }
    }
}

# Guardar JSON actualizado
$exercises | ConvertTo-Json -Depth 10 | Set-Content $jsonPath -Encoding UTF8

Write-Host "✅ Campos agregados exitosamente a todos los ejercicios"
