"use client"

import { useScoringStore } from "@features/exercises/store/scoring"
import { Slider } from "@components/ui/slider"
import { Button } from "@components/ui/button"
import { Card } from "@components/ui/card"
import { RotateCcw } from "lucide-react"

interface ScoringPreferencesProps {
  onClose?: () => void
}

export function ScoringPreferences({ onClose }: ScoringPreferencesProps) {
  const { weights, updateWeight, resetWeights, getNormalizedWeights } = useScoringStore()
  const normalized = getNormalizedWeights()

  const criteria = [
    {
      id: "difficulty",
      label: "Dificultad",
      description: "Preferencia por ejercicios fáciles o desafiantes",
    },
    {
      id: "duration",
      label: "Duración",
      description: "Preferencia por sesiones cortas o largas",
    },
    {
      id: "effectiveness",
      label: "Efectividad",
      description: "Prioridad en ejercicios comprobados y efectivos",
    },
    {
      id: "frequency",
      label: "Frecuencia",
      description: "Preferencia por ejercicios de baja o alta frecuencia",
    },
  ]

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Preferencias de Recomendación</h3>
        <p className="text-sm text-gray-600">
          Ajusta cuán importante es cada criterio para personalizar las recomendaciones de ejercicios.
        </p>
      </div>

      <div className="space-y-5">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <label className="text-sm font-medium">{criterion.label}</label>
                <p className="text-xs text-gray-500">{criterion.description}</p>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {(normalized[criterion.id as keyof typeof normalized] * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[weights[criterion.id as keyof typeof weights]]}
              onValueChange={([value]) =>
                updateWeight(criterion.id as keyof typeof weights, value)
              }
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <p className="font-medium mb-1">📊 Total de importancia: 100%</p>
        <p>
          Los porcentajes se ajustan automáticamente. Sube cualquier criterio para darle más peso.
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={resetWeights}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Restablecer
        </Button>
        {onClose && (
          <Button size="sm" onClick={onClose}>
            Aplicar
          </Button>
        )}
      </div>
    </Card>
  )
}
