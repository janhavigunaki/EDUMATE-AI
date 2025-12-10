import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import DoubtSolver from './components/DoubtSolver';
import NotesGenerator from './components/NotesGenerator';
import ExamCenter from './components/ExamCenter';
import Resources from './components/Resources';
import Timetable from './components/Timetable';
import { User, TestResult, TimeTableEntry, Note } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [timetable, setTimetable] = useState<TimeTableEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // Load state from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('active_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      loadUserData(JSON.parse(savedUser).email);
    }
  }, []);

  const loadUserData = (email: string) => {
    const results = localStorage.getItem(`results_${email}`);
    if (results) setTestResults(JSON.parse(results));
    
    const table = localStorage.getItem(`timetable_${email}`);
    if (table) setTimetable(JSON.parse(table));

    const savedNotes = localStorage.getItem(`notes_${email}`);
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('active_user', JSON.stringify(loggedInUser));
    loadUserData(loggedInUser.email);
  };

  const handleLogout = () => {
    setUser(null);
    setTestResults([]);
    setTimetable([]);
    setNotes([]);
    localStorage.removeItem('active_user');
  };

  // Secure Delete Account Function
  const handleDeleteAccount = (email: string, pass: string): boolean => {
    if (!user) return false;

    // 1. Verify Email
    if (email.trim() !== user.email) {
      alert("Email entered does not match the current account.");
      return false;
    }

    // 2. Verify Password against stored record
    const storedUserData = localStorage.getItem(`user_${user.email}`);
    if (!storedUserData) {
      alert("Account data corrupted or missing.");
      return false;
    }

    const fullUserRecord = JSON.parse(storedUserData);
    if (fullUserRecord.password !== pass) {
      alert("Incorrect password. Account deletion failed.");
      return false;
    }

    // 3. Proceed with deletion
    try {
      localStorage.removeItem(`user_${user.email}`);
      localStorage.removeItem(`results_${user.email}`);
      localStorage.removeItem(`timetable_${user.email}`);
      localStorage.removeItem(`notes_${user.email}`);
      
      // Clear session
      handleLogout();
      alert("Account deleted successfully.");
      return true;
    } catch (e) {
      console.error("Delete failed", e);
      alert("An error occurred while deleting data.");
      return false;
    }
  };

  const handleTestComplete = (result: TestResult) => {
    if (!user) return;
    const newResults = [...testResults, result];
    setTestResults(newResults);
    localStorage.setItem(`results_${user.email}`, JSON.stringify(newResults));
    
    // Simulate Parent Notification
    console.log(`Sending SMS to parent (${user.parentMobile}): Your child ${user.name} completed a test in ${result.subject} with a score of ${result.score}/${result.totalMarks}.`);
    alert(`Test Submitted! Parent notified via SMS simulation.`);
  };

  const handleTimetableSave = (newTable: TimeTableEntry[]) => {
    if (!user) return;
    setTimetable(newTable);
    localStorage.setItem(`timetable_${user.email}`, JSON.stringify(newTable));
  };

  const handleSaveNote = (note: Note) => {
    if (!user) return;
    const newNotes = [...notes, note];
    setNotes(newNotes);
    localStorage.setItem(`notes_${user.email}`, JSON.stringify(newNotes));
  };

  const handleDeleteNote = (noteId: string) => {
    if (!user) return;
    const newNotes = notes.filter(n => n.id !== noteId);
    setNotes(newNotes);
    localStorage.setItem(`notes_${user.email}`, JSON.stringify(newNotes));
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} timetable={timetable} recentResults={testResults} />} />
          <Route path="/doubts" element={<DoubtSolver user={user} />} />
          <Route path="/notes" element={<NotesGenerator user={user} notes={notes} onSaveNote={handleSaveNote} onDeleteNote={handleDeleteNote} />} />
          <Route path="/exam" element={<ExamCenter user={user} onTestComplete={handleTestComplete} />} />
          <Route path="/resources" element={<Resources user={user} />} />
          <Route path="/timetable" element={<Timetable user={user} timetable={timetable} onSave={handleTimetableSave} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;