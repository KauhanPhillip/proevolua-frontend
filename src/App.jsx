import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import Students from "./Pages/Students";
import Workouts from "./Pages/Workouts"; // Importa a página de treinos

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:studentId/workouts" element={<Workouts />} /> {/* Rota dinâmica de treinos */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;