import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { fetchExercises } from '../fetchExercises'

/**
 * Tests for fetchExercises API integration
 * Note: Requires running `pnpm run dev` before running tests
 */
describe('fetchExercises', () => {
  it('should return an array of exercises', async () => {
    const data = await fetchExercises()
    expect(Array.isArray(data)).toBe(true)
  })

  it('should support pagination with page and limit params', async () => {
    const data = await fetchExercises({
      page: 1,
      limit: 5
    })
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeLessThanOrEqual(5)
  })

  it('should support category filter', async () => {
    const data = await fetchExercises({
      category: 'movilidad',
      limit: 10
    })
    expect(Array.isArray(data)).toBe(true)
    // All returned exercises should have movilidad category
    if (data.length > 0) {
      data.forEach((exercise: any) => {
        expect(exercise.category).toBe('movilidad')
      })
    }
  })

  it('should support groupId filter', async () => {
    const data = await fetchExercises({
      groupId: 'neck',
      limit: 10
    })
    expect(Array.isArray(data)).toBe(true)
    // All returned exercises should belong to neck group
    if (data.length > 0) {
      data.forEach((exercise: any) => {
        expect(exercise.groupId).toBe('neck')
      })
    }
  })

  it('should handle errors gracefully', async () => {
    // Test with invalid parameters - should return empty array instead of throwing
    const data = await fetchExercises({
      groupId: 'nonexistent-group'
    })
    expect(Array.isArray(data)).toBe(true)
  })
})

