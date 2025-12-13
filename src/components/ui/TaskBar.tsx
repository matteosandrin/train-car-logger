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
      className={`flex flex-col w-28 items-center gap-1 px-6 py-4 rounded-full transition-all duration-100 ${
        isActive
          ? "text-slate-900 bg-sky-100"
          : "text-slate-500 hover:bg-slate-100"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      {icon}
    </button>
  );
};

const TaskBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 pb-safe pb-8">
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 w-fit rounded-full shadow-lg mx-auto">
        <div className="flex justify-center p-1">
          <TaskBarButton
            icon={<LuHash className="w-6 h-6" />}
            isActive={location.pathname === "/"}
            onClick={() => navigate("/")}
          />
          <TaskBarButton
            icon={<LuHistory className="w-6 h-6" />}
            isActive={location.pathname === "/log"}
            onClick={() => navigate("/log")}
          />
        </div>
      </div>
    </nav>
  );
};

export default TaskBar;
