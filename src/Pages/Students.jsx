import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Users,
  Target,
  UserPlus,
  User,
  Mail,
  Calendar,
  UserRound,
  Dumbbell,
  Pencil,
  Trash2,
  Check,
  X,
  Clock,
} from "lucide-react";

const inputClass =
  "w-full rounded-2xl bg-neutral-100 py-3 pl-11 pr-4 text-base outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0]";
const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-600";

const DAYS_ORDER = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const DAYS_NAMES = {
  seg: "Segunda-feira",
  ter: "Terça-feira",
  qua: "Quarta-feira",
  qui: "Quinta-feira",
  sex: "Sexta-feira",
  sab: "Sábado",
  dom: "Domingo",
};

export default function Students() {
  const navigate = useNavigate();
  const professorId = localStorage.getItem("professor_id") || 5;

  const [students, setStudents] = useState([]);
  const [studentWorkouts, setStudentWorkouts] = useState({}); // Armazena treinos por ID do aluno

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGoal, setEditGoal] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await api.get(`/professors/${professorId}/students`);
      const studentsList = response.data;
      setStudents(studentsList);

      // Buscar os treinos de cada aluno para separar por dia
      studentsList.forEach((s) => {
        loadWorkoutsForStudent(s.id);
      });
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
    }
  };

  const loadWorkoutsForStudent = async (studentId) => {
    try {
      const res = await api.get(`/students/${studentId}/workouts`);
      setStudentWorkouts((prev) => ({
        ...prev,
        [studentId]: res.data || [],
      }));
    } catch (err) {
      console.error(`Erro ao carregar treinos do aluno ${studentId}:`, err);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post("/students", {
        name,
        email: email || null,
        age: age ? parseInt(age) : null,
        goal: goal || null,
        professor_id: parseInt(professorId),
      });

      setName("");
      setEmail("");
      setAge("");
      setGoal("");
      loadStudents();
      alert("Aluno cadastrado com sucesso!");
    } catch (err) {
      console.error("Erro ao cadastrar aluno:", err);
      alert("Erro ao cadastrar aluno.");
    }
  };

  const handleStartEdit = (student) => {
    setEditingId(student.id);
    setEditName(student.name || "");
    setEditEmail(student.email || "");
    setEditAge(student.age || "");
    setEditGoal(student.goal || "");
  };

  const handleSaveEdit = async (studentId) => {
    try {
      await api.put(`/students/${studentId}`, {
        name: editName,
        email: editEmail || null,
        age: editAge ? parseInt(editAge) : null,
        goal: editGoal || null,
        professor_id: parseInt(professorId),
      });

      setEditingId(null);
      loadStudents();
      alert("Aluno atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar aluno:", err);
      alert("Erro ao atualizar dados do aluno.");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Tem certeza que deseja excluir este aluno?")) return;

    try {
      await api.delete(`/students/${studentId}`);
      loadStudents();
      alert("Aluno excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      alert("Erro ao excluir o aluno.");
    }
  };

  const formatId = (id) => `#${String(id).substring(0, 6).toUpperCase()}`;

  const initials = (n = "") =>
    n
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");

  const withGoal = students.filter((s) => s.goal && String(s.goal).trim() !== "").length;

  // Organiza os exercícios de uma ficha agrupados por dia da semana
  const groupExercisesByDay = (workouts) => {
    const grouped = {};
    workouts.forEach((w) => {
      if (w.exercises && Array.isArray(w.exercises)) {
        w.exercises.forEach((ex) => {
          const day = ex.day || "indefinido";
          if (!grouped[day]) grouped[day] = [];
          grouped[day].push({ ...ex, workoutTitle: w.title });
        });
      }
    });
    return grouped;
  };

  return (
    <div className="min-h-screen bg-[#ececec] p-4 font-sans text-neutral-900 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Barra superior */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:shadow-md"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-700"
          >
            <Home size={16} /> Início
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Gestão de alunos</h1>
          <p className="text-sm text-neutral-500">Cadastre, edite e acompanhe seus alunos e treinos</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {/* Formulário de cadastro */}
          <form
            onSubmit={handleCreateStudent}
            className="rounded-3xl bg-white p-6 shadow-sm md:col-span-2 md:row-span-2"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9e6ff]">
                <UserPlus size={20} className="text-[#5b4de0]" />
              </span>
              <h3 className="text-xl font-semibold leading-tight">
                Cadastrar novo aluno
                <span className="block text-sm font-normal text-neutral-400">
                  Só o nome é obrigatório
                </span>
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Nome completo</label>
                <div className="relative">
                  <User size={18} className={iconClass} />
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>E-mail (opcional)</label>
                <div className="relative">
                  <Mail size={18} className={iconClass} />
                  <input
                    type="email"
                    placeholder="aluno@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Idade</label>
                  <div className="relative">
                    <Calendar size={18} className={iconClass} />
                    <input
                      type="number"
                      placeholder="Ex: 25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className={labelClass}>Objetivo</label>
                  <div className="relative">
                    <Target size={18} className={iconClass} />
                    <input
                      type="text"
                      placeholder="Ex: Hipertrofia"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-[#7c6cf0] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#6a59e6]"
            >
              Cadastrar aluno
            </button>
          </form>

          {/* Total de alunos (card escuro) */}
          <div className="flex flex-col justify-between rounded-3xl bg-neutral-900 p-6 text-white shadow-sm md:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <Users size={20} />
            </div>
            <div>
              <p className="text-6xl font-semibold leading-none">
                {students.length}
                <span className="ml-2 text-xl font-normal text-neutral-400">alunos</span>
              </p>
              <p className="mt-2 text-sm text-neutral-400">Total cadastrado</p>
            </div>
          </div>

          {/* Com objetivo (card laranja) */}
          <div className="flex flex-col justify-between rounded-3xl bg-[#ff4d00] p-6 text-white shadow-sm md:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <Target size={20} />
            </div>
            <div>
              <p className="text-6xl font-semibold leading-none">
                {withGoal}
                <span className="ml-2 text-xl font-normal text-white/80">
                  de {students.length}
                </span>
              </p>
              <p className="mt-2 text-sm text-white/80">Alunos com objetivo definido</p>
            </div>
          </div>

          {/* Lista de alunos */}
          <h3 className="mt-2 text-xl font-semibold md:col-span-4">Alunos cadastrados</h3>

          {students.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center text-sm text-neutral-400 shadow-sm md:col-span-4">
              Nenhum aluno cadastrado ainda.
            </div>
          ) : (
            students.map((s) => {
              const isEditing = editingId === s.id;
              const workouts = studentWorkouts[s.id] || [];
              const exercisesByDay = groupExercisesByDay(workouts);

              return (
                <div
                  key={s.id}
                  className={`rounded-3xl bg-white p-6 shadow-sm ${
                    isEditing ? "md:col-span-4" : "md:col-span-4"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex flex-col gap-4">
                      <h4 className="text-lg font-semibold">Editando aluno</h4>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>Nome completo</label>
                          <div className="relative">
                            <User size={18} className={iconClass} />
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Nome completo"
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>E-mail</label>
                          <div className="relative">
                            <Mail size={18} className={iconClass} />
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              placeholder="E-mail"
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Idade</label>
                          <div className="relative">
                            <Calendar size={18} className={iconClass} />
                            <input
                              type="number"
                              value={editAge}
                              onChange={(e) => setEditAge(e.target.value)}
                              placeholder="Idade"
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Objetivo</label>
                          <div className="relative">
                            <Target size={18} className={iconClass} />
                            <input
                              type="text"
                              value={editGoal}
                              onChange={(e) => setEditGoal(e.target.value)}
                              placeholder="Objetivo"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(s.id)}
                          className="flex items-center gap-2 rounded-2xl bg-[#7c6cf0] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6a59e6]"
                        >
                          <Check size={16} /> Salvar alterações
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-200"
                        >
                          <X size={16} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                        <div className="flex items-start gap-4">
                          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e9e6ff] text-lg font-semibold text-[#5b4de0]">
                            {initials(s.name)}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="truncate text-lg font-semibold leading-tight">{s.name}</h4>
                              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-[#5b4de0]">
                                {formatId(s.id)}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
                                <Mail size={12} /> {s.email || "Não informado"}
                              </span>
                              <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
                                <Calendar size={12} /> {s.age || "-"} anos
                              </span>
                              <span className="flex items-center gap-1.5 rounded-full bg-[#fdf1c7] px-3 py-1.5 font-medium text-amber-700">
                                <Target size={12} /> {s.goal || "Sem objetivo"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => navigate(`/students/${s.id}/profile`)}
                            className="flex items-center gap-2 rounded-full bg-[#7c6cf0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6a59e6]"
                          >
                            <UserRound size={15} /> Perfil
                          </button>
                          <button
                            onClick={() => navigate(`/workouts/${s.id}`)}
                            className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
                          >
                            <Dumbbell size={15} /> Gerenciar Treinos
                          </button>
                          <button
                            onClick={() => handleStartEdit(s)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdf1c7] text-amber-700 transition hover:bg-amber-200"
                            aria-label="Editar aluno"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                            aria-label="Excluir aluno"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Seção de Treinos separados por dias da semana */}
                      <div className="mt-5">
                        <h5 className="mb-3 text-sm font-semibold text-neutral-700 flex items-center gap-2">
                          <Dumbbell size={16} className="text-[#7c6cf0]" /> Fichas de Treino por Dia
                        </h5>

                        {workouts.length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">Nenhum treino cadastrado para este aluno.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {DAYS_ORDER.map((dayKey) => {
                              const dayExercises = exercisesByDay[dayKey] || [];
                              if (dayExercises.length === 0) return null;

                              return (
                                <div key={dayKey} className="rounded-2xl bg-neutral-50 p-4 border border-neutral-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#7c6cf0] bg-[#e9e6ff] px-2.5 py-1 rounded-lg">
                                      {DAYS_NAMES[dayKey]}
                                    </span>
                                    <span className="text-xs text-neutral-400">{dayExercises.length} exercício(s)</span>
                                  </div>
                                  <div className="flex flex-col gap-2 mt-2">
                                    {dayExercises.map((ex, idx) => (
                                      <div key={idx} className="bg-white p-2.5 rounded-xl shadow-2xs border border-neutral-100">
                                        <p className="text-xs font-semibold text-neutral-800">{ex.name}</p>
                                        <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                                          <span>{ex.sets} séries × {ex.reps}</span>
                                          {ex.rest_time && (
                                            <span className="flex items-center gap-1 text-neutral-400">
                                              <Clock size={10} /> {ex.rest_time}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}