import React, { useState } from 'react';
import { User, TimeTableEntry } from '../types';
import { Calendar, Save, RotateCcw } from 'lucide-react';
import { generateTimeTable } from '../services/geminiService';

interface TimetableProps {
  user: User;
  timetable: TimeTableEntry[];
  onSave: (table: TimeTableEntry[]) => void;
}

const Timetable: React.FC<TimetableProps> = ({ user, timetable, onSave }) => {
  const [schoolEnd, setSchoolEnd] = useState('16:00');
  const [loading, setLoading] = useState(false);
  const [localTable, setLocalTable] = useState<TimeTableEntry[]>(timetable);

  const handleGenerate = async () => {
    setLoading(true);
    const newTable = await generateTimeTable(schoolEnd, user);
    setLocalTable(newTable);
    onSave(newTable);
    setLoading(false);
  };

  const handleSlotChange = (dayIndex: number, slotIndex: number, field: string, value: string) => {
    const updated = [...localTable];
    updated[dayIndex].slots[slotIndex] = {
      ...updated[dayIndex].slots[slotIndex],
      [field]: value
    };
    setLocalTable(updated);
  };

  const saveChanges = () => {
    onSave(localTable);
    alert("Timetable saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">When does your school end?</label>
          <input 
            type="time" 
            value={schoolEnd}
            onChange={e => setSchoolEnd(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <RotateCcw className="animate-spin" /> : <Calendar />}
          Generate Timetable
        </button>
      </div>

      {localTable.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-slate-800">Your Weekly Schedule</h2>
             <button onClick={saveChanges} className="text-indigo-600 flex items-center gap-2 font-medium hover:bg-indigo-50 px-3 py-1.5 rounded-lg">
               <Save size={18} /> Save Changes
             </button>
           </div>
           
           <div className="space-y-6">
             {localTable.map((dayEntry, dIdx) => (
               <div key={dayEntry.day} className="border-b last:border-0 pb-4 last:pb-0">
                 <h3 className="font-bold text-slate-700 mb-3">{dayEntry.day}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {dayEntry.slots.map((slot, sIdx) => (
                     <div key={sIdx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                       <input 
                          className="w-full text-xs font-bold text-slate-500 bg-transparent border-none focus:ring-0 p-0"
                          value={slot.time}
                          onChange={(e) => handleSlotChange(dIdx, sIdx, 'time', e.target.value)}
                       />
                       <input 
                          className="w-full text-sm font-semibold text-indigo-700 bg-transparent border-b border-slate-200 focus:outline-none"
                          value={slot.activity}
                          onChange={(e) => handleSlotChange(dIdx, sIdx, 'activity', e.target.value)}
                       />
                       <select 
                          className="w-full text-xs text-slate-500 bg-transparent border-none p-0"
                          value={slot.type}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onChange={(e) => handleSlotChange(dIdx, sIdx, 'type', e.target.value as any)}
                       >
                         <option value="study">Study</option>
                         <option value="break">Break</option>
                         <option value="mock-test">Mock Test</option>
                       </select>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
