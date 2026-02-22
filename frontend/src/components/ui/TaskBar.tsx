import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LuHash, LuHistory } from "react-icons/lu";

const TaskBarButton: React.FC<{
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 w-[6rem] px-6 py-4 rounded-full transition-all duration-100 ${
        isActive
          ? "text-slate-900 bg-sky-100"
          : "text-slate-500 hover:bg-slate-100"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
    </button>
  );
};

const TaskBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 pb-safe pb-4">
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 w-fit rounded-full shadow-lg mx-auto">
        <div className="flex justify-center p-1 gap-1">
          <TaskBarButton
            icon={<LuHash className="w-full h-full" />}
            isActive={location.pathname === "/"}
            onClick={() => navigate("/")}
          />
          <TaskBarButton
            icon={<LuHistory className="w-full h-full" />}
            isActive={location.pathname === "/history"}
            onClick={() => navigate("/history")}
          />
        </div>
      </div>
    </nav>
  );
};

export default TaskBar;
