const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all departments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM departments ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create department
router.post('/', async (req, res) => {
  const { name, manager, budget } = req.body;
  if (!name || !manager || !budget) {
    return res.status(400).json({ error: 'Name, manager, and budget are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO departments (name, manager, budget) VALUES (?, ?, ?)',
      [name, manager, budget]
    );
    res.status(201).json({ id: result.insertId, name, manager, budget });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Department name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update department
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, manager, budget } = req.body;

  if (!name || !manager || !budget) {
    return res.status(400).json({ error: 'Name, manager, and budget are required' });
  }

  try {
    const [result] = await db.query(
      'UPDATE departments SET name = ?, manager = ?, budget = ? WHERE id = ?',
      [name, manager, budget, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ id, name, manager, budget });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Department name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete department
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM departments WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
