export type RoutineExercise = {
  name: string;
  imageKey: string | null;
  sets: number;
  loadType?: 'bodyweight' | 'weighted' | 'both' | null;
  weightKg?: number | null;
};

export type Routine = {
  _id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function request<T>(
  path: string,
  idToken: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error('Configura EXPO_PUBLIC_API_URL en frontend/.env.');
  }

  const response = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...options.headers
    }
  });

  const result: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof result === 'object' &&
      result !== null &&
      'error' in result &&
      typeof result.error === 'string'
        ? result.error
        : `La solicitud falló (${response.status}).`;
    throw new Error(message);
  }

  return result as T;
}

export function getRoutines(idToken: string) {
  return request<Routine[]>('/api/routines', idToken);
}

export function createRoutine(
  idToken: string,
  name: string,
  exercises: RoutineExercise[]
) {
  return request<Routine>('/api/routines', idToken, {
    method: 'POST',
    body: JSON.stringify({ name, exercises })
  });
}

export function updateRoutine(
  idToken: string,
  routineId: string,
  name: string,
  exercises: RoutineExercise[]
) {
  return request<Routine>(`/api/routines/${routineId}`, idToken, {
    method: 'PUT',
    body: JSON.stringify({ name, exercises })
  });
}

export function deleteRoutine(idToken: string, routineId: string) {
  return request<{ message: string }>(`/api/routines/${routineId}`, idToken, {
    method: 'DELETE'
  });
}
