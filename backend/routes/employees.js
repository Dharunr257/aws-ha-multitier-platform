const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, d.name AS department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY e.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create employee
router.post('/', async (req, res) => {
  const { name, email, department_id, salary, status } = req.body;
  if (!name || !email || !salary) {
    return res.status(400).json({ error: 'Name, email, and salary are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO employees (name, email, department_id, salary, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, department_id || null, salary, status || 'Active']
    );
    res.status(201).json({ id: result.insertId, name, email, department_id, salary, status });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, department_id, salary, status } = req.body;

  if (!name || !email || !salary) {
    return res.status(400).json({ error: 'Name, email, and salary are required' });
  }

  try {
    const [result] = await db.query(
      'UPDATE employees SET name = ?, email = ?, department_id = ?, salary = ?, status = ? WHERE id = ?',
      [name, email, department_id || null, salary, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ id, name, email, department_id, salary, status });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM employees WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
