import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// GET /api/subjects
export const listSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find().sort({ name: 1 }).lean();
  res.json(subjects);
});

// POST /api/subjects
export const createSubject = asyncHandler(async (req, res) => {
  const { name, code, addOnFee } = req.body;
  if (!name) throw new ApiError(400, 'Subject name is required');
  const created = await Subject.create({
    name,
    code,
    addOnFee: addOnFee ?? 0,
  });
  res.status(201).json(created);
});

// PUT /api/subjects/:id
export const updateSubject = asyncHandler(async (req, res) => {
  const updated = await Subject.findByIdAndUpdate(
    req.params.id,
    {
      ...(req.body.name !== undefined && { name: req.body.name }),
      ...(req.body.code !== undefined && { code: req.body.code }),
      ...(req.body.addOnFee !== undefined && { addOnFee: req.body.addOnFee }),
      ...(req.body.active !== undefined && { active: req.body.active }),
    },
    { new: true, runValidators: true }
  );
  if (!updated) throw new ApiError(404, 'Subject not found');
  res.json(updated);
});

// DELETE /api/subjects/:id
export const deleteSubject = asyncHandler(async (req, res) => {
  const inUse = await Student.countDocuments({ subjects: req.params.id });
  if (inUse > 0) {
    throw new ApiError(
      409,
      `Cannot delete: ${inUse} student(s) are enrolled in this subject`
    );
  }
  const deleted = await Subject.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Subject not found');
  res.json({ message: 'Subject deleted' });
});
