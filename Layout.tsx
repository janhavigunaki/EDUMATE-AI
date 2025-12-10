import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  MessageCircle, 
  PenTool, 
  BarChart2, 
  Calendar, 
  LogOut, 
  Menu, 
  X,
  Search,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  onDeleteAccount: (email: string, pass: string) => boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onDeleteAccount }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Delete Confirmation State
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <BarChart2 size={20} /> },
    { name: 'Doubt Solver', path: '/doubts', icon: <MessageCircle size={20} /> },
    { name: 'Notes', path: '/notes', icon: <BookOpen size={20} /> },
    { name: 'Exam Prep', path: '/exam', icon: <PenTool size={20} /> },
    { name: 'Resources', path: '/resources', icon: <Search size={20} /> },
    { name: 'Timetable', path: '/timetable', icon: <Calendar size={20} /> },
  ];

  const getPageTitle = () => {
    const current = navItems.find(item => item.path === location.pathname);
    return current ? current.name : 'EduMate AI';
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onDeleteAccount(confirmEmail, confirmPass);
    if (success) {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-700">Delete Account</h3>
                <p className="text-xs text-red-600">This action is permanent and cannot be undone.</p>
              </div>
            </div>
            
            <form onSubmit={handleDeleteSubmit} className="p-6 space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                To confirm deletion of your account and all associated data (notes, test results), please enter your credentials below.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm Email</label>
                <input 
                  type="email" 
                  required
                  value={confirmEmail}
                  onChange={e => setConfirmEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  required
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                  Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <BookOpen className="fill-indigo-600" />
            <span>EduMate AI</span>
          </div>
          <button 
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.board} • Class {user.standard}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2 shrink-0 bg-white">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <LogOut size={20} />
            Logout
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmEmail('');
              setConfirmPass('');
              setIsDeleteModalOpen(true);
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 size={20} />
            Delete Account
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-slate-800">{getPageTitle()}</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;