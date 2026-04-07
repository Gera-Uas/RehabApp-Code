import { describe, it, expect } from 'vitest'
import { fetchExercises } from '../fetchExercises'

describe('fetchExercises', () => {
  it('devuelve datos mock (objeto o array)', async () => {
    const data = await fetchExercises()
    console.log(JSON.stringify(data, null, 2))
    expect(data).toBeDefined()
    expect(typeof data === 'object').toBe(true)
  })
})
