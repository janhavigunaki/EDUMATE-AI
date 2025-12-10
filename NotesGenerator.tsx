import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2, Save, Trash2, Eye, File } from 'lucide-react';
import { User, Note } from '../types';
import { generateNotes } from '../services/geminiService';
import { jsPDF } from 'jspdf';

interface NotesGeneratorProps {
  user: User;
  notes: Note[];
  onSaveNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

const NotesGenerator: React.FC<NotesGeneratorProps> = ({ user, notes, onSaveNote, onDeleteNote }) => {
  const [selectedSubject, setSelectedSubject] = useState(user.subjects?.[0] || '');
  const [chapter, setChapter] = useState('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'pdf'>('text');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // When active note changes, if in PDF mode, regenerate PDF blob
  useEffect(() => {
    if (viewMode === 'pdf' && activeNote) {
      generatePdfUrl(activeNote);
    }
  }, [viewMode, activeNote]);

  const handleGenerate = async () => {
    if (!chapter.trim()) return;
    setLoading(true);
    setViewMode('text'); // Reset to text view on new generation
    const content = await generateNotes(selectedSubject, chapter, user);
    
    const newNote: Note = {
      id: Date.now().toString(),
      subject: selectedSubject,
      chapter: chapter,
      content,
      createdAt: Date.now()
    };
    
    setActiveNote(newNote);
    setLoading(false);
  };

  const generatePdfDoc = (note: Note) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${note.chapter}`, 10, 15);
    doc.setFontSize(12);
    doc.text(`Subject: ${note.subject} | Board: ${user.board}`, 10, 25);
    doc.line(10, 28, 200, 28);
    
    const splitText = doc.splitTextToSize(note.content.replace(/\*/g, ''), 180);
    doc.setFontSize(11);
    doc.text(splitText, 10, 35);
    return doc;
  };

  const generatePdfUrl = (note: Note) => {
    const doc = generatePdfDoc(note);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
  };

  const handleDownloadPDF = () => {
    if (!activeNote) return;
    const doc = generatePdfDoc(activeNote);
    doc.save(`${activeNote.chapter}_notes.pdf`);
  };

  const handleSaveToDocs = () => {
    if (!activeNote) return;
    // Check if already saved
    if (notes.find(n => n.id === activeNote.id)) {
      alert("This note is already saved.");
      return;
    }
    onSaveNote(activeNote);
    alert("Note saved to Documents!");
  };

  const handleSelectNote = (note: Note) => {
    setActiveNote(note);
    setViewMode('text');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar: Saved Documents */}
      <div className="w-full lg:w-1/4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            My Documents
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {notes.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">
              No saved notes yet.<br/>Generate and save one!
            </div>
          ) : (
            notes.map(note => (
              <div 
                key={note.id}
                className={`p-3 rounded-lg cursor-pointer border transition group relative ${
                  activeNote?.id === note.id 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                }`}
                onClick={() => handleSelectNote(note)}
              >
                <div className="pr-6">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">{note.chapter}</h4>
                  <p className="text-xs text-slate-500">{note.subject}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(note.createdAt).toLocaleDateString()}</p>
                </div>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); if (activeNote?.id === note.id) setActiveNote(null); }}
                  className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition"
                  title="Delete Note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Generator Controls */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 shrink-0">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subject</label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {user.subjects?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
            <div className="flex-[2] w-full">
               <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Chapter</label>
               <input 
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g. Chemical Bonding"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <button 
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-semibold h-[38px]"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
              Generate
            </button>
          </div>
        </div>

        {/* Note Preview Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[400px]">
          {activeNote ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                 <div className="flex items-center gap-2">
                   <button 
                     type="button"
                     onClick={() => setViewMode('text')}
                     className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${viewMode === 'text' ? 'bg-white shadow text-indigo-600' : 'text-slate-600 hover:bg-slate-200'}`}
                   >
                     <FileText size={14} /> Text
                   </button>
                   <button 
                     type="button"
                     onClick={() => setViewMode('pdf')}
                     className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${viewMode === 'pdf' ? 'bg-white shadow text-indigo-600' : 'text-slate-600 hover:bg-slate-200'}`}
                   >
                     <Eye size={14} /> PDF Preview
                   </button>
                 </div>

                 <div className="flex items-center gap-2">
                    {!notes.find(n => n.id === activeNote.id) && (
                      <button 
                        type="button"
                        onClick={handleSaveToDocs}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium transition"
                      >
                        <Save size={14} /> Save
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium transition"
                    >
                      <Download size={14} /> Download
                    </button>
                 </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto bg-slate-50/50">
                 {viewMode === 'text' ? (
                   <div className="p-8 max-w-4xl mx-auto bg-white min-h-full shadow-sm">
                      <div className="border-b pb-4 mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">{activeNote.chapter}</h1>
                        <p className="text-sm text-slate-500 mt-1">{activeNote.subject} • {new Date(activeNote.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="prose prose-slate max-w-none text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {activeNote.content}
                      </div>
                   </div>
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-slate-100">
                     {pdfUrl ? (
                       <iframe 
                         src={pdfUrl} 
                         className="w-full h-full border-0"
                         title="PDF Preview"
                       />
                     ) : (
                       <div className="flex flex-col items-center text-slate-400">
                         <Loader2 className="animate-spin mb-2" />
                         <span className="text-xs">Generating PDF Preview...</span>
                       </div>
                     )}
                   </div>
                 )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <File size={48} className="mb-4 text-slate-200" />
               <p className="text-sm">Select a subject and chapter to generate notes.</p>
               <p className="text-xs mt-1">Or select a saved document from the left.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesGenerator;