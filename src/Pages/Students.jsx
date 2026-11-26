import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Search,
  UserPlus,
  ChevronRight,
  Moon,
  Sun,
  X,
} from "lucide-react";

export default function Students() {
  const navigate = useNavigate();
  const professorId = localStorage.getItem("professor_id") || 5;

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birth_date: "",
    goal: "",
    is_active: true,
  });

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
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
    loadStudents();
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

  const loadStudents = async () => {
    try {
      const response = await api.get(`/professors/${professorId}/students`);
      setStudents(response.data || []);
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
    }
  };

  const handleToggleStudentStatus = async (e, student) => {
    e.stopPropagation();
    const currentActive = student.is_active !== false && student.is_active !== 0;
    const nextActive = !currentActive;

    try {
      await api.patch(`/students/${student.id}/status`, {
        is_active: nextActive,
      });

      setStudents((prev) =>
        prev.map((item) =>
          item.id === student.id ? { ...item, is_active: nextActive } : item
        )
      );
    } catch (err) {
      console.error("Erro ao alternar status do aluno:", err);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await api.post("/students", {
        ...formData,
        birth_date: formData.birth_date || null,
        professor_id: Number(professorId),
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        birth_date: "",
        goal: "",
        is_active: true,
      });
      setIsModalOpen(false);
      await loadStudents();
    } catch (err) {
      console.error("Erro ao cadastrar aluno:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const isActive = s.is_active !== false && s.is_active !== 0;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      const matchesSearch =
        searchTerm.trim() === "" ||
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(s.id).toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [students, statusFilter, searchTerm]);

  const initials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");

  return (
    <div className="min-h-screen bg-[#ececec] dark:bg-neutral-950 p-4 md:p-8 font-sans text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="mx-auto max-w-6xl">
        {/* Barra superior */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-neutral-900 text-neutral-700 dark:text-yellow-400 shadow-sm transition hover:scale-105 dark:border dark:border-neutral-800"
              title="Alternar modo escuro/claro"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[#ff4d00] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e04400]"
            >
              <UserPlus size={16} /> Novo aluno
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Alunos</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Gerencie seus alunos e altere o status entre ativo e inativo
          </p>
        </div>

        {/* Filtros e busca */}
        <div className="mb-5 flex flex-col gap-3 rounded-3xl bg-white dark:bg-neutral-900 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar aluno por nome ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 py-2.5 pl-11 pr-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0] dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                statusFilter === "all"
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              Todos ({students.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                statusFilter === "active"
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                statusFilter === "inactive"
                  ? "bg-red-600 text-white"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              Inativos
            </button>
          </div>
        </div>

        {/* Lista de alunos */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredStudents.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-neutral-900 p-8 text-center text-sm text-neutral-400 shadow-sm md:col-span-2">
              Nenhum aluno encontrado com os filtros atuais.
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isActive = student.is_active !== false && student.is_active !== 0;

              return (
                <div
                  key={student.id}
                  onClick={() => navigate(`/students/${student.id}/profile`)}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-3xl bg-white dark:bg-neutral-900 p-5 shadow-sm transition hover:shadow-md dark:border dark:border-neutral-800"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9e6ff] text-sm font-semibold text-[#5b4de0]">
                      {initials(student.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{student.name}</p>
                      <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                        {student.goal || "Sem objetivo definido"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleStudentStatus(e, student)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300"
                          : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/70 dark:text-red-300"
                      }`}
                    >
                      {isActive ? "Ativo" : "Inativo"}
                    </button>

                    <ChevronRight size={18} className="text-neutral-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal de cadastro rápido */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Cadastrar novo aluno</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Nome completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium">Telefone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Data de nascimento</label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium">Objetivo</label>
                  <input
                    type="text"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    placeholder="Ex: Hipertrofia, Emagrecimento..."
                    className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-[#7c6cf0] px-5 py-2 text-xs font-semibold text-white hover:bg-[#6a59e6] disabled:opacity-50"
                  >
                    {loading ? "Salvando..." : "Salvar aluno"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}