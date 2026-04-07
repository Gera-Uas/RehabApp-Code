export async function fetchExercises() {
  // During dev this reads local mock data; replace with real API fetch when ready.
  const data = await import('../../features/exercises/data/mockExercises.json');
  return data.default ?? data;
}