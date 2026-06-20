import React, { useState } from 'react';
import axios from 'axios';
import { 
  Flame, 
  Database, 
  Activity, 
  Hourglass, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Terminal, 
  Cpu,
  RefreshCw,
  DatabaseBackup
} from 'lucide-react';

export default function OperationsCenter({ stressInfo, onRefreshStats }) {
  // CPU Stress state
  const [cpuDuration, setCpuDuration] = useState(60);
  const [cpuLoading, setCpuLoading] = useState(false);
  const [cpuResult, setCpuResult] = useState('');
  const [cpuError, setCpuError] = useState('');

  // DB Stress state
  const [dbCount, setDbCount] = useState(1000);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbResult, setDbResult] = useState(null);
  const [dbError, setDbError] = useState('');

  // Health check test state
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthResponse, setHealthResponse] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [healthLatency, setHealthLatency] = useState(null);

  // Trigger CPU load stress
  const handleCpuStress = async () => {
    setCpuLoading(true);
    setCpuResult('');
    setCpuError('');
    try {
      const res = await axios.post('/api/stress/cpu', { duration: cpuDuration });
      setCpuResult(res.data.message || `CPU Stress started successfully for ${cpuDuration} seconds.`);
      setTimeout(onRefreshStats, 1000); // refresh metrics
    } catch (err) {
      setCpuError(err.response?.data?.error || err.message);
    } finally {
      setCpuLoading(false);
    }
  };

  // Trigger DB load stress
  const handleDbStress = async () => {
    setDbLoading(true);
    setDbResult(null);
    setDbError('');
    try {
      const res = await axios.post('/api/stress/database', { count: dbCount });
      setDbResult(res.data);
      onRefreshStats(); // refresh database stats
    } catch (err) {
      setDbError(err.response?.data?.error || err.message);
    } finally {
      setDbLoading(false);
    }
  };

  // Trigger manual health endpoint check
  const runHealthCheck = async () => {
    setHealthLoading(true);
    setHealthResponse(null);
    setHealthStatus(null);
    const startTime = Date.now();
    try {
      const res = await axios.get('/health');
      setHealthResponse(res.data);
      setHealthStatus(res.status);
    } catch (err) {
      setHealthResponse(err.response?.data || { error: err.message });
      setHealthStatus(err.response?.status || 500);
    } finally {
      setHealthLatency(Date.now() - startTime);
      setHealthLoading(false);
      onRefreshStats();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 bg-slate-950">
      
      {/* Overview Intro Banner */}
      <div className="glass-card p-6 rounded-2xl bg-gradient-to-r from-slate-900/60 to-slate-900/30 border border-slate-800/40">
        <h3 className="text-white text-base font-bold mb-1.5">AWS Auto Scaling & Monitoring Demonstrator</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Use the operations controls below to simulate heavy compute and storage operations. These activities trigger AWS CloudWatch Alarms, database connections scale-ups, and EC2 Auto Scaling scale-out/scale-in events under the Application Load Balancer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMN 1: STRESS TRIGGER PANELS */}
        <div className="space-y-8">
          
          {/* CPU STRESS WIDGET */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/50 space-y-6 relative overflow-hidden">
            {/* Top orange highlight bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-aws-orange/70"></div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-aws-orange/10 text-aws-orange">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">CPU Stress Generator</h4>
                  <span className="text-[10px] text-slate-400">AWS Auto Scaling Demonstration</span>
                </div>
              </div>
              
              {stressInfo?.active && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1 rounded-full animate-pulse">
                  <Hourglass className="w-3.5 h-3.5" />
                  <span>STRESS RUNNING ({stressInfo.timeRemaining}s)</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Launches computation threads mapping workloads directly onto the CPU cores. Watch the CPU chart spike on the dashboard.
            </p>

            <div className="space-y-4">
              {/* Range Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Stress Duration:</span>
                  <span className="text-aws-orange font-mono">{cpuDuration} seconds</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={cpuDuration}
                  onChange={(e) => setCpuDuration(parseInt(e.target.value))}
                  disabled={stressInfo?.active || cpuLoading}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-aws-orange"
                />
                <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                  <span>10s</span>
                  <span>60s</span>
                  <span>120s</span>
                  <span>180s</span>
                  <span>240s</span>
                  <span>300s</span>
                </div>
              </div>

              {/* Action Trigger */}
              <button
                onClick={handleCpuStress}
                disabled={stressInfo?.active || cpuLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-aws-orange to-amber-500 hover:from-aws-orange/95 hover:to-amber-500/95 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none text-slate-950 font-bold rounded-xl text-sm transition-all shadow-aws hover:scale-[1.01]"
              >
                {cpuLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Engaging Threads...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Spike CPU Load</span>
                  </>
                )}
              </button>

              {/* Status Output */}
              {cpuResult && (
                <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{cpuResult}</span>
                </div>
              )}
              {cpuError && (
                <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{cpuError}</span>
                </div>
              )}
            </div>
          </div>

          {/* DATABASE STRESS WIDGET */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/50 space-y-6 relative overflow-hidden">
            {/* Top purple highlight bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-violet-500/70"></div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                <DatabaseBackup className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Database Stress Generator</h4>
                <span className="text-[10px] text-slate-400">Bulk Storage Seed & Stress Test</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Generates mock employee directories in bulk and executes single-query multi-row inserts on the MySQL / RDS database.
            </p>

            <div className="space-y-4">
              {/* Range Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Records to Insert:</span>
                  <span className="text-violet-400 font-mono">{dbCount.toLocaleString()} rows</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={dbCount}
                  onChange={(e) => setDbCount(parseInt(e.target.value))}
                  disabled={dbLoading}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                  <span>100</span>
                  <span>2,500</span>
                  <span>5,000</span>
                  <span>7,500</span>
                  <span>10,000</span>
                </div>
              </div>

              {/* Action Trigger */}
              <button
                onClick={handleDbStress}
                disabled={dbLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none text-white font-bold rounded-xl text-sm transition-all hover:scale-[1.01]"
              >
                {dbLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Bulk SQL...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Execute Bulk Insert</span>
                  </>
                )}
              </button>

              {/* DB Results */}
              {dbResult && (
                <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    <span>Database Stress Successful</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 mt-1 font-mono text-[11px] text-slate-300">
                    <li>Inserted: {dbResult.recordsInserted} records</li>
                    <li>Time Taken: {dbResult.timeTakenMs} ms</li>
                    <li>Avg Insert: {dbResult.averageInsertTimeMs} ms/row</li>
                  </ul>
                </div>
              )}
              {dbError && (
                <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{dbError}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* COLUMN 2: HEALTH ENDPOINT DIAGNOSTICS */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/50 flex flex-col justify-between relative overflow-hidden">
          {/* Top blue highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/70"></div>
          
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Health Probe Diagnostic</h4>
                <span className="text-[10px] text-slate-400">Load Balancer Target Group Simulation</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Triggers an HTTP GET request to the <code className="bg-slate-900 px-1 py-0.5 rounded text-aws-orange">/health</code> endpoint to test web server responsiveness and verify active RDS connection pools.
            </p>

            <button
              onClick={runHealthCheck}
              disabled={healthLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-200 hover:text-white font-bold rounded-xl text-sm transition-all"
            >
              {healthLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Probing Endpoint...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Probe /health Endpoint</span>
                </>
              )}
            </button>

            {/* HTTP Code, Latency Summary bar */}
            {(healthStatus !== null) && (
              <div className="flex items-center gap-4 text-xs font-semibold py-2 px-3 bg-slate-900/60 rounded-xl border border-slate-800/40">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded-md font-mono ${
                    healthStatus === 200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>{healthStatus}</span>
                </div>
                <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
                  <span className="text-slate-500">Latency:</span>
                  <span className="text-glow-cyan font-mono text-emerald-400">{healthLatency} ms</span>
                </div>
              </div>
            )}

            {/* RAW TERMINAL DUMP */}
            <div className="flex-1 flex flex-col bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 font-mono text-xs overflow-hidden h-64 mt-4 relative">
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-2 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <Terminal className="w-3.5 h-3.5 text-slate-600" />
                <span>Probe Shell output</span>
              </div>
              
              <div className="flex-1 overflow-auto text-slate-400 whitespace-pre scrollbar-thin select-text">
                {healthLoading ? (
                  <span className="text-emerald-500 animate-pulse">$ curl http://localhost:3000/health...</span>
                ) : healthResponse ? (
                  <>
                    <span className="text-slate-500">$ curl -i http://localhost:3000/health</span>
                    <br />
                    <span className="text-emerald-500">HTTP/1.1 {healthStatus} OK</span>
                    <br />
                    <span className="text-slate-500">Content-Type: application/json</span>
                    <br /><br />
                    {JSON.stringify(healthResponse, null, 2)}
                  </>
                ) : (
                  <span className="text-slate-600 italic">No diagnostic run yet. Trigger check above.</span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
