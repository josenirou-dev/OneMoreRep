import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/require-auth.js';
import { Routine } from '../models/routine.js';
import { Workout } from '../models/workout.js';

const router = Router();
const imageKeys = new Set(['pushups', 'squats', 'lunges', 'plank', 'rows', 'deadlift']);

function hasValidExercises(exercises) {
  return (
    Array.isArray(exercises) &&
    exercises.length <= 20 &&
    exercises.every((exercise) => {
      return (
        typeof exercise?.name === 'string' &&
        exercise.name.trim().length > 0 &&
        exercise.name.trim().length <= 80 &&
        Number.isInteger(exercise.sets) &&
        exercise.sets >= 1 &&
        exercise.sets <= 30 &&
        (exercise.loadType == null ||
          ['bodyweight', 'weighted', 'both'].includes(exercise.loadType)) &&
        (exercise.weightKg == null ||
          (typeof exercise.weightKg === 'number' &&
            Number.isFinite(exercise.weightKg) &&
            exercise.weightKg >= 0 &&
            exercise.weightKg <= 9999)) &&
        (exercise.imageKey == null || imageKeys.has(exercise.imageKey))
      );
    })
  );
}

function normalizeExercises(exercises) {
  return exercises.map(({ name, imageKey, loadType, weightKg, sets }) => ({
    name: name.trim(),
    imageKey: imageKey ?? null,
    loadType: loadType ?? null,
    weightKg: weightKg ?? null,
    sets
  }));
}

router.use(requireAuth);

router.get('/', async (request, response, next) => {
  try {
    const routines = await Routine.find({ ownerId: request.userId })
      .sort({ updatedAt: -1 })
      .lean();
    response.json(routines);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const exercises = request.body?.exercises ?? [];

  if (!name || name.length > 80) {
    response.status(400).json({ error: 'El nombre debe tener entre 1 y 80 caracteres.' });
    return;
  }

  if (!hasValidExercises(exercises)) {
    response.status(400).json({ error: 'Agrega hasta 20 ejercicios válidos, con 1 a 30 series cada uno.' });
    return;
  }

  try {
    const routine = await Routine.create({
      ownerId: request.userId,
      name,
      exercises: normalizeExercises(exercises)
    });
    response.status(201).json(routine);
  } catch (error) {
    next(error);
  }
});

router.put('/:routineId', async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.routineId)) {
    response.status(400).json({ error: 'La rutina indicada no es válida.' });
    return;
  }

  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const exercises = request.body?.exercises;

  if (!name || name.length > 80) {
    response.status(400).json({ error: 'El nombre debe tener entre 1 y 80 caracteres.' });
    return;
  }

  if (!hasValidExercises(exercises)) {
    response.status(400).json({ error: 'Agrega hasta 20 ejercicios válidos, con 1 a 30 series cada uno.' });
    return;
  }

  try {
    const routine = await Routine.findOneAndUpdate(
      { _id: request.params.routineId, ownerId: request.userId },
      { $set: { name, exercises: normalizeExercises(exercises) } },
      { new: true, runValidators: true }
    );

    if (!routine) {
      response.status(404).json({ error: 'No se encontró la rutina.' });
      return;
    }

    response.json(routine);
  } catch (error) {
    next(error);
  }
});

router.delete('/:routineId', async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.routineId)) {
    response.status(400).json({ error: 'La rutina indicada no es válida.' });
    return;
  }

  try {
    const routine = await Routine.findOneAndDelete({
      _id: request.params.routineId,
      ownerId: request.userId
    });

    if (!routine) {
      response.status(404).json({ error: 'No se encontró la rutina.' });
      return;
    }

    response.json({ message: 'Rutina eliminada.' });
  } catch (error) {
    next(error);
  }
});

router.post('/:routineId/workouts', async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.routineId)) {
    response.status(400).json({ error: 'La rutina indicada no es válida.' });
    return;
  }

  try {
    const routine = await Routine.findOne({
      _id: request.params.routineId,
      ownerId: request.userId
    }).lean();

    if (!routine) {
      response.status(404).json({ error: 'No se encontró la rutina.' });
      return;
    }

    const completedExercises = request.body?.exercises;
    if (
      !Array.isArray(completedExercises) ||
      completedExercises.length !== routine.exercises.length ||
      completedExercises.some((exercise, index) => {
        const plannedExercise = routine.exercises[index];
        return (
          !Array.isArray(exercise?.sets) ||
          exercise.sets.length !== plannedExercise.sets ||
          exercise.sets.some((set) => {
            return (
              !Number.isInteger(set?.reps) ||
              set.reps < 1 ||
              set.reps > 999 ||
              typeof (set?.weight ?? 0) !== 'number' ||
              !Number.isFinite(set?.weight ?? 0) ||
              (set?.weight ?? 0) < 0 ||
              (set?.weight ?? 0) > 9999
            );
          })
        );
      })
    ) {
      response.status(400).json({ error: 'Revisa las repeticiones y el peso registrados para cada serie.' });
      return;
    }

    const workout = await Workout.create({
      ownerId: request.userId,
      routineId: routine._id,
      routineName: routine.name,
      exercises: routine.exercises.map((exercise, index) => ({
        name: exercise.name,
        imageKey: exercise.imageKey ?? null,
        sets: completedExercises[index].sets.map((set) => ({
          reps: set.reps,
          weight: set.weight ?? 0
        }))
      }))
    });

    response.status(201).json(workout);
  } catch (error) {
    next(error);
  }
});

export default router;
