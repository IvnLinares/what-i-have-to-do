const TaskModel = require('../models/taskModel');
const cleanupService = require('../services/cleanupService');

const getAllTasks = async (req, res, next) => {
  try {
    // Pass user_id to filter tasks
    const tasks = await TaskModel.findAll(req.user.id);
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await TaskModel.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check ownership
    if (task.user_id && task.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    // Check task limit before creating
    const limitCheck = await cleanupService.checkTaskLimit(req.user.id);
    
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: 'Task limit reached',
        details: limitCheck
      });
    }

    // Update last login timestamp
    await cleanupService.updateLastLogin(req.user.id);

    const taskData = { ...req.body, user_id: req.user.id };
    const task = await TaskModel.create(taskData);
    res.status(201).json({
      message: 'Task created successfully',
      task,
      limit: limitCheck
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check existence and ownership
    const existing = await TaskModel.findById(id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    if (existing.user_id && existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const changes = await TaskModel.update(id, req.body);

    const updatedTask = await TaskModel.findById(id);
    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check existence and ownership
    const existing = await TaskModel.findById(id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    if (existing.user_id && existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await TaskModel.delete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
