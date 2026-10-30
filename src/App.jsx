import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register"; 
import Dashboard from "./Pages/Dashboard";
import Students from "./Pages/Students";
import StudentProfile from "./Pages/StudentProfile";
import Workouts from "./Pages/Workouts";
import PendingReviews from "./Pages/PendingReviews";
import ProfessorProfile from "./Pages/Professorprofile";

export default function App() {
  // Garante que o tema salvo no navegador seja aplicado globalmente ao iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:studentId/profile" element={<StudentProfile />} />
        <Route path="/workouts/:studentId" element={<Workouts />} />
        <Route path="/reviews-pending" element={<PendingReviews />} />
        <Route path="/professor/profile" element={<ProfessorProfile />} />
      </Routes>
    </BrowserRouter>
  );
}