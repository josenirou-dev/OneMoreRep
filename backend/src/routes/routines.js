import { Router } from 'express';
import { requireAuth } from '../middleware/require-auth.js';
import { Routine } from '../models/routine.js';

const router = Router();

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

  if (!name || name.length > 80) {
    response.status(400).json({ error: 'El nombre debe tener entre 1 y 80 caracteres.' });
    return;
  }

  try {
    const routine = await Routine.create({ ownerId: request.userId, name });
    response.status(201).json(routine);
  } catch (error) {
    next(error);
  }
});

export default router;
