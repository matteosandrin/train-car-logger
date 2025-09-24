import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import EntryFlow from './pages/EntryFlow';
import LogPage from './pages/LogPage';

const App: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full items-stretch justify-center px-6 pb-16 pt-12 bg-white/90">
      <Routes>
        <Route path="/" element={<EntryFlow />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
