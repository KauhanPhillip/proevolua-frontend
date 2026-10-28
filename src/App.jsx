import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register"; // <--- 1. Importe a tela de cadastro aqui
import Dashboard from "./Pages/Dashboard";
import Students from "./Pages/Students";
import StudentProfile from "./Pages/StudentProfile";
import Workouts from "./Pages/Workouts";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* <--- 2. Adicione a rota aqui */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:studentId/profile" element={<StudentProfile />} />
        <Route path="/workouts/:studentId" element={<Workouts />} />
      </Routes>
    </BrowserRouter>
  );
}