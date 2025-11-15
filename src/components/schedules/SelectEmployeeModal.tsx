'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '@/graphql/user-queries';

type Employee = {
  id: string;
  name: string;
  position: string;
  location: string;
};

type SelectEmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (employee: Employee) => void;
  title: string;
  companyId?: string;
  positionFilter?: string; // Filter by position (e.g., "Dentist" for doctors only)
  excludePosition?: string; // Exclude position (e.g., "Dentist" to exclude dentists)
};

export default function SelectEmployeeModal({
  isOpen,
  onClose,
  onSelect,
  title,
  companyId,
  positionFilter,
  excludePosition
}: SelectEmployeeModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading } = useQuery(GET_USERS, {
    variables: {
      companyId,
    },
    skip: !isOpen
  });

  // Filter users by position and active status
  const allUsers = data?.users || [];
  const employees: Employee[] = allUsers
    .filter((user: any) => {
      if (!user.isActive) return false;
      
      // Include only users matching positionFilter (if specified)
      if (positionFilter && !user.position?.toLowerCase().includes(positionFilter.toLowerCase())) {
        return false;
      }
      
      // Exclude users with excludePosition (if specified)
      if (excludePosition && user.position?.toLowerCase().includes(excludePosition.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .map((user: any) => ({
      id: user.id,
      name: user.name,
      position: user.position || 'N/A',
      location: user.department || 'N/A'
    }));

  // Debug logging
  if (isOpen && positionFilter) {
    console.log('SelectEmployeeModal - Position Filter:', positionFilter);
    console.log('SelectEmployeeModal - Total users:', allUsers.length);
    console.log('SelectEmployeeModal - Filtered employees:', employees.length);
    console.log('SelectEmployeeModal - Sample employees:', employees.slice(0, 3).map(e => ({ name: e.name, position: e.position })));
  }

  // Filter employees based on search
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (employee: Employee) => {
    onSelect(employee);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, position, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary-400/60 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
            autoFocus
          />
        </div>

        {/* Employee List */}
        <div className="max-h-[400px] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500/30 border-t-primary-500"></div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              {searchTerm ? 'No employees found matching your search' : 'No active employees available'}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => handleSelect(employee)}
                  className="w-full px-4 py-3 text-left transition hover:bg-white/5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{employee.name}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {employee.position} • {employee.location}
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
