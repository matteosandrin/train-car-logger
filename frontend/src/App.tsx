import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import EntryFlow from "./pages/EntryFlow";
import FriendsPage from "./pages/FriendsPage";
import HistoryPage from "./pages/HistoryPage";
import LoginPage from "./pages/LoginPage";
import TaskBar from "./components/ui/TaskBar";

import { useLocation } from "react-router-dom";

const App: React.FC = () => {
  const location = useLocation();
  const showTaskBar =
    location.pathname === "/" ||
    location.pathname === "/history" ||
    location.pathname === "/friends";

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1 items-stretch justify-center px-6 pb-[9rem] pt-6">
        <Routes>
          <Route path="/" element={<EntryFlow />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {showTaskBar && <TaskBar />}
    </div>
  );
};

export default App;
