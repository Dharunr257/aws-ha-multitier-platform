const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');
const { getInfrastructureInfo } = require('./health');

// Track running CPU stress tests
let activeStressWorkers = [];
let stressEndTime = null;

// Mock database query statistics
let baseReads = 120;
let baseWrites = 8;

// Get dashboard stats and simulated metrics
router.get('/dashboard/stats', async (req, res) => {
  try {
    // 1. Get totals
    const [[{ empCount }]] = await db.query('SELECT COUNT(*) as empCount FROM employees');
    const [[{ deptCount }]] = await db.query('SELECT COUNT(*) as deptCount FROM departments');
    
    // 2. Get department distribution
    const [deptDist] = await db.query(`
      SELECT d.name as department, COUNT(e.id) as count 
      FROM departments d 
      LEFT JOIN employees e ON d.id = e.department_id 
      GROUP BY d.id, d.name
    `);

    // 3. Get employee growth (hires by month, simulating a nice trend based on existing employees)
    // If all employees were seeded today, we spread them out dynamically over the last 6 months to make a nice chart
    const [growthRows] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
      FROM employees 
      GROUP BY month 
      ORDER BY month ASC
    `);

    // Dynamic fallback for growth data if everything is in one month
    let growthData = growthRows;
    if (growthRows.length <= 1) {
      const months = [];
      const now = new Date();
      let cumulative = Math.max(5, empCount - 15);
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        cumulative += Math.floor(Math.random() * 4) + 1;
        if (i === 0) {
          cumulative = empCount;
        }
        months.push({ month: monthName, count: cumulative });
      }
      growthData = months;
    } else {
      // Map database growth to short names
      growthData = growthRows.map(row => {
        const date = new Date(row.month + '-01');
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          count: row.count
        };
      });
    }

    // 4. Infrastructure Metadata
    const infra = await getInfrastructureInfo();

    // 5. Determine active CPU stress state
    const isCpuStressed = activeStressWorkers.length > 0;
    const nowTime = Date.now();
    let cpuLoad = isCpuStressed ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 8) + 8; // 85-99% under stress, 8-15% idle
    let memoryLoad = isCpuStressed ? Math.floor(Math.random() * 5) + 72 : Math.floor(Math.random() * 4) + 48; // 72-77% under stress, 48-52% idle
    
    let stressTimeRemaining = 0;
    if (isCpuStressed && stressEndTime) {
      stressTimeRemaining = Math.max(0, Math.ceil((stressEndTime - nowTime) / 1000));
      if (stressTimeRemaining === 0) {
        // Clean up completed workers
        activeStressWorkers.forEach(w => w.terminate());
        activeStressWorkers = [];
        stressEndTime = null;
        cpuLoad = Math.floor(Math.random() * 8) + 8;
        memoryLoad = Math.floor(Math.random() * 4) + 48;
      }
    }

    // Dynamic operations telemetry
    const reads = isCpuStressed ? baseReads + Math.floor(Math.random() * 200) + 150 : baseReads + Math.floor(Math.random() * 30) - 15;
    const writes = isCpuStressed ? baseWrites + Math.floor(Math.random() * 40) + 20 : baseWrites + Math.floor(Math.random() * 5) - 2;

    res.json({
      totals: {
        employees: empCount,
        departments: deptCount,
        records: empCount + deptCount,
        systemHealth: 'Healthy'
      },
      infrastructure: infra,
      telemetry: {
        cpu: cpuLoad,
        memory: memoryLoad,
        networkIn: isCpuStressed ? (Math.random() * 15 + 12).toFixed(1) : (Math.random() * 2 + 0.5).toFixed(1), // MB/s
        networkOut: isCpuStressed ? (Math.random() * 40 + 35).toFixed(1) : (Math.random() * 4 + 1.2).toFixed(1),
        dbReads: Math.max(0, reads),
        dbWrites: Math.max(0, writes),
        connections: isCpuStressed ? Math.floor(Math.random() * 40) + 25 : Math.floor(Math.random() * 8) + 5
      },
      stress: {
        active: isCpuStressed,
        timeRemaining: stressTimeRemaining,
        workerCount: activeStressWorkers.length
      },
      charts: {
        employeeGrowth: growthData,
        departmentDistribution: deptDist
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Infrastructure info
router.get('/infrastructure', async (req, res) => {
  try {
    const infra = await getInfrastructureInfo();
    res.json(infra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger CPU Stress Endpoint
router.post('/stress/cpu', async (req, res) => {
  const duration = parseInt(req.body.duration || 60); // duration in seconds
  if (duration < 10 || duration > 300) {
    return res.status(400).json({ error: 'Duration must be between 10 and 300 seconds' });
  }

  if (activeStressWorkers.length > 0) {
    return res.status(400).json({ 
      error: 'A CPU stress test is already in progress',
      timeRemaining: stressEndTime ? Math.max(0, Math.ceil((stressEndTime - Date.now()) / 1000)) : 0
    });
  }

  const durationMs = duration * 1000;
  stressEndTime = Date.now() + durationMs;
  
  // Launch workers relative to virtual CPU count (max 4 to avoid system crash, min 2)
  const numWorkers = Math.max(2, Math.min(os.cpus().length || 2, 4));
  const workerPath = path.join(__dirname, '../workers/cpuWorker.js');

  console.log(`Launching ${numWorkers} CPU stress worker threads for ${duration}s...`);

  try {
    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(workerPath, {
        workerData: { durationMs }
      });

      worker.on('message', (msg) => {
        console.log(`Worker thread ${i} sent message:`, msg);
      });

      worker.on('error', (err) => {
        console.error(`Worker thread ${i} error:`, err);
      });

      worker.on('exit', (code) => {
        console.log(`Worker thread ${i} exited with code:`, code);
        activeStressWorkers = activeStressWorkers.filter(w => w !== worker);
        if (activeStressWorkers.length === 0) {
          stressEndTime = null;
        }
      });

      activeStressWorkers.push(worker);
    }

    res.json({
      message: `Successfully triggered CPU stress on ${numWorkers} cores`,
      duration: duration,
      workersLaunched: numWorkers
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to spawn CPU stress workers: ${err.message}` });
  }
});

