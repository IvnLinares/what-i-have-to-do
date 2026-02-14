const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';

const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await UserModel.create(username, hashedPassword);

    // Generate Token
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, username: user.username, role: user.role },
      token
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, role: user.role },
      token
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
    // req.user is set by authMiddleware
    if (!req.user) return res.status(401).json({error: 'Not authenticated'});
    res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  getMe
};
