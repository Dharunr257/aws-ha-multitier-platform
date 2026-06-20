const { parentPort, workerData } = require('worker_threads');

const durationMs = workerData.durationMs || 60000;
const start = Date.now();

console.log(`[Worker] Starting CPU stress thread. Duration: ${durationMs}ms`);

// Maintain high CPU usage by running busy-loops, yielding occasionally or running continuously
let iterations = 0;
while (Date.now() - start < durationMs) {
  // Execute heavy computations
  Math.sin(Math.random()) * Math.cos(Math.random()) * Math.tan(Math.random());
  iterations++;
}

console.log(`[Worker] CPU stress thread completed after ${iterations} iterations`);

if (parentPort) {
  parentPort.postMessage({ status: 'success', iterations });
}
