import mongoose from 'mongoose';

const routineExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    imageKey: {
      type: String,
      enum: ['pushups', 'squats', 'lunges', 'plank', 'rows', 'deadlift', null],
      default: null
    },
    loadType: {
      type: String,
      enum: ['bodyweight', 'weighted', 'both', null],
      default: null
    },
    weightKg: {
      type: Number,
      min: 0,
      max: 9999,
      default: null
    },
    sets: {
      type: Number,
      required: true,
      min: 1,
      max: 30
    }
  },
  { _id: false }
);

const routineSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    exercises: {
      type: [routineExerciseSchema],
      default: []
    }
  },
  { timestamps: true }
);

export const Routine = mongoose.model('Routine', routineSchema);
