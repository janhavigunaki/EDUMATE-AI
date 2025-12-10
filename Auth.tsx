import React, { useState, useEffect } from 'react';
import { User, Board, Standard, Stream } from '../types';
import { BOARDS, STANDARDS, STREAMS, SUBJECTS_DATA, ADMIN_PASSWORD } from '../constants';
import { Database, Trash2, KeyRound, Download, ShieldCheck, Lock } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Academic Info
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [board, setBoard] = useState<Board>('CBSE');
  const [standard, setStandard] = useState<Standard>('10');
  const [stream, setStream] = useState<Stream>('Science');
  const [subjects, setSubjects] = useState<string[]>([]);

  // Database Viewer State
  const [showDb, setShowDb] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [dbUsers, setDbUsers] = useState<any[]>([]);

  useEffect(() => {
    if (showDb) {
      loadDatabase();
    }
  }, [showDb]);

  // Reset subjects when standard or stream changes
  useEffect(() => {
    setSubjects([]);
  }, [standard, stream]);

  const getAvailableSubjects = () => {
    if (standard === '11' || standard === '12') {
      if (stream === 'Science') return SUBJECTS_DATA.SCIENCE;
      if (stream === 'Commerce') return SUBJECTS_DATA.COMMERCE;
      if (stream === 'Arts') return SUBJECTS_DATA.ARTS;
      return SUBJECTS_DATA.SCIENCE; // Fallback
    }
    return SUBJECTS_DATA.GENERAL;
  };

  const loadDatabase = () => {
    const users: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key)!);
          // Fetch usage stats
          const resultsKey = `results_${userData.email}`;
          const results = JSON.parse(localStorage.getItem(resultsKey) || '[]');
          
          users.push({
            ...userData,
            testCount: results.length,
            lastActive: results.length > 0 ? new Date(results[results.length - 1].date).toLocaleDateString() : 'N/A'
          });
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }
    }
    setDbUsers(users);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const storedUser = localStorage.getItem(`user_${cleanEmail}`);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.password === password) {
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const { password: _, ...cleanUser } = parsedUser;
         onLogin(cleanUser as User);
      } else {
        alert("Invalid credentials");
      }
    } else {
      alert("User not found. Please register first.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name || !email || !password || !parentMobile) {
        alert("Please fill all fields");
        return;
      }
      setStep(2);
    } else {
      const cleanEmail = email.trim();
      const newUser = {
        name,
        email: cleanEmail,
        password,
        parentMobile,
        board,
        standard,
        stream: (standard === '11' || standard === '12') ? stream : undefined,
        subjects,
        isRegistered: true
      };
      localStorage.setItem(`user_${cleanEmail}`, JSON.stringify(newUser));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...cleanUser } = newUser;
      onLogin(cleanUser as User);
    }
  };

  const deleteUser = (userEmail: string) => {
    if (window.confirm(`Are you sure you want to delete data for ${userEmail}?`)) {
      localStorage.removeItem(`user_${userEmail}`);
      localStorage.removeItem(`results_${userEmail}`);
      localStorage.removeItem(`timetable_${userEmail}`);
      localStorage.removeItem(`notes_${userEmail}`);
      loadDatabase(); // Refresh list
    }
  };

  const downloadDatabase = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbUsers, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "edumate_students_db.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const toggleSubject = (subj: string) => {
    setSubjects(prev => 
      prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
    );
  };

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === ADMIN_PASSWORD) {
      setIsAdminMode(false);
      setShowDb(true);
      setAdminPasswordInput('');
    } else {
      alert("Incorrect Admin Password");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md z-10">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-2">EduMate AI</h2>
        
        {!isRegistering ? (
          <>
            <p className="text-center text-slate-500 mb-8">Welcome back, future topper!</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition">
                Login
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
              Don't have an account? <button type="button" onClick={() => setIsRegistering(true)} className="text-indigo-600 font-semibold hover:underline">Register</button>
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-center text-slate-700 mb-6">
              {step === 1 ? 'Create Account' : 'Academic Profile'}
            </h3>
            <form onSubmit={handleRegister} className="space-y-4">
              {step === 1 ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input required type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input required type="email" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input required type="password" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Parent's Mobile</label>
                    <input required type="tel" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={parentMobile} onChange={e => setParentMobile(e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Board</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={board} onChange={e => setBoard(e.target.value as Board)}>
                      {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                      <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={standard} onChange={e => setStandard(e.target.value as Standard)}>
                        {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {(standard === '11' || standard === '12') && (
                      <div className="w-1/2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Stream</label>
                        <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={stream} onChange={e => setStream(e.target.value as Stream)}>
                          {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Subjects 
                      <span className="text-xs font-normal text-slate-500 ml-2">
                        ({standard}th {(standard === '11' || standard === '12') ? stream : ''})
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded-lg">
                      {getAvailableSubjects().map(subj => (
                        <label key={subj} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                          <input 
                            type="checkbox" 
                            checked={subjects.includes(subj)}
                            onChange={() => toggleSubject(subj)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          {subj}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-between gap-4">
                {step === 2 && (
                  <button type="button" onClick={() => setStep(1)} className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition">
                    Back
                  </button>
                )}
                <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition">
                  {step === 1 ? 'Next' : 'Complete Setup'}
                </button>
              </div>
            </form>
            {step === 1 && (
              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account? <button type="button" onClick={() => setIsRegistering(false)} className="text-indigo-600 font-semibold hover:underline">Login</button>
              </p>
            )}
          </>
        )}
      </div>

      {/* Admin / Database Viewer Section */}
      <div className="mt-8 w-full max-w-4xl flex flex-col items-center">
        {!showDb ? (
          !isAdminMode ? (
            <button 
              onClick={() => setIsAdminMode(true)} 
              className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 transition-colors"
            >
              <ShieldCheck size={12} /> Admin Access
            </button>
          ) : (
             <form onSubmit={handleAdminAccess} className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-slate-200 animate-in fade-in zoom-in duration-300">
               <Lock size={16} className="text-slate-400 ml-2" />
               <input 
                 type="password" 
                 placeholder="Enter Admin Password" 
                 autoFocus
                 className="text-sm outline-none px-2 py-1 w-40"
                 value={adminPasswordInput}
                 onChange={(e) => setAdminPasswordInput(e.target.value)}
               />
               <button type="submit" className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded hover:bg-slate-900 transition">
                 Verify
               </button>
               <button type="button" onClick={() => setIsAdminMode(false)} className="text-slate-400 hover:text-slate-600 text-xs px-2">Cancel</button>
             </form>
          )
        ) : (
           <div className="w-full mt-4 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Database className="text-indigo-600" size={18} />
                  Student Database (Admin Only)
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={downloadDatabase}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition"
                    title="Export Database as JSON"
                  >
                    <Download size={14} />
                    Export DB
                  </button>
                  <button 
                    onClick={() => setShowDb(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline px-2"
                  >
                    Hide
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Profile</th>
                      <th className="px-6 py-3">Subjects</th>
                      <th className="px-6 py-3 text-center">Tests</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbUsers.length > 0 ? (
                      dbUsers.map((user) => (
                        <tr key={user.email} className="bg-white border-b hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                          <td className="px-6 py-4 text-slate-500">{user.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-slate-700">{user.board}</span>
                              <span className="text-xs text-slate-500">Class {user.standard}</span>
                              {user.stream && (
                                <span className="bg-purple-50 text-purple-700 text-[10px] px-1.5 py-0.5 rounded w-fit mt-1 border border-purple-100">
                                  {user.stream}
                                </span>
                              )}
                            </div>
                          </td>
                           <td className="px-6 py-4">
                            <span className="text-xs text-slate-600 truncate max-w-[150px] block" title={user.subjects?.join(', ')}>
                              {user.subjects?.length} subjects selected
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold ${user.testCount > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                              {user.testCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                             <button 
                               onClick={() => { setEmail(user.email); setPassword(user.password); window.scrollTo({top:0, behavior:'smooth'}); }}
                               className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                               title="Pre-fill Login"
                             >
                               <KeyRound size={16} />
                             </button>
                             <button 
                               onClick={() => deleteUser(user.email)}
                               className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                               title="Delete User"
                             >
                               <Trash2 size={16} />
                             </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">
                          No students registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default Auth;