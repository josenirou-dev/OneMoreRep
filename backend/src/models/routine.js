import mongoose from 'mongoose';

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
    }
  },
  { timestamps: true }
);

export const Routine = mongoose.model('Routine', routineSchema);
