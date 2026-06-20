import React from 'react';
import { LayoutDashboard, Users, Network, Sliders, Server, Database } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, systemStatus, dbConnected }) {
  const menuItems = [
    { id: 'dashboard', label: 'Operations Overview', icon: LayoutDashboard },
    { id: 'employees', label: 'Employee Registry', icon: Users },
    { id: 'departments', label: 'Departments', icon: Network },
    { id: 'operations', label: 'Operations Center', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-aws-orange flex items-center justify-center font-bold text-slate-950 shadow-aws">
          aws
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-white leading-tight">OPS DASHBOARD</h1>
          <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Management Portal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-aws-orange/15 to-aws-orange/5 text-aws-orange border-l-4 border-aws-orange font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-100 border-l-4 border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-aws-orange' : 'text-slate-400 group-hover:text-slate-300'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Service Status Badges */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Server className="w-3.5 h-3.5" />
            <span>App Engine</span>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
            systemStatus === 'Healthy' 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'bg-rose-500/10 text-rose-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${systemStatus === 'Healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            {systemStatus === 'Healthy' ? 'HEALTHY' : 'DEGRADED'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Database className="w-3.5 h-3.5" />
            <span>RDS Instance</span>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
            dbConnected 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'bg-rose-500/10 text-rose-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`}></span>
            {dbConnected ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </aside>
  );
}
