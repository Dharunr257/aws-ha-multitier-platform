import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Edit2, Trash2, Search, X, Check, AlertCircle } from 'lucide-react';

export default function EmployeeManagement({ departments, onRefreshStats }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null); // null for create, employee object for edit
  const [formError, setFormError] = useState('');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [deptId, setDeptId] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setCurrentEmployee(null);
    setName('');
    setEmail('');
    setDeptId(departments[0]?.id || '');
    setSalary('');
    setStatus('Active');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setCurrentEmployee(emp);
    setName(emp.name);
    setEmail(emp.email);
    setDeptId(emp.department_id || '');
    setSalary(emp.salary);
    setStatus(emp.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim() || !salary) {
      setFormError('Please fill out all required fields.');
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      department_id: deptId ? parseInt(deptId) : null,
      salary: parseFloat(salary),
      status
    };

    try {
      if (currentEmployee) {
        // Edit Mode
        await axios.put(`/api/employees/${currentEmployee.id}`, payload);
      } else {
        // Create Mode
        await axios.post('/api/employees', payload);
      }
      setIsModalOpen(false);
      fetchEmployees();
      onRefreshStats(); // Trigger root statistics update
    } catch (err) {
      setFormError(err.response?.data?.error || 'An error occurred. Check input values.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee from registry?')) return;
    try {
      await axios.delete(`/api/employees/${id}`);
      fetchEmployees();
      onRefreshStats();
    } catch (err) {
      alert('Failed to delete employee: ' + (err.response?.data?.error || err.message));
    }
  };

  // Filter logic
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.department_name && emp.department_name.toLowerCase().includes(searchQuery.toLowerCase()))
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
            placeholder="Search employees, emails, or dept..."
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
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Employees Table Grid */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/50">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-aws-orange border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>Gathering staff directory...</span>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <span>No employees match the criteria.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-850 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Salary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40 text-sm text-slate-300">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-900/20 transition-all">
                    <td className="px-6 py-4 font-semibold text-white">{emp.name}</td>
                    <td className="px-6 py-4 text-slate-400">{emp.email}</td>
                    <td className="px-6 py-4">
                      {emp.department_name ? (
                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700/50 rounded-lg text-xs font-medium text-slate-300">
                          {emp.department_name}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-200">
                      ${parseFloat(emp.salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        emp.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-400 hover:text-white transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
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
                {currentEmployee ? 'Modify Employee Profile' : 'Register New Employee'}
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
                <label className="text-xs font-semibold text-slate-400 uppercase">Employee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Sterling"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-aws-orange transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. liam@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-aws-orange transition-all"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Department Assignment</label>
                <select
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-aws-orange transition-all"
                >
                  <option value="">Unassigned</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              {/* Salary & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Base Salary ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="90000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-aws-orange transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Employment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-aws-orange transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
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
                  {currentEmployee ? 'Save Changes' : 'Register Employee'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
