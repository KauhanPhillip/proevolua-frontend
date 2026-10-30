import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  ArrowLeft,
  Home,
  Mail,
  Phone,
  Calendar,
  Target,
  User,
  Dumbbell,
  Pencil,
  Trash2,
  AlertCircle,
  Moon,
  Sun,
} from "lucide-react";

export default function PendingReviews() {
  const navigate = useNavigate();
  const professorId = localStorage.getItem("professor_id") || 5;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      document.documentElement.classList.contains("dark")
    );
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
    loadPendingStudents();
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const loadPendingStudents = async () => {
    try {
      const res = await api.get(`/professors/${professorId}/students`);
      const allStudents = res.data || [];

      const activeStudents = allStudents.filter(
        (s) => s.is_active !== false && s.is_active !== 0
      );

      const today = new Date();
      const pendingList = [];

      for (const s of activeStudents) {
        try {
          const assessRes = await api.get(`/students/${s.id}/assessments`);
          const assessments = assessRes.data || [];

          if (assessments.length === 0) {
            pendingList.push(s);
          } else {
            const sorted = [...assessments].sort(
              (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
            );
            const lastDate = new Date(sorted[0].created_at);

            const diffInTime = today.getTime() - lastDate.getTime();
            const diffInDays = diffInTime / (1000 * 3600 * 24);

            if (diffInDays > 25) {
              pendingList.push(s);
            }
          }
        } catch (err) {
          console.error(`Erro ao carregar avaliações do aluno ${s.id}:`, err);
        }
      }

      setStudents(pendingList);
    } catch (err) {
      console.error("Erro ao carregar alunos pendentes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o aluno ${studentName}?`)) return;

    try {
      await api.delete(`/students/${studentId}`);
      setStudents(students.filter((s) => s.id !== studentId));
      alert("Aluno excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      alert("Erro ao excluir aluno.");
    }
  };

  const formatId = (id) => `#${String(id).substring(0, 6).toUpperCase()}`;

  const initials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ececec] dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 font-sans">
        Carregando lista de reavaliações...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ececec] dark:bg-neutral-950 p-4 font-sans text-neutral-900 dark:text-neutral-100 transition-colors md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Barra superior */}
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 rounded-full bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-medium shadow-sm transition hover:shadow-md dark:border dark:border-neutral-800"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 rounded-full bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 shadow-sm transition hover:bg-neutral-700"
            >
              <Home size={16} /> Início
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-neutral-900 text-neutral-700 dark:text-yellow-400 shadow-sm transition hover:scale-105 dark:border dark:border-neutral-800"
            title="Alternar modo escuro/claro"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Cabeçalho da página */}
        <div className="mb-6 rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm dark:border dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7c6cf0]/10 text-[#7c6cf0]">
              <AlertCircle size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Alunos para Reavaliação</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Lista de alunos ativos com mais de 25 dias sem nova avaliação física registrada ({students.length})
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Alunos */}
        {students.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-neutral-900 p-12 text-center shadow-sm dark:border dark:border-neutral-800">
            <p className="text-neutral-400 text-base">Nenhum aluno pendente de reavaliação no momento!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex flex-col gap-4 rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm transition hover:shadow-md dark:border dark:border-neutral-800 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e9e6ff] text-lg font-semibold text-[#5b4de0]">
                    {initials(student.name)}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{student.name}</h3>
                      <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-0.5 text-xs font-semibold text-[#5b4de0]">
                        {formatId(student.id)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-neutral-600 dark:text-neutral-300">
                        <Mail size={13} className="text-neutral-400" /> {student.email || "Não informado"}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-neutral-600 dark:text-neutral-300">
                        <Phone size={13} className="text-neutral-400" /> {student.phone || "Não informado"}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-neutral-600 dark:text-neutral-300">
                        <Calendar size={13} className="text-neutral-400" /> {student.age ? `${student.age} anos` : "-"}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#fdf1c7] dark:bg-amber-950/40 px-3 py-1.5 font-medium text-amber-700 dark:text-amber-300">
                        <Target size={13} /> {student.goal || "Objetivo não definido"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t dark:border-neutral-800 pt-4 md:border-t-0 md:pt-0">
                  <button
                    onClick={() => navigate(`/students/${student.id}/profile`)}
                    className="flex items-center gap-2 rounded-full bg-[#7c6cf0] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#6a59e6]"
                  >
                    <User size={14} /> Perfil
                  </button>

                  <button
                    onClick={() => navigate(`/workouts/${student.id}`)}
                    className="flex items-center gap-2 rounded-full bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-xs font-semibold text-white dark:text-neutral-900 transition hover:bg-neutral-800"
                  >
                    <Dumbbell size={14} /> Gerenciar treinos
                  </button>

                  <button
                    onClick={() => navigate(`/students`, { state: { editStudent: student } })}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdf1c7] dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 transition hover:bg-amber-200"
                    title="Editar aluno"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(student.id, student.name)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 transition hover:bg-red-100"
                    title="Excluir aluno"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}