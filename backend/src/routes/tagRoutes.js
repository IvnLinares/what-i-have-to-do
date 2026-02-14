const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', tagController.getAllTags);
router.post('/', tagController.createTag);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

module.exports = router;
