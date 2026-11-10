import mongoose from 'mongoose';

const workoutSetSchema = new mongoose.Schema(
  {
    reps: {
      type: Number,
      required: true,
      min: 1,
      max: 999
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 9999,
      default: 0
    }
  },
  { _id: false }
);

const workoutExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    imageKey: {
      type: String,
      enum: ['pushups', 'squats', 'lunges', 'plank', 'rows', 'deadlift', null],
      default: null
    },
    sets: {
      type: [workoutSetSchema],
      required: true
    }
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      index: true
    },
    routineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      required: true
    },
    routineName: {
      type: String,
      required: true
    },
    exercises: {
      type: [workoutExerciseSchema],
      required: true
    }
  },
  { timestamps: true }
);

export const Workout = mongoose.model('Workout', workoutSchema);
