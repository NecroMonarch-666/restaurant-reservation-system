const Table = require('../models/Table');

// GET /api/tables  — all users
const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tables  — admin only
const createTable = async (req, res) => {
  try {
    const { number, capacity } = req.body;
    if (!number || !capacity) {
      return res.status(400).json({ message: 'Number and capacity are required' });
    }
    const existing = await Table.findOne({ number });
    if (existing) {
      return res.status(409).json({ message: `Table ${number} already exists` });
    }
    const table = await Table.create({ number, capacity });
    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/tables/:id  — admin only (toggle isActive or update capacity)
const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTables, createTable, updateTable };
