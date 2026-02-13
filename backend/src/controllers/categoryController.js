const CategoryModel = require('../models/CategoryModel');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await CategoryModel.findAll(req.user.id);
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const category = await CategoryModel.create({
      name,
      color,
      user_id: req.user.id
    });
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    // Check ownership
    const existing = await CategoryModel.findById(id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    if (existing.user_id && existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await CategoryModel.update(id, { name, color });
    if (!updated) return res.status(404).json({ error: 'Category not found' });

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const existing = await CategoryModel.findById(id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    if (existing.user_id && existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const deleted = await CategoryModel.delete(id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
