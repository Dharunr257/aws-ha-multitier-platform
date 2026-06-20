import React from 'react';
import { RefreshCw, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

export default function Header({ activeTab, onRefresh, isRefreshing, stressInfo, infraInfo }) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Operations Overview';
      case 'employees': return 'Employee Registry';
      case 'departments': return 'Department Directory';
      case 'operations': return 'AWS Operations Center';
      default: return 'AWS Dashboard';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">{getTabTitle()}</h2>
        
        {/* Dynamic Alarm Banner when Stress is Running */}
        {stressInfo && stressInfo.active && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ALARM: CPU STRESS EVENT ACTIVE ({stressInfo.timeRemaining}s remaining)</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Cloud details */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 border-r border-slate-800 pr-6">
          <div className="flex flex-col items-end">
            <span className="font-semibold text-slate-300">AWS Region: <span className="text-aws-orange">{infraInfo.availabilityZone ? infraInfo.availabilityZone.slice(0, -1) : 'us-east-1'}</span></span>
            <span className="text-[10px] text-slate-500">Account: 9472-8823-1104</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all ${
              isRefreshing ? 'animate-spin text-aws-orange border-aws-orange/40 bg-aws-orange/5' : ''
            }`}
            title="Refresh Telemetry Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700/50 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">ALB Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
