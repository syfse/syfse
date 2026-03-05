import { Route, Routes, useNavigate } from "react-router-dom";
import { LoginView } from "./views/LoginView";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import { RegisterView } from "./views/RegisterView";
import { NotificationCenter } from "./components/ui/NotificationCenter";
import { HomeView } from "./views/HomeView";

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const dontUsesAuth = ["/login", "/register", "/forgot-password", "/"];
    console.log(user);
    if (!user && !dontUsesAuth.includes(window.location.pathname)) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <NotificationCenter />
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />

        {/* Add more routes here */}
      </Routes>
    </div>
  );
}

export default App;
