import React, { useState, useEffect } from 'react';
import { Clock, Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { User, TestResult } from '../types';
import { generateMockTest, gradeAnswerSheet } from '../services/geminiService';
import { MOCK_TEST_DURATION_CHAPTER, MOCK_TEST_DURATION_FULL } from '../constants';

interface ExamCenterProps {
  user: User;
  onTestComplete: (result: TestResult) => void;
}

type ExamState = 'setup' | 'loading' | 'active' | 'upload' | 'grading' | 'result';

const ExamCenter: React.FC<ExamCenterProps> = ({ user, onTestComplete }) => {
  const [state, setState] = useState<ExamState>('setup');
  const [subject, setSubject] = useState(user.subjects?.[0] || '');
  const [chapter, setChapter] = useState('');
  const [isFullSyllabus, setIsFullSyllabus] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  // Timer
  useEffect(() => {
    let interval: number;
    if (state === 'active' && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && state === 'active') {
      setState('upload');
    }
    return () => clearInterval(interval);
  }, [state, timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartTest = async () => {
    if (!chapter && !isFullSyllabus) {
      alert("Please enter a chapter or select full syllabus");
      return;
    }
    setState('loading');
    const testData = await generateMockTest(subject, chapter, isFullSyllabus, user);
    setQuestions(testData.questions);
    setTimeLeft((isFullSyllabus ? MOCK_TEST_DURATION_FULL : MOCK_TEST_DURATION_CHAPTER) * 60);
    setState('active');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      alert("Please upload an image of your answers.");
      return;
    }

    setState('grading');
    
    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const gradeData = await gradeAnswerSheet(questions, base64String, user);
      
      const newResult: TestResult = {
        id: Date.now().toString(),
        testId: Date.now().toString(),
        subject,
        chapter: isFullSyllabus ? 'Full Syllabus' : chapter,
        score: gradeData.score,
        totalMarks: gradeData.totalMarks,
        feedback: gradeData.feedback,
        correctAnswers: gradeData.correctAnswers,
        date: Date.now()
      };
      
      setResult(newResult);
      onTestComplete(newResult);
      setState('result');
    };
    reader.readAsDataURL(imageFile);
  };

  if (state === 'setup') {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Exam Preparation Agent</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <select 
              value={subject} 
              onChange={e => setSubject(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {user.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-4 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={!isFullSyllabus} 
                onChange={() => setIsFullSyllabus(false)} 
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700">Chapter Wise</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={isFullSyllabus} 
                onChange={() => { setIsFullSyllabus(true); setChapter(''); }} 
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700">Full Syllabus Mock</span>
            </label>
          </div>

          {!isFullSyllabus && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chapter Name</label>
              <input 
                type="text" 
                value={chapter} 
                onChange={e => setChapter(e.target.value)}
                placeholder="e.g. Calculus"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="bg-indigo-50 p-4 rounded-lg text-sm text-indigo-800">
            <p className="font-semibold">Instructions:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Chapter tests are 1 hour long. Full mock tests are 3 hours.</li>
              <li>Questions will be generated by AI based on your board pattern.</li>
              <li>Write answers on paper, take a photo, and upload for AI grading.</li>
            </ul>
          </div>

          <button 
            onClick={handleStartTest}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
          >
            Generate & Start Test
          </button>
        </div>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-lg font-medium text-slate-600">Generating Questions...</p>
      </div>
    );
  }

  if (state === 'active') {
    return (
      <div className="space-y-6">
        <div className="sticky top-0 bg-white p-4 shadow-sm z-10 flex justify-between items-center rounded-xl border border-slate-200">
          <h3 className="font-bold text-lg text-slate-800">{subject} - {isFullSyllabus ? 'Mock Test' : chapter}</h3>
          <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-indigo-600'}`}>
            <Clock size={24} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h4 className="text-xl font-bold mb-6 border-b pb-2">Questions</h4>
          <ol className="list-decimal pl-5 space-y-4">
            {questions.map((q, idx) => (
              <li key={idx} className="text-slate-800 font-medium">{q}</li>
            ))}
          </ol>
        </div>

        <div className="fixed bottom-6 right-6">
          <button 
            onClick={() => setState('upload')}
            className="bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <CheckCircle /> Submit Test
          </button>
        </div>
      </div>
    );
  }

  if (state === 'upload' || state === 'grading') {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <Upload className="mx-auto text-indigo-600 mb-4" size={48} />
        <h3 className="text-2xl font-bold mb-2">Upload Answer Sheet</h3>
        <p className="text-slate-500 mb-6">Take a clear photo of your written answers and upload it here for AI grading.</p>
        
        {state === 'grading' ? (
           <div className="flex flex-col items-center py-8">
             <RefreshCw className="animate-spin text-indigo-600 mb-4" size={32} />
             <p>Analyzing handwriting and grading...</p>
           </div>
        ) : (
          <div className="space-y-4">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            <button 
              onClick={handleSubmit}
              disabled={!imageFile}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Submit for Grading
            </button>
          </div>
        )}
      </div>
    );
  }

  if (state === 'result' && result) {
    const percentage = Math.round((result.score / result.totalMarks) * 100);
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-3xl font-bold mb-2">Test Results</h2>
          <div className={`text-6xl font-bold mb-2 ${percentage > 70 ? 'text-green-600' : percentage > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
            {percentage}%
          </div>
          <p className="text-slate-500 text-lg">Score: {result.score} / {result.totalMarks}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="text-indigo-600" />
              AI Feedback
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap">{result.feedback}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-600" />
              Correct Answers
            </h3>
             <p className="text-slate-700 whitespace-pre-wrap text-sm">{result.correctAnswers}</p>
          </div>
        </div>
        
        <button 
          onClick={() => setState('setup')}
          className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 transition"
        >
          Back to Exam Center
        </button>
      </div>
    );
  }

  return null;
};

export default ExamCenter;
