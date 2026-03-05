import { Route, Routes, useNavigate } from "react-router-dom";
import { LoginView } from "./views/LoginView";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(user);
    if (!user && window.location.pathname !== "/login") {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<div>Register Page</div>} />

        {/* Add more routes here */}
      </Routes>
  );
}

export default App;
