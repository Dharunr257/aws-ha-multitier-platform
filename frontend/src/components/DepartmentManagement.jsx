import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Search, X, AlertCircle } from 'lucide-react';

export default function DepartmentManagement({ onRefreshStats }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDept, setCurrentDept] = useState(null); // null for create, dept object for edit
  const [formError, setFormError] = useState('');
  
  // Form fields
  const [name, setName] = useState('');
  const [manager, setManager] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setCurrentDept(null);
    setName('');
    setManager('');
    setBudget('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (dept) => {
    setCurrentDept(dept);
    setName(dept.name);
    setManager(dept.manager);
    setBudget(dept.budget);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !manager.trim() || !budget) {
      setFormError('Please fill out all fields.');
      return;
    }

    const payload = {
      name: name.trim(),
      manager: manager.trim(),
      budget: parseFloat(budget)
    };

    try {
      if (currentDept) {
        // Edit Mode
        await axios.put(`/api/departments/${currentDept.id}`, payload);
      } else {
        // Create Mode
        await axios.post('/api/departments', payload);
      }
      setIsModalOpen(false);
      fetchDepartments();
      onRefreshStats(); // Trigger statistics updates in root
    } catch (err) {
      setFormError(err.response?.data?.error || 'An error occurred. Check inputs.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deleting this department will unassign all linked employees. Are you sure you want to proceed?')) return;
    try {
      await axios.delete(`/api/departments/${id}`);
      fetchDepartments();
      onRefreshStats();
    } catch (err) {
      alert('Failed to delete department: ' + (err.response?.data?.error || err.message));
    }
  };

  // Filter logic
  const filteredDepts = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 bg-slate-950">
      
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/40 glass-card">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments or managers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-aws-orange transition-all"
          />
        </div>
        
        {/* Actions */}
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-aws-orange hover:bg-aws-orange/90 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-aws hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Departments Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/50">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-aws-orange border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>Gathering department profiles...</span>
            </div>
          ) : filteredDepts.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <span>No departments found. Create one to get started!</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-850 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Department Name</th>
                  <th className="px-6 py-4">Lead Manager</th>
                  <th className="px-6 py-4">Allocated Budget</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40 text-sm text-slate-300">
                {filteredDepts.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-900/20 transition-all">
                    <td className="px-6 py-4 font-semibold text-white">{dept.name}</td>
                    <td className="px-6 py-4 text-slate-400">{dept.manager}</td>
                    <td className="px-6 py-4 font-mono text-slate-200">
                      ${parseFloat(dept.budget).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(dept)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-400 hover:text-white transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="p-1.5 rounded-lg bg-slate-800/40 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/20 text-slate-500 hover:text-rose-400 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl glass-card">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-md">
                {currentDept ? 'Modify Department Details' : 'Configure New Department'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {formError && (
                <div className="flex items-start gap-2.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Security"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-aws-orange transition-all"
                />
              </div>

              {/* Manager */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Manager Lead *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Vance"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-aws-orange transition-all"
                />
              </div>

              {/* Budget */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Fiscal Budget ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 500000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-aws-orange transition-all"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm border border-slate-700/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-aws-orange hover:bg-aws-orange/90 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-aws"
                >
                  {currentDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
