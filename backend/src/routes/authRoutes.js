const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { z } = require('zod');
const authMiddleware = require('../middleware/authMiddleware');

const authSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

router.post('/register', validate(authSchema), authController.register);
router.post('/login', validate(authSchema), authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
