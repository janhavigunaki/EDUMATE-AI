import React from 'react';
import { User, TimeTableEntry, TestResult } from '../types';
import { Clock, TrendingUp, BookOpen } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
  timetable: TimeTableEntry[];
  recentResults: TestResult[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, timetable, recentResults }) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = timetable.find(t => t.day === today)?.slots || [];

  const chartData = recentResults.slice(-5).map(r => ({
    name: r.subject.substring(0, 3) + ' - ' + (r.chapter === 'Full Syllabus' ? 'Mock' : 'Ch'),
    score: Math.round((r.score / r.totalMarks) * 100)
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white col-span-1 md:col-span-2">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
          <p className="opacity-90">Ready to ace your {user.board} Class {user.standard} exams? Let's start studying.</p>
          <div className="mt-6 flex gap-4">
             <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
               <span className="block text-2xl font-bold">{recentResults.length}</span>
               <span className="text-sm opacity-80">Tests Taken</span>
             </div>
             <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
               <span className="block text-2xl font-bold">{user.subjects?.length}</span>
               <span className="text-sm opacity-80">Subjects</span>
             </div>
          </div>
        </div>

        {/* Up Next Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
           <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
             <Clock size={20} className="text-indigo-600" />
             Today's Schedule ({today})
           </h3>
           <div className="space-y-3 max-h-48 overflow-y-auto">
             {todaySchedule.length > 0 ? todaySchedule.map((slot, idx) => (
               <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                 <span className="text-xs font-bold text-slate-500 w-24">{slot.time}</span>
                 <div>
                    <p className="text-sm font-semibold text-indigo-700">{slot.activity}</p>
                    <p className="text-xs text-slate-400 capitalize">{slot.type}</p>
                 </div>
               </div>
             )) : (
               <p className="text-slate-500 text-sm">No schedule generated yet.</p>
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Recent Performance (%)
          </h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#8884d8" fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No test data available</div>
            )}
          </div>
        </div>

        {/* Resources / Quick Links */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
             <BookOpen size={20} className="text-orange-500" />
             Study Strategy
          </h3>
          <div className="prose prose-sm text-slate-600">
            <p>Based on your recent tests, here are some tips:</p>
            <ul className="list-disc pl-4 space-y-2 mt-2">
              <li>Focus on improving your weak areas identified in recent mock tests.</li>
              <li>Stick to the generated timetable to ensure consistent revision.</li>
              <li>Use the Doubt Solver for instant clarification on complex topics.</li>
              <li>Take a full syllabus mock test every weekend.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
