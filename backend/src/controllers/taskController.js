const TaskModel = require('../models/taskModel');

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await TaskModel.findAll();
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
    res.json({ task });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await TaskModel.create(req.body);
    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const changes = await TaskModel.update(id, req.body);

    if (!changes) {
      // Check if task exists to differentiate 404 vs no changes?
      // Actually update returns true if row count > 0.
      // If row count is 0, it might be that the task doesn't exist.
      // But let's assume if update returns false, it's 404 because ID was not found.
      const exists = await TaskModel.findById(id);
      if (!exists) {
         return res.status(404).json({ error: 'Task not found' });
      }
      // If it exists but no changes, that's fine too, maybe just return success.
      // But standard REST often returns 200/204.
    }

    // Fetch updated task to return it? Or just message.
    // The original code returned message.
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
    const changes = await TaskModel.delete(id);
    if (!changes) {
      return res.status(404).json({ error: 'Task not found' });
    }
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
