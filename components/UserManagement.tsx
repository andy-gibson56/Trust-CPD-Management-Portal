
import React, { useState } from 'react';
import { User } from '../types';
import { SUPER_ADMIN_EMAILS, ACADEMIES } from '../constants';
import { Shield, ShieldAlert, Check, X, Search, Clock, Edit3, Save, Lock, Trash2, Plus, UserPlus } from 'lucide-react';

interface Props {
  currentUser: User;
  allUsers: User[];
  onUpdateUser: (updatedUser: User) => void;
  onAddUser: (newUser: User) => void;
  onRemoveUser: (email: string) => void;
}

const AVAILABLE_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'proposals', label: 'Proposal Triage' },
  { id: 'facilitator', label: 'Facilitator' },
  { id: 'catalog', label: 'Catalogue' },
  { id: 'participant', label: 'Participant' },
  { id: 'users', label: 'User Management' },
];

const UserManagement: React.FC<Props> = ({ currentUser, allUsers, onUpdateUser, onAddUser, onRemoveUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<User | null>(null);
  
  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState<{name: string, email: string, role: User['role'], academy: string}>({
      name: '', email: '', role: 'Colleague', academy: ''
  });

  // Security Check: Use canManageUsers property instead of hardcoded emails
  const canEdit = currentUser.canManageUsers;

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (user: User) => {
    setEditingEmail(user.email);
    setEditForm({ ...user });
  };

  const cancelEdit = () => {
    setEditingEmail(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (editForm) {
      onUpdateUser(editForm);
      setEditingEmail(null);
      setEditForm(null);
    }
  };

  const toggleTabPermission = (tabId: string) => {
    if (!editForm) return;
    const currentTabs = editForm.accessibleTabs || [];
    const newTabs = currentTabs.includes(tabId)
      ? currentTabs.filter(t => t !== tabId)
      : [...currentTabs, tabId];
    setEditForm({ ...editForm, accessibleTabs: newTabs });
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Determine default permissions based on role
      let tabs = ['participant'];
      let canManage = false;
      if (newUserForm.role === 'PDI') {
          tabs = ['dashboard', 'facilitator', 'catalog', 'participant', 'proposals'];
      } else if (newUserForm.role === 'Facilitator') {
          tabs = ['facilitator', 'participant'];
      }

      const newUser: User = {
          name: newUserForm.name,
          email: newUserForm.email.toLowerCase(),
          role: newUserForm.role,
          academy: newUserForm.academy,
          accessibleTabs: tabs,
          canManageUsers: canManage,
          activities: [{ action: 'Manually Added by Admin', timestamp: new Date().toISOString() }],
          // No lastLogin set
      };

      onAddUser(newUser);
      setIsAddModalOpen(false);
      setNewUserForm({ name: '', email: '', role: 'Colleague', academy: '' });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="bg-white p-8 rounded-lg shadow-sm border-l-4 border-coop-blue flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-[26pt] font-bold text-coop-dark mb-1">User Management</h2>
          <p className="text-gray-600 text-[14pt]">View user activity and manage access permissions across the platform.</p>
        </div>
        <div className="flex items-center gap-4">
            {!canEdit && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-2 rounded flex items-center">
                    <Lock size={16} className="mr-2"/>
                    <span className="text-sm font-bold">Read Only Mode</span>
                </div>
            )}
            {canEdit && (
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center bg-coop-blue text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-coop-dark transition-colors"
                >
                    <UserPlus size={20} className="mr-2"/> Add User
                </button>
            )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input 
            type="text" 
            placeholder="Search users by name or email..." 
            className="w-full pl-12 pr-4 py-4 text-[14pt] border rounded-lg shadow-sm focus:border-coop-blue outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-[12pt] uppercase tracking-wider">
                <th className="p-6">User Details</th>
                <th className="p-6">Academy / Team</th>
                <th className="p-6">Role</th>
                <th className="p-6">Last Login</th>
                <th className="p-6">Access & Permissions</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => {
                const isEditing = editingEmail === user.email;
                const userToRender = isEditing && editForm ? editForm : user;

                return (
                  <tr key={user.email} className={`hover:bg-blue-50/30 transition-colors ${isEditing ? 'bg-blue-50' : ''}`}>
                    <td className="p-6">
                      <div className="font-bold text-coop-dark text-[14pt]">{userToRender.name}</div>
                      <div className="text-gray-500 text-sm">{userToRender.email}</div>
                      {/* Super Admin Status responsive to permission */}
                      {userToRender.canManageUsers && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10pt] font-bold bg-purple-100 text-purple-700 mt-1">
                              <ShieldAlert size={12} className="mr-1"/> Super Admin
                          </span>
                      )}
                    </td>

                    <td className="p-6">
                        {isEditing ? (
                            <select 
                                className="p-2 border rounded bg-white w-full text-sm"
                                value={userToRender.academy || ''}
                                onChange={e => setEditForm({...editForm!, academy: e.target.value})}
                            >
                                <option value="">Select Academy...</option>
                                <option value="Central Team">Central Team</option>
                                {ACADEMIES.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                            </select>
                        ) : (
                            <div className="text-sm font-medium text-gray-700">{userToRender.academy || 'N/A'}</div>
                        )}
                    </td>
                    
                    <td className="p-6">
                        {isEditing ? (
                            <select 
                                className="p-2 border rounded bg-white w-full text-sm"
                                value={userToRender.role}
                                onChange={e => setEditForm({...editForm!, role: e.target.value as any})}
                            >
                                <option value="PDI">PDI</option>
                                <option value="Facilitator">Facilitator</option>
                                <option value="Colleague">Colleague</option>
                            </select>
                        ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${userToRender.role === 'PDI' ? 'bg-coop-blue text-white' : 'bg-gray-100 text-gray-600'}`}>
                                {userToRender.role}
                            </span>
                        )}
                    </td>

                    <td className="p-6 text-sm text-gray-600">
                        <div className="flex items-center">
                            <Clock size={16} className="mr-2 text-gray-400"/>
                            {userToRender.lastLogin ? new Date(userToRender.lastLogin).toLocaleDateString() : 'Never'}
                        </div>
                        {userToRender.activities && userToRender.activities.length > 0 && (
                            <div className="mt-1 text-xs text-gray-400 truncate max-w-[150px]" title={userToRender.activities[0].action}>
                                Last: {userToRender.activities[0].action}
                            </div>
                        )}
                    </td>

                    <td className="p-6">
                        {isEditing ? (
                            <div className="space-y-3 bg-white p-4 rounded border border-blue-200">
                                <p className="text-xs font-bold text-gray-400 uppercase">Visible Tabs</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {AVAILABLE_TABS.map(tab => (
                                        <label key={tab.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={userToRender.accessibleTabs.includes(tab.id)}
                                                onChange={() => toggleTabPermission(tab.id)}
                                                className="text-coop-blue rounded"
                                            />
                                            <span>{tab.label}</span>
                                        </label>
                                    ))}
                                </div>
                                
                                <div className="border-t border-gray-100 pt-2 mt-2">
                                    <label className="flex items-center space-x-2 text-sm cursor-pointer text-red-600 font-bold">
                                        <input 
                                            type="checkbox" 
                                            checked={userToRender.canManageUsers}
                                            onChange={e => setEditForm({...editForm!, canManageUsers: e.target.checked})}
                                            className="text-red-600 rounded"
                                        />
                                        <span>Allow User Manager Access</span>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <div className="flex flex-wrap gap-1">
                                    {userToRender.accessibleTabs.map(t => (
                                        <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10pt] rounded border border-gray-200 capitalize">{t}</span>
                                    ))}
                                </div>
                                {userToRender.canManageUsers && (
                                    <div className="text-xs text-green-600 font-bold flex items-center mt-1">
                                        <Shield size={12} className="mr-1"/> User Manager
                                    </div>
                                )}
                            </div>
                        )}
                    </td>

                    <td className="p-6 text-right">
                        {canEdit && (
                            isEditing ? (
                                <div className="flex justify-end space-x-2">
                                    <button onClick={saveEdit} className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors" title="Save"><Check size={20}/></button>
                                    <button onClick={cancelEdit} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors" title="Cancel"><X size={20}/></button>
                                </div>
                            ) : (
                                <div className="flex justify-end space-x-2">
                                    <button onClick={() => startEdit(user)} className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-coop-blue hover:text-white transition-colors" title="Edit">
                                        <Edit3 size={20}/>
                                    </button>
                                    {user.email !== currentUser.email && (
                                        <button 
                                            onClick={() => { if(window.confirm('Are you sure you want to remove this user?')) onRemoveUser(user.email) }} 
                                            className="p-2 bg-red-50 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors" 
                                            title="Remove User"
                                        >
                                            <Trash2 size={20}/>
                                        </button>
                                    )}
                                </div>
                            )
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="p-6 bg-coop-blue text-white flex justify-between items-center">
                      <h3 className="text-xl font-bold flex items-center"><UserPlus size={24} className="mr-2"/> Add New User</h3>
                      <button onClick={() => setIsAddModalOpen(false)} className="hover:text-gray-200"><X size={24}/></button>
                  </div>
                  <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                          <input required type="text" className="w-full border p-3 rounded focus:border-coop-blue outline-none" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} placeholder="e.g. Jane Doe" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                          <input required type="email" className="w-full border p-3 rounded focus:border-coop-blue outline-none" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} placeholder="name@coopacademies.co.uk" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Academy / Team</label>
                          <select required className="w-full border p-3 rounded focus:border-coop-blue outline-none bg-white" value={newUserForm.academy} onChange={e => setNewUserForm({...newUserForm, academy: e.target.value})}>
                                <option value="">Select...</option>
                                <option value="Central Team">Central Team</option>
                                {ACADEMIES.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                          <select required className="w-full border p-3 rounded focus:border-coop-blue outline-none bg-white" value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value as any})}>
                                <option value="Colleague">Colleague</option>
                                <option value="Facilitator">Facilitator</option>
                                <option value="PDI">PDI Team</option>
                          </select>
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                          <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-coop-blue text-white font-bold rounded hover:bg-coop-dark transition-colors">Create User</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default UserManagement;
