import React from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { 
  Users, 
  FolderGit2, 
  Database, 
  Activity, 
  Cpu, 
  HardDrive, 
  Network, 
  Layers, 
  Info,
  Flame
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardHome({ stats, telemetryHistory }) {
  if (!stats) return (
    <div className="flex-1 flex items-center justify-center text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-aws-orange border-t-transparent rounded-full animate-spin"></div>
        <span>Awaiting telemetry broadcast...</span>
      </div>
    </div>
  );

  const { totals, infrastructure, telemetry, stress, charts } = stats;

  // 1. Employee Growth Chart Config
  const growthLabels = charts.employeeGrowth.map(item => item.month);
  const growthData = charts.employeeGrowth.map(item => item.count);
  
  const employeeGrowthConfig = {
    labels: growthLabels,
    datasets: [
      {
        fill: true,
        label: 'Cumulative Hires',
        data: growthData,
        borderColor: '#FF9900',
        backgroundColor: 'rgba(255, 153, 0, 0.08)',
        tension: 0.4,
        pointBackgroundColor: '#FF9900',
        pointBorderColor: '#0b0f19',
        pointHoverRadius: 6,
      }
    ]
  };

  // 2. Department Distribution Chart Config
  const deptLabels = charts.departmentDistribution.map(item => item.department);
  const deptCounts = charts.departmentDistribution.map(item => item.count);

  const deptDistributionConfig = {
    labels: deptLabels,
    datasets: [
      {
        label: 'Employees',
        data: deptCounts,
        backgroundColor: [
          'rgba(255, 153, 0, 0.75)', // AWS Orange
          'rgba(0, 180, 216, 0.75)',  // Cyan
          'rgba(16, 185, 129, 0.75)', // Green
          'rgba(139, 92, 246, 0.75)', // Purple
          'rgba(244, 63, 94, 0.75)',  // Rose
        ],
        borderColor: '#0b0f19',
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  };

  // 3. Live Telemetry History Chart (Rolling CPU / Memory Load)
  const historyLabels = telemetryHistory.map((_, i) => `${i * 5}s ago`).reverse();
  const cpuHistory = telemetryHistory.map(h => h.cpu);
  const memHistory = telemetryHistory.map(h => h.memory);

  const telemetryHistoryConfig = {
    labels: historyLabels,
    datasets: [
      {
        label: 'CPU Load (%)',
        data: cpuHistory,
        borderColor: '#FF9900',
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: 'Memory Util (%)',
        data: memHistory,
        borderColor: '#00B4D8',
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
      }
    ]
  };

  // Chart Options Common
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 bg-slate-950">
      
      {/* 1. EXECUTIVE OVERVIEW CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Employees</span>
            <div className="text-3xl font-extrabold text-white">{totals.employees}</div>
            <p className="text-[10px] text-emerald-400 font-medium">Active directory registry</p>
          </div>
          <div className="p-4 rounded-xl bg-aws-orange/10 text-aws-orange shadow-[0_0_10px_rgba(255,153,0,0.1)]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Departments */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Departments</span>
            <div className="text-3xl font-extrabold text-white">{totals.departments}</div>
            <p className="text-[10px] text-slate-400 font-medium">Structured Org-units</p>
          </div>
          <div className="p-4 rounded-xl bg-sky-500/10 text-sky-400 shadow-[0_0_10px_rgba(0,180,216,0.1)]">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </div>

        {/* Database Records */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DB Record Count</span>
            <div className="text-3xl font-extrabold text-white">{totals.records}</div>
            <p className="text-[10px] text-slate-400 font-medium">Total registered elements</p>
          </div>
          <div className="p-4 rounded-xl bg-violet-500/10 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
            <Database className="w-6 h-6" />
          </div>
        </div>

        {/* System Health */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Health</span>
            <div className={`text-3xl font-extrabold ${totals.systemHealth === 'Healthy' ? 'text-emerald-400 text-glow-cyan' : 'text-rose-400 text-glow-orange'}`}>
              {totals.systemHealth}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">AWS Health Checks passing</p>
          </div>
          <div className={`p-4 rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.1)] ${
            totals.systemHealth === 'Healthy' 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'bg-rose-500/10 text-rose-400'
          }`}>
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* 2. INFRASTRUCTURE & METRICS ROW */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AWS INFRASTRUCTURE STATUS WIDGET */}
        <div className="glass-card p-6 rounded-2xl col-span-1 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Layers className="w-4 h-4 text-aws-orange" />
              <h3 className="text-sm font-bold tracking-wide text-white uppercase">AWS Infrastructure Details</h3>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">EC2 Instance ID</span>
                <span className="text-sm font-mono font-medium text-slate-200">{infrastructure.instanceId}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Availability Zone</span>
                <span className="text-sm font-mono font-medium text-slate-200">{infrastructure.availabilityZone}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Hostname (Container ID)</span>
                <span className="text-sm font-mono font-medium text-slate-200">{infrastructure.hostname}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Image Tag (Version)</span>
                <span className="text-sm font-mono font-medium text-slate-200">v{infrastructure.containerVersion}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex items-start gap-2.5 text-[11px] text-slate-400 bg-slate-900/20 p-2.5 rounded-xl border border-slate-800/40">
            <Info className="w-3.5 h-3.5 text-aws-orange shrink-0 mt-0.5" />
            <p>Metadata queried using IMDSv2 within the AWS Auto Scaling group subnet layer.</p>
          </div>
        </div>

        {/* LIVE TELEMETRY RADAR / PERFORMANCE METRICS */}
        <div className="glass-card p-6 rounded-2xl col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-aws-orange" />
              <h3 className="text-sm font-bold tracking-wide text-white uppercase">Real-time Telemetry</h3>
            </div>
            
            {stress.active && (
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
                <Flame className="w-3 h-3 text-rose-400 animate-bounce" />
                STRESS TEST: ON ({stress.workerCount} Workers Active)
              </span>
            )}
          </div>

          {/* Metric dials */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {/* CPU */}
            <div className="flex flex-col items-center p-4 bg-slate-900/40 border border-slate-800/40 rounded-2xl text-center space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CPU Util</span>
              <div className={`text-2xl font-extrabold tracking-tight ${stress.active ? 'text-rose-400 animate-pulse' : 'text-aws-orange'}`}>
                {telemetry.cpu}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${stress.active ? 'bg-rose-500' : 'bg-aws-orange'}`}
                  style={{ width: `${telemetry.cpu}%` }}
                ></div>
              </div>
            </div>

            {/* RAM */}
            <div className="flex flex-col items-center p-4 bg-slate-900/40 border border-slate-800/40 rounded-2xl text-center space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Memory Util</span>
              <div className="text-2xl font-extrabold text-sky-400 tracking-tight">
                {telemetry.memory}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${telemetry.memory}%` }}
                ></div>
              </div>
            </div>

            {/* Network Out */}
            <div className="flex flex-col items-center p-4 bg-slate-900/40 border border-slate-800/40 rounded-2xl text-center space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Network Out</span>
              <div className="text-2xl font-extrabold text-violet-400 tracking-tight">
                {telemetry.networkOut} <span className="text-xs text-slate-500">MB/s</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                <Network className="w-3 h-3 text-slate-500" />
                <span>In: {telemetry.networkIn} MB/s</span>
              </div>
            </div>

            {/* Active Connections */}
            <div className="flex flex-col items-center p-4 bg-slate-900/40 border border-slate-800/40 rounded-2xl text-center space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Conns</span>
              <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                {telemetry.connections}
              </div>
              <div className="flex items-center gap-1 text-[9px] text-slate-400">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>Reads/Writes: {telemetry.dbReads}/{telemetry.dbWrites}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DIAGNOSTICS & TELEMETRY CHARTS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Telemetry Line Chart */}
        <div className="glass-card p-6 rounded-2xl col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <Cpu className="w-4 h-4 text-aws-orange" />
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">Live CPU & Memory Utilization History</h3>
          </div>
          <div className="h-64">
            <Line data={telemetryHistoryConfig} options={chartOptions} />
          </div>
        </div>

        {/* Department Distribution (Doughnut) */}
        <div className="glass-card p-6 rounded-2xl col-span-1">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <Layers className="w-4 h-4 text-aws-orange" />
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">Department Staff Share</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {charts.departmentDistribution.length > 0 ? (
              <Doughnut 
                data={deptDistributionConfig} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'bottom',
                      labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 10 }
                    }
                  }
                }} 
              />
            ) : (
              <span className="text-xs text-slate-500">No department elements to graph.</span>
            )}
          </div>
        </div>

        {/* Employee Growth (Bar) */}
        <div className="glass-card p-6 rounded-2xl col-span-1 lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <Users className="w-4 h-4 text-aws-orange" />
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">Cumulative Employee Directory Scale</h3>
          </div>
          <div className="h-60">
            <Bar data={employeeGrowthConfig} options={chartOptions} />
          </div>
        </div>

      </section>

    </div>
  );
}
