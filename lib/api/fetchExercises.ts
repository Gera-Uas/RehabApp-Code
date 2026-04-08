export async function fetchExercises(params?: {
  page?: number
  limit?: number
  category?: string
  groupId?: string
}) {
  try {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.category) searchParams.set('category', params.category)
    if (params?.groupId) searchParams.set('groupId', params.groupId)

    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    const response = await fetch(`/api/exercises${query}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch exercises: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return []
  }
}