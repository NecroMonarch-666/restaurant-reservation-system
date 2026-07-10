const express = require('express');
const { getTables, createTable, updateTable } = require('../controllers/tableController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getTables);
router.post('/', protect, isAdmin, createTable);
router.patch('/:id', protect, isAdmin, updateTable);

module.exports = router;
