import { SAWCalculator } from '@/lib/mcdm/saw'
import type { Alternative, Criterion } from '@/lib/mcdm/types'
import { describe, it, expect, beforeEach } from 'vitest'

describe('SAWCalculator', () => {
  let saw: SAWCalculator

  beforeEach(() => {
    saw = new SAWCalculator()
  })

  it('should normalize scores correctly', () => {
    const alternatives: Alternative[] = [
      {
        id: '1',
        name: 'Option A',
        scores: { criterion1: 5 },
      },
      {
        id: '2',
        name: 'Option B',
        scores: { criterion1: 10 },
      },
      {
        id: '3',
        name: 'Option C',
        scores: { criterion1: 7 },
      },
    ]

    const criteria: Criterion[] = [
      {
        id: 'criterion1',
        name: 'Criterion 1',
        weight: 1.0,
        isMaximizing: true,
      },
    ]

    const results = saw.calculate(alternatives, criteria)

    // Option B should rank first (highest score)
    expect(results[0].alternativeId).toBe('2')
    expect(results[0].ranking).toBe(1)

    // Option C should rank second
    expect(results[1].alternativeId).toBe('3')
    expect(results[1].ranking).toBe(2)

    // Option A should rank third
    expect(results[2].alternativeId).toBe('1')
    expect(results[2].ranking).toBe(3)
  })

  it('should handle minimizing criteria correctly', () => {
    const alternatives: Alternative[] = [
      {
        id: '1',
        name: 'Fast',
        scores: { duration: 5 },
      },
      {
        id: '2',
        name: 'Slow',
        scores: { duration: 20 },
      },
    ]

    const criteria: Criterion[] = [
      {
        id: 'duration',
        name: 'Duration',
        weight: 1.0,
        isMaximizing: false, // minimize
      },
    ]

    const results = saw.calculate(alternatives, criteria)

    // Fast (5 min) should rank first
    expect(results[0].alternativeId).toBe('1')
    expect(results[0].ranking).toBe(1)

    // Slow (20 min) should rank second
    expect(results[1].alternativeId).toBe('2')
    expect(results[1].ranking).toBe(2)
  })

  it('should apply weights correctly', () => {
    const alternatives: Alternative[] = [
      {
        id: 'A',
        name: 'Option A',
        scores: {
          score1: 10, // high
          score2: 5,  // low
        },
      },
      {
        id: 'B',
        name: 'Option B',
        scores: {
          score1: 5, // low
          score2: 10, // high
        },
      },
    ]

    // High weight on score1 (maximize)
    const criteria: Criterion[] = [
      {
        id: 'score1',
        name: 'Score 1',
        weight: 0.8,
        isMaximizing: true,
      },
      {
        id: 'score2',
        name: 'Score 2',
        weight: 0.2,
        isMaximizing: true,
      },
    ]

    const results = saw.calculate(alternatives, criteria)

    // Option A should rank first (high score1 weight is 80%)
    expect(results[0].alternativeId).toBe('A')
    expect(results[0].ranking).toBe(1)

    // Option B should rank second
    expect(results[1].alternativeId).toBe('B')
    expect(results[1].ranking).toBe(2)
  })

  it('should handle equal scores', () => {
    const alternatives: Alternative[] = [
      {
        id: '1',
        name: 'Option A',
        scores: { criterion1: 5 },
      },
      {
        id: '2',
        name: 'Option B',
        scores: { criterion1: 5 },
      },
    ]

    const criteria: Criterion[] = [
      {
        id: 'criterion1',
        name: 'Criterion 1',
        weight: 1.0,
        isMaximizing: true,
      },
    ]

    const results = saw.calculate(alternatives, criteria)

    // Both should have same score (0.5)
    expect(results[0].score).toBeCloseTo(0.5)
    expect(results[1].score).toBeCloseTo(0.5)
  })

  it('should handle exercise recommendation scenario', () => {
    // Simular 3 ejercicios
    const alternatives: Alternative[] = [
      {
        id: 'pushup',
        name: 'Push-up',
        scores: {
          difficulty: 5,
          duration: 10,
          effectiveness: 5,
          frequency: 3,
        },
      },
      {
        id: 'plank',
        name: 'Plank',
        scores: {
          difficulty: 7,
          duration: 15,
          effectiveness: 5,
          frequency: 3,
        },
      },
      {
        id: 'stretch',
        name: 'Stretch',
        scores: {
          difficulty: 1,
          duration: 5,
          effectiveness: 2,
          frequency: 4,
        },
      },
    ]

    // Pesos: prefer efficiency (fast & effective)
    const criteria: Criterion[] = [
      {
        id: 'difficulty',
        name: 'Difficulty',
        weight: 0.15,
        isMaximizing: false,
      },
      {
        id: 'duration',
        name: 'Duration',
        weight: 0.25,
        isMaximizing: false,
      },
      {
        id: 'effectiveness',
        name: 'Effectiveness',
        weight: 0.50,
        isMaximizing: true,
      },
      {
        id: 'frequency',
        name: 'Frequency',
        weight: 0.10,
        isMaximizing: false,
      },
    ]

    const results = saw.calculate(alternatives, criteria)

    expect(results.length).toBe(3)
    expect(results.every((r) => r.ranking >= 1 && r.ranking <= 3)).toBe(true)

    // Plank and Push-up should rank higher than Stretch
    // (both have effectiveness 5 vs 2)
    const plankRank = results.find((r) => r.alternativeId === 'plank')?.ranking
    const stretchRank = results.find((r) => r.alternativeId === 'stretch')?.ranking

    expect(plankRank).toBeLessThan(stretchRank!)
  })
})
