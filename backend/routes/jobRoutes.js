const express = require('express');
const router = express.Router();
const JobRequest = require('../models/JobRequest');
const JobRequestFactory = require('../patterns/JobRequestFactory');
const jobQueue = require('../patterns/JobQueue');
const { requireAuth } = require('./workerRoutes');

// GET /api/jobs — list all, optional ?category=Plumbing&status=Open
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }
    const jobs = await JobRequest.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id — single job (admins/workers only)
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const job = await JobRequest.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs — create job using Factory + Queue
router.post('/', async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const newJob = JobRequestFactory.createOpenJob(req.body);
    jobQueue.enqueue(newJob);
    await jobQueue.processAll();
    res.status(201).json(newJob);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/jobs/:id — update status, assignedWorker, or feedback
router.patch('/:id', async (req, res, next) => {
  try {
    const { status, assignedWorker, feedback } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Closed'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    // Build update object explicitly so nested fields save correctly
    const update = {};
    if (status) update.status = status;
    if (assignedWorker) {
      update['assignedWorker.name']  = assignedWorker.name  || '';
      update['assignedWorker.phone'] = assignedWorker.phone || '';
    }
    if (feedback) {
      update['feedback.rating']      = feedback.rating;
      update['feedback.comment']     = feedback.comment || '';
      update['feedback.submittedAt'] = new Date();
    }

    const job = await JobRequest.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/feedback — customer submits feedback
router.post('/:id/feedback', async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const job = await JobRequest.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'Closed') {
      return res.status(400).json({ message: 'Feedback can only be submitted for closed jobs' });
    }
    if (job.feedback?.rating) {
      return res.status(400).json({ message: 'Feedback already submitted' });
    }
    job.feedback = { rating, comment: comment || '', submittedAt: new Date() };
    await job.save();
    res.json(job);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:id/feedback — admin/customer removes feedback
router.delete('/:id/feedback', async (req, res, next) => {
  try {
    const job = await JobRequest.findByIdAndUpdate(
      req.params.id,
      { $unset: { feedback: '' } },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:id — blocked when In Progress
router.delete('/:id', async (req, res, next) => {
  try {
    const job = await JobRequest.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status === 'In Progress') {
      return res.status(400).json({ message: 'Cannot delete a job that is In Progress' });
    }
    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;