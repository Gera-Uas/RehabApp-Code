import { describe, it, expect } from 'vitest'
import { ContentBasedRecommender } from '../content-based'
import type { Exercise } from '@/src/types'

describe('ContentBasedRecommender', () => {
  const sampleExercises: Exercise[] = [
    {
      id: 'ex1',
      name: 'Estiramiento de cuádriceps',
      videoUrl: 'https://example.com/1',
      metrics: { difficulty: 3, duration: 10, effectiveness: 4, frequency: 3 },
      tags: ['flexibilidad', 'tren-inferior', 'estiramientos'],
      equipment: 'sin-equipo',
      targetMuscles: ['cuádriceps', 'psoas-iliaco'],
      movementType: 'estático',
      level: 'principiante',
      position: 'de-pie',
    },
    {
      id: 'ex2',
      name: 'Estiramiento de isquiotibiales',
      videoUrl: 'https://example.com/2',
      metrics: { difficulty: 2, duration: 12, effectiveness: 4, frequency: 4 },
      tags: ['flexibilidad', 'tren-inferior', 'estiramientos'],
      equipment: 'sin-equipo',
      targetMuscles: ['isquiotibiales', 'gemelos'],
      movementType: 'estático',
      level: 'principiante',
      position: 'sentado',
    },
    {
      id: 'ex3',
      name: 'Sentadilla sin peso',
      videoUrl: 'https://example.com/3',
      metrics: { difficulty: 5, duration: 8, effectiveness: 5, frequency: 3 },
      tags: ['fortalecimiento', 'tren-inferior', 'progresivo'],
      equipment: 'sin-equipo',
      targetMuscles: ['cuádriceps', 'glúteo-mayor'],
      movementType: 'dinámico',
      level: 'intermedio',
      position: 'de-pie',
    },
    {
      id: 'ex4',
      name: 'Estiramiento de pecho',
      videoUrl: 'https://example.com/4',
      metrics: { difficulty: 2, duration: 10, effectiveness: 3, frequency: 4 },
      tags: ['flexibilidad', 'tren-superior', 'mejora-postura'],
      equipment: 'pared',
      targetMuscles: ['pectoral-mayor'],
      movementType: 'estático',
      level: 'principiante',
      position: 'de-pie',
    },
  ]

  it('should find similar exercises based on tags and metrics', () => {
    const recommender = new ContentBasedRecommender()
    const source = sampleExercises[0] // Estiramiento de cuádriceps
    
    const results = recommender.findSimilar(source, sampleExercises, 3)
    
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].exercise.id).not.toBe(source.id) // No recomienda a sí mismo
    
    // El más similar debería ser otro estiramiento de tren inferior
    expect(results[0].exercise.tags).toContain('tren-inferior')
  })

  it('should exclude the source exercise from recommendations', () => {
    const recommender = new ContentBasedRecommender()
    const source = sampleExercises[0]
    
    const results = recommender.findSimilar(source, sampleExercises, 10)
    
    const hasSelfReference = results.some(r => r.exercise.id === source.id)
    expect(hasSelfReference).toBe(false)
  })

  it('should calculate similarity scores between 0 and 1', () => {
    const recommender = new ContentBasedRecommender()
    const source = sampleExercises[0]
    
    const results = recommender.findSimilar(source, sampleExercises, 3)
    
    results.forEach(result => {
      expect(result.similarityScore).toBeGreaterThanOrEqual(0)
      expect(result.similarityScore).toBeLessThanOrEqual(1)
    })
  })

  it('should provide match reasons for recommendations', () => {
    const recommender = new ContentBasedRecommender()
    const source = sampleExercises[0]
    
    const results = recommender.findSimilar(source, sampleExercises, 3)
    
    if (results.length > 0) {
      expect(results[0].matchReasons).toBeDefined()
      expect(Array.isArray(results[0].matchReasons)).toBe(true)
    }
  })

  it('should find complementary exercises', () => {
    const recommender = new ContentBasedRecommender()
    const source = sampleExercises[0] // Cuádriceps
    
    const results = recommender.findComplementary(source, sampleExercises, 2)
    
    // Debería recomendar ejercicios con músculos complementarios
    const hasComplementary = results.some(r => 
      r.exercise.targetMuscles?.includes('isquiotibiales') ||
      r.exercise.targetMuscles?.includes('glúteo-mayor')
    )
    
    expect(hasComplementary).toBe(true)
  })

  it('should sort results by similarity score descending', () => {
    const recommender = new ContentBasedRecommender()
    const source = sampleExercises[0]
    
    const results = recommender.findSimilar(source, sampleExercises, 3)
    
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].similarityScore).toBeGreaterThanOrEqual(results[i + 1].similarityScore)
    }
  })

  it('should respect the topN parameter', () => {
    const recommender = new ContentBasedRecommender()
    const source = sampleExercises[0]
    
    const results = recommender.findSimilar(source, sampleExercises, 2)
    
    expect(results.length).toBeLessThanOrEqual(2)
  })
})
