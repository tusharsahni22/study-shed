import mongoose from 'mongoose';

/** A subject a student can enrol in, with its monthly add-on fee. */
const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, trim: true, uppercase: true },
    addOnFee: { type: Number, required: true, min: 0, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Subject', subjectSchema);
