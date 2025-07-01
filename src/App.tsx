import React from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./router";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

// Rotas onde o layout (Header/Sidebar) não deve aparecer (ex: login)
const noLayoutRoutes = ["/login"];

const App: React.FC = () => {
  const location = useLocation();
  const hideLayout = noLayoutRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-100">
      {!hideLayout && <Header />}
      <div className="flex">
        {!hideLayout && <Sidebar />}
        <main className={`flex-1 ${hideLayout ? "" : "p-6"}`}>
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

export default App;