// Trigger Database Stress Endpoint (Bulk Insert)
router.post('/stress/database', async (req, res) => {
  const count = parseInt(req.body.count || 100);
  if (count < 10 || count > 50000) {
    return res.status(400).json({ error: 'Count must be between 10 and 50,000 records' });
  }

  try {
    // 1. Get existing department IDs
    const [departments] = await db.query('SELECT id FROM departments');
    const deptIds = departments.map(d => d.id);

    if (deptIds.length === 0) {
      return res.status(400).json({ error: 'Cannot seed employees: No departments exist yet. Please create a department first.' });
    }

    // 2. Mock names/domains
    const firstNames = ['Sophia', 'Jackson', 'Olivia', 'Lucas', 'Ava', 'Liam', 'Mia', 'Noah', 'Isabella', 'Ethan', 'Riley', 'Mason', 'Zoe', 'Oliver', 'Lily', 'Logan', 'Emily', 'Aaron', 'Amelia', 'Aiden', 'Logan', 'Emma', 'Caleb', 'Chloe', 'Ryan'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez'];
    const statuses = ['Active', 'Active', 'Active', 'Inactive'];

    const employeesToInsert = [];
    const uniqueEmails = new Set();

    const timestamp = new Date();

    // To prevent duplicate key errors, add a random suffix or timestamp
    for (let i = 0; i < count; i++) {
      const first = firstNames[Math.floor(Math.random() * firstNames.length)];
      const last = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${first} ${last}`;
      
      // email must be unique, make it unique using a random number / index combo
      let email = `${first.toLowerCase()}.${lastNameClean(last)}.${i}.${Math.floor(Math.random() * 10000)}@aws-stress.com`;
      while (uniqueEmails.has(email)) {
        email = `${first.toLowerCase()}.${lastNameClean(last)}.${i}.${Math.floor(Math.random() * 10000)}@aws-stress.com`;
      }
      uniqueEmails.add(email);

      const deptId = deptIds[Math.floor(Math.random() * deptIds.length)];
      const salary = (Math.random() * 80000 + 60000).toFixed(2);
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      employeesToInsert.push([name, email, deptId, salary, status, timestamp]);
    }

    function lastNameClean(lName) {
      return lName.replace(/\s+/g, '').toLowerCase();
    }

    // 3. Perform bulk insert in chunks of 5000 records to prevent maximum packet size errors
    const chunkSize = 5000;
    let totalInserted = 0;
    const startTime = Date.now();

    for (let i = 0; i < employeesToInsert.length; i += chunkSize) {
      const chunk = employeesToInsert.slice(i, i + chunkSize);
      await db.query(
        'INSERT INTO employees (name, email, department_id, salary, status, created_at) VALUES ?',
        [chunk]
      );
      totalInserted += chunk.length;
    }

    const durationMs = Date.now() - startTime;

    res.json({
      message: `Successfully performed database stress test`,
      recordsInserted: totalInserted,
      timeTakenMs: durationMs,
      averageInsertTimeMs: (durationMs / totalInserted).toFixed(4)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
