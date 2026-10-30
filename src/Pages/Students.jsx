import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import {
  ArrowLeft,
  Home,
  UserPlus,
  Search,
  User,
  Dumbbell,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Target,
  Calendar,
  X,
} from "lucide-react";

// Função para formatar o telefone enquanto digita
const formatPhoneInput = (value) => {
  const numbers = value.replace(/\D/g, "").substring(0, 11);
  if (numbers.length <= 2) {
    return numbers.length ? `(${numbers}` : "";
  } else if (numbers.length <= 7) {
    return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
  } else {
    return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
  }
};

// Formata o telefone salvo para exibição na lista
const displayPhone = (phoneStr) => {
  if (!phoneStr) return "Sem telefone";
  const numbers = String(phoneStr).replace(/\D/g, "");
  if (numbers.length === 11) {
    return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
  } else if (numbers.length === 10) {
    return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6, 10)}`;
  }
  return phoneStr;
};

// Calcula a idade com base na data de nascimento
const calculateAge = (birthDateString) => {
  if (!birthDateString) return null;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

// Formata a data de YYYY-MM-DD para DD/MM/YYYY para exibição
const formatDateDisplay = (dateString) => {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
};

export default function Students() {
  const navigate = useNavigate();
  const location = useLocation();
  const professorId = localStorage.getItem("professor_id") || 5;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birth_date: "",
    goal: "",
  });

  useEffect(() => {
    loadStudents();
    if (location.state?.editStudent) {
      handleStartEdit(location.state.editStudent);
    }
  }, [location]);

  const loadStudents = async () => {
    try {
      const res = await api.get(`/professors/${professorId}/students`);
      setStudents(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone ? displayPhone(student.phone) : "",
      birth_date: student.birth_date ? student.birth_date.substring(0, 10) : "",
      goal: student.goal || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setFormData({ name: "", email: "", phone: "", birth_date: "", goal: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: String(formData.name || "").trim(),
        email: formData.email ? String(formData.email).trim() : null,
        phone: formData.phone ? String(formData.phone).replace(/\D/g, "") : null,
        birth_date: formData.birth_date ? formData.birth_date : null,
        goal: formData.goal ? String(formData.goal).trim() : null,
        professor_id: Number(professorId),
      };

      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, payload);
        alert("Aluno atualizado com sucesso!");
      } else {
        await api.post(`/professors/${professorId}/students`, payload);
        alert("Aluno cadastrado com sucesso!");
      }
      handleCancelEdit();
      loadStudents();
    } catch (err) {
      console.error("Erro ao salvar aluno:", err.response?.data || err);
      alert(`Erro ao salvar dados do aluno: ${JSON.stringify(err.response?.data?.detail || "Erro desconhecido")}`);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja excluir o aluno ${name}?`)) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents(students.filter((s) => s.id !== id));
      alert("Aluno excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      alert("Erro ao excluir aluno.");
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.is_active !== false &&
      s.is_active !== 0 &&
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(s.id).includes(searchTerm))
  );

  const formatId = (id) => `#${String(id).substring(0, 6).toUpperCase()}`;

  const initials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");

  return (
    <div className="min-h-screen bg-[#ececec] dark:bg-neutral-950 p-4 font-sans text-neutral-900 dark:text-neutral-100 transition-colors md:p-8">
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
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Gestão de Alunos</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Cadastre novos alunos e gerencie a lista existente</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* TOPO: Formulário de Cadastro / Edição */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm dark:border dark:border-neutral-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {editingStudent ? <Pencil size={20} className="text-amber-600" /> : <UserPlus size={20} className="text-[#ff4d00]" />}
                {editingStudent ? `Editando Aluno: ${editingStudent.name}` : "Cadastrar Novo Aluno"}
              </h3>
              {editingStudent && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  <X size={16} /> Cancelar edição
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Nome completo *</label>
                  <input
                    type="text"
                    placeholder="Nome do aluno"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0] dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">E-mail</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(35) 99999-9999"
                    maxLength={15}
                    value={formData.phone}
                    onChange={(e) => {
                      const formatted = formatPhoneInput(e.target.value);
                      setFormData({ ...formData, phone: formatted });
                    }}
                    className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0] dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0] dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Objetivo</label>
                  <input
                    type="text"
                    placeholder="Ex: Hipertrofia / Emagrecimento"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0] dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {editingStudent && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-2xl bg-neutral-200 dark:bg-neutral-800 px-6 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 transition hover:bg-neutral-300 dark:hover:bg-neutral-700"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="rounded-2xl bg-[#7c6cf0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6a59e6]"
                >
                  {editingStudent ? "Salvar Alterações" : "Cadastrar Aluno"}
                </button>
              </div>
            </form>
          </div>

          {/* ABAIXO: Listagem e Busca de Alunos */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">Alunos Cadastrados ({filteredStudents.length})</h3>
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl bg-white dark:bg-neutral-900 py-2.5 pl-10 pr-4 text-sm outline-none shadow-sm dark:border dark:border-neutral-800 dark:text-white"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center text-neutral-500 py-12">Carregando alunos...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="rounded-3xl bg-white dark:bg-neutral-900 p-12 text-center shadow-sm dark:border dark:border-neutral-800 text-neutral-400">
                Nenhum aluno encontrado.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredStudents.map((student) => {
                  const studentAge = calculateAge(student.birth_date);
                  return (
                    <div
                      key={student.id}
                      className="flex flex-col gap-4 rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm transition hover:shadow-md dark:border dark:border-neutral-800 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e9e6ff] text-lg font-semibold text-[#5b4de0]">
                          {initials(student.name)}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold">{student.name}</h4>
                            <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-0.5 text-xs font-semibold text-[#5b4de0]">
                              {formatId(student.id)}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <span className="flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-neutral-600 dark:text-neutral-300">
                              <Calendar size={12} /> {student.birth_date ? `${formatDateDisplay(student.birth_date.substring(0, 10))}${studentAge !== null ? ` (${studentAge} anos)` : ""}` : "Sem data nasc."}
                            </span>
                            <span className="flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-neutral-600 dark:text-neutral-300">
                              <Mail size={12} /> {student.email || "Sem e-mail"}
                            </span>
                            <span className="flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-neutral-600 dark:text-neutral-300">
                              <Phone size={12} /> {displayPhone(student.phone)}
                            </span>
                            <span className="flex items-center gap-1 rounded-full bg-[#fdf1c7] dark:bg-amber-950/40 px-3 py-1 font-medium text-amber-700 dark:text-amber-300">
                              <Target size={12} /> {student.goal || "Sem objetivo"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t dark:border-neutral-800 pt-4 md:border-0 md:pt-0">
                        <button
                          onClick={() => navigate(`/students/${student.id}/profile`)}
                          className="flex items-center gap-1.5 rounded-full bg-[#7c6cf0] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#6a59e6]"
                        >
                          <User size={14} /> Perfil
                        </button>
                        <button
                          onClick={() => navigate(`/workouts/${student.id}`)}
                          className="flex items-center gap-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-xs font-semibold text-white dark:text-neutral-900 transition hover:bg-neutral-800"
                        >
                          <Dumbbell size={14} /> Treinos
                        </button>
                        <button
                          onClick={() => handleStartEdit(student)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 hover:bg-amber-100"
                          title="Editar aluno"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100"
                          title="Excluir aluno"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}