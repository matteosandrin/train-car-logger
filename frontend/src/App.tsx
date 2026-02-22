import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import EntryFlow from "./pages/EntryFlow";
import HistoryPage from "./pages/HistoryPage";
import TaskBar from "./components/ui/TaskBar";

const App: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1 items-stretch justify-center px-6 pb-[9rem] pt-6">
        <Routes>
          <Route path="/" element={<EntryFlow />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <TaskBar />
    </div>
  );
};

export default App;
