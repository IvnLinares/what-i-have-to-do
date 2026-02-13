const TagModel = require('../models/TagModel');

const getAllTags = async (req, res, next) => {
  try {
    const tags = await TagModel.findAll(req.user.id);
    res.json({ tags });
  } catch (error) {
    next(error);
  }
};

const createTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const tag = await TagModel.create({
      name,
      color,
      user_id: req.user.id
    });
    res.status(201).json({ tag });
  } catch (error) {
    next(error);
  }
};

const updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    // Check ownership
    const existing = await TagModel.findById(id);
    if (!existing) return res.status(404).json({ error: 'Tag not found' });
    if (existing.user_id && existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await TagModel.update(id, { name, color });
    if (!updated) return res.status(404).json({ error: 'Tag not found' });

    res.json({ message: 'Tag updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const existing = await TagModel.findById(id);
    if (!existing) return res.status(404).json({ error: 'Tag not found' });
    if (existing.user_id && existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const deleted = await TagModel.delete(id);
    if (!deleted) return res.status(404).json({ error: 'Tag not found' });

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTags,
  createTag,
  updateTag,
  deleteTag
};
