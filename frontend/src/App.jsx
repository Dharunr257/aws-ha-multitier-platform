import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardHome from './components/DashboardHome';
import EmployeeManagement from './components/EmployeeManagement';
import DepartmentManagement from './components/DepartmentManagement';
import OperationsCenter from './components/OperationsCenter';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Rolling telemetry history (last 15 points, updated every 5s)
  const [telemetryHistory, setTelemetryHistory] = useState(
    Array.from({ length: 15 }, () => ({ cpu: 8, memory: 48 }))
  );

  const statsInterval = useRef(null);

  useEffect(() => {
    // 1. Initial fetches
    fetchStats();
    fetchDepartments();

    // 2. Poll stats every 5 seconds for active charts & CPU indicators
    statsInterval.current = setInterval(() => {
      fetchStatsSilent();
    }, 5000);

    return () => {
      if (statsInterval.current) clearInterval(statsInterval.current);
    };
  }, []);

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
      updateTelemetryHistory(response.data.telemetry);
    } catch (error) {
      console.error('Failed to retrieve operations telemetry:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchStatsSilent = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
      updateTelemetryHistory(response.data.telemetry);
    } catch (error) {
      console.error('Telemetry broadcast connection lost:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const updateTelemetryHistory = (newTelemetry) => {
    if (!newTelemetry) return;
    setTelemetryHistory(prev => {
      const updated = [...prev, { cpu: newTelemetry.cpu, memory: newTelemetry.memory }];
      // Keep last 15 elements
      if (updated.length > 15) {
        return updated.slice(updated.length - 15);
      }
      return updated;
    });
  };

  const handleManualRefresh = () => {
    fetchStats();
    fetchDepartments();
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome stats={stats} telemetryHistory={telemetryHistory} />;
      case 'employees':
        return (
          <EmployeeManagement 
            departments={departments} 
            onRefreshStats={fetchStatsSilent} 
          />
        );
      case 'departments':
        return (
          <DepartmentManagement 
            onRefreshStats={() => {
              fetchStatsSilent();
              fetchDepartments();
            }} 
          />
        );
      case 'operations':
        return (
          <OperationsCenter 
            stressInfo={stats?.stress} 
            onRefreshStats={fetchStatsSilent} 
          />
        );
      default:
        return <DashboardHome stats={stats} telemetryHistory={telemetryHistory} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemStatus={stats?.totals?.systemHealth || 'Healthy'}
        dbConnected={stats?.database?.status === 'Connected' || (stats && stats.totals ? true : false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header toolbar */}
        <Header 
          activeTab={activeTab} 
          onRefresh={handleManualRefresh} 
          isRefreshing={isRefreshing}
          stressInfo={stats?.stress}
          infraInfo={stats?.infrastructure || {}}
        />

        {/* View container */}
        <main className="flex-1 flex flex-col min-h-0">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
