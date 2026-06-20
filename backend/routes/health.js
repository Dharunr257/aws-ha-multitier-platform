const express = require('express');
const router = express.Router();
const db = require('../config/db');
const os = require('os');
const http = require('http');

// Helper to query AWS Metadata service with IMDSv2
async function getImdsV2Token() {
  return new Promise((resolve) => {
    const options = {
      host: '169.254.169.254',
      path: '/latest/api/token',
      port: 80,
      timeout: 500, // Quick timeout to avoid blocking if not in AWS
      method: 'PUT',
      headers: {
        'X-aws-ec2-metadata-token-ttl-seconds': '21600'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data.trim()));
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

async function getAwsMetadata(path, token = null) {
  return new Promise((resolve) => {
    const options = {
      host: '169.254.169.254',
      path: `/latest/meta-data/${path}`,
      port: 80,
      timeout: 500,
      method: 'GET'
    };

    if (token) {
      options.headers = { 'X-aws-ec2-metadata-token': token };
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data.trim()));
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

async function getInfrastructureInfo() {
  const token = await getImdsV2Token();
  let instanceId = null;
  let availabilityZone = null;

  if (token) {
    instanceId = await getAwsMetadata('instance-id', token);
    availabilityZone = await getAwsMetadata('placement/availability-zone', token);
  } else {
    instanceId = await getAwsMetadata('instance-id');
    availabilityZone = await getAwsMetadata('placement/availability-zone');
  }

  return {
    instanceId: instanceId || process.env.AWS_INSTANCE_ID || 'i-0df78921be4a8efd3 (Mock)',
    availabilityZone: availabilityZone || process.env.AWS_AVAILABILITY_ZONE || 'us-east-1a (Mock)',
    hostname: os.hostname(),
    containerVersion: process.env.CONTAINER_VERSION || '1.0.0'
  };
}

// Healthcheck Route
router.get('/', async (req, res) => {
  let dbStatus = 'Disconnected';
  let isHealthy = false;

  try {
    // Perform simple query to verify db connectivity
    const [rows] = await db.query('SELECT 1 as val');
    if (rows && rows[0] && rows[0].val === 1) {
      dbStatus = 'Connected';
      isHealthy = true;
    }
  } catch (error) {
    dbStatus = `Error: ${error.message}`;
  }

  const infra = await getInfrastructureInfo();

  const healthResponse = {
    status: isHealthy ? 'Healthy' : 'Unhealthy',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      host: process.env.DB_HOST || '127.0.0.1'
    },
    infrastructure: infra
  };

  if (isHealthy) {
    res.status(200).json(healthResponse);
  } else {
    res.status(500).json(healthResponse);
  }
});

module.exports = {
  router,
  getInfrastructureInfo
};
