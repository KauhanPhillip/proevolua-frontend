import { useState, useEffect } from "react";
import api from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Dumbbell,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Type,
  AlignLeft,
  Repeat,
  Timer,
  StickyNote,
  ListChecks,
  CalendarDays,
} from "lucide-react";

const inputClass =
  "w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 dark:text-white py-3 pl-11 pr-4 text-base outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0]";
const smallInputClass =
  "w-full rounded-xl bg-neutral-100 dark:bg-neutral-800 dark:text-white px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0]";
const editInputClass =
  "w-full rounded-xl bg-white dark:bg-neutral-800 dark:text-white px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0]";
const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-600 dark:text-neutral-300";

const DAYS = [
  { key: "seg", label: "Seg", full: "Segunda-feira" },
  { key: "ter", label: "Ter", full: "Terça-feira" },
  { key: "qua", label: "Qua", full: "Quarta-feira" },
  { key: "qui", label: "Qui", full: "Quinta-feira" },
  { key: "sex", label: "Sex", full: "Sexta-feira" },
  { key: "sab", label: "Sáb", full: "Sábado" },
  { key: "dom", label: "Dom", full: "Domingo" },
];

const isKnownDay = (key) => DAYS.some((d) => d.key === key);
const dayFull = (key) => DAYS.find((d) => d.key === key)?.full || "Sem dia definido";

const groupByDay = (exs = []) => {
  const withIdx = exs.map((ex, idx) => ({ ex, idx }));
  const groups = DAYS.map((d) => ({
    key: d.key,
    items: withIdx.filter((i) => i.ex.day === d.key),
  })).filter((g) => g.items.length > 0);

  const orphans = withIdx.filter((i) => !isKnownDay(i.ex.day));
  if (orphans.length > 0) groups.push({ key: "", items: orphans });
  return groups;
};

const countByDay = (exs = []) => {
  const counts = {};
  exs.forEach((ex) => {
    const k = isKnownDay(ex.day) ? ex.day : "";
    counts[k] = (counts[k] || 0) + 1;
  });
  return counts;
};

function DayPills({ value, onChange, counts = {}, showNone = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((d) => {
        const active = value === d.key;
        const n = counts[d.key] || 0;
        return (
          <button
            key={d.key}
            type="button"
            onClick={() => onChange(d.key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-[#7c6cf0] text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {d.label}
            {n > 0 && (
              <span
                className={`rounded-full px-1.5 text-xs ${
                  active ? "bg-white/25 text-white" : "bg-[#e9e6ff] text-[#5b4de0]"
                }`}
              >
                {n}
              </span>
            )}
          </button>
        );
      })}
      {showNone && (
        <button
          type="button"
          onClick={() => onChange("")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            value === ""
              ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Sem dia ({counts[""] || 0})
        </button>
      )}
    </div>
  );
}

export default function Workouts() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState([]);

  const [selectedDay, setSelectedDay] = useState("seg");

  const [exName, setExName] = useState("");
  const [exSets, setExSets] = useState("");
  const [exReps, setExReps] = useState("");
  const [exRest, setExRest] = useState("");
  const [exNotes, setExNotes] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editExercises, setEditExercises] = useState([]);
  const [editDay, setEditDay] = useState("seg");

  useEffect(() => {
    if (studentId) {
      loadWorkouts();
    }
  }, [studentId]);

  const loadWorkouts = async () => {
    try {
      const response = await api.get(`/students/${studentId}/workouts`);
      setWorkouts(response.data);
    } catch (err) {
      console.error("Erro ao carregar treinos:", err);
    }
  };

  const handleAddExerciseToState = (e) => {
    e.preventDefault();
    if (!exName || !exSets || !exReps) return;

    const newEx = {
      name: exName,
      sets: parseInt(exSets),
      reps: exReps,
      rest_time: exRest,
      notes: exNotes,
      day: selectedDay,
    };

    setExercises([...exercises, newEx]);
    setExName("");
    setExSets("");
    setExReps("");
    setExRest("");
    setExNotes("");
  };

  const handleRemoveTempExercise = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    if (exercises.length === 0) {
      alert("Adicione pelo menos um exercício à ficha de treino!");
      return;
    }

    try {
      await api.post("/workouts", {
        title,
        description,
        student_id: String(studentId),
        exercises,
      });

      setTitle("");
      setDescription("");
      setExercises([]);
      setSelectedDay("seg");
      loadWorkouts();
      alert("Ficha de treino criada com sucesso!");
    } catch (err) {
      console.error("Erro ao criar ficha:", err);
      alert("Erro ao criar ficha de treino.");
    }
  };

  const handleStartEdit = (workout) => {
    const exs = workout.exercises || [];
    setEditingId(workout.id);
    setEditTitle(workout.title || "");
    setEditDescription(workout.description || "");
    setEditExercises(exs);

    const firstGroup = groupByDay(exs)[0];
    setEditDay(firstGroup ? firstGroup.key : "seg");
  };

  const handleSaveEdit = async (workoutId) => {
    try {
      const cleaned = editExercises
        .filter((ex) => ex.name && String(ex.name).trim() !== "")
        .map((ex) => ({ ...ex, sets: parseInt(ex.sets) || 0 }));

      await api.put(`/workouts/${workoutId}`, {
        title: editTitle,
        description: editDescription,
        student_id: String(studentId),
        exercises: cleaned,
      });

      setEditingId(null);
      loadWorkouts();
      alert("Ficha atualizada com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar ficha:", err);
      alert("Erro ao atualizar ficha.");
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta ficha de treino?")) return;

    try {
      await api.delete(`/workouts/${workoutId}`);
      loadWorkouts();
      alert("Ficha excluída com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir ficha:", err);
      alert("Erro ao excluir a ficha de treino.");
    }
  };

  const updateEditExercise = (idx, field, value) => {
    setEditExercises(editExercises.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)));
  };

  const addEditExercise = () => {
    const day = editDay || "seg";
    setEditExercises([
      ...editExercises,
      { name: "", sets: "", reps: "", rest_time: "", notes: "", day },
    ]);
    setEditDay(day);
  };

  const tempGroups = groupByDay(exercises);
  const tempCounts = countByDay(exercises);
  const daysUsed = tempGroups.length;

  return (
    <div className="min-h-screen bg-[#ececec] dark:bg-neutral-950 p-4 font-sans text-neutral-900 dark:text-neutral-100 transition-colors md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Barra superior */}
        <div className="mb-6 flex gap-2">
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

        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Gestão de treinos</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Monte as fichas do aluno separadas por dia da semana</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {/* Fichas cadastradas (card escuro) */}
          <div className="flex flex-col justify-between rounded-3xl bg-neutral-900 dark:border dark:border-neutral-800 p-6 text-white shadow-sm md:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <Dumbbell size={20} />
            </div>
            <div>
              <p className="text-6xl font-semibold leading-none">
                {workouts.length}
                <span className="ml-2 text-xl font-normal text-neutral-400">fichas</span>
              </p>
              <p className="mt-2 text-sm text-neutral-400">Cadastradas para este aluno</p>
            </div>
          </div>

          {/* Exercícios na ficha atual (card laranja) */}
          <div className="flex flex-col justify-between rounded-3xl bg-[#ff4d00] p-6 text-white shadow-sm md:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <ListChecks size={20} />
            </div>
            <div>
              <p className="text-6xl font-semibold leading-none">
                {exercises.length}
                <span className="ml-2 text-xl font-normal text-white/80">exercícios</span>
              </p>
              <p className="mt-2 text-sm text-white/80">
                Na ficha que você está montando · {daysUsed} {daysUsed === 1 ? "dia" : "dias"}
              </p>
            </div>
          </div>

          {/* Montagem da ficha */}
          <form
            onSubmit={handleCreateWorkout}
            className="rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm dark:border dark:border-neutral-800 md:col-span-4"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9e6ff] dark:bg-neutral-800">
                <ClipboardList size={20} className="text-[#5b4de0]" />
              </span>
              <h3 className="text-xl font-semibold leading-tight">
                Nova ficha de treino
                <span className="block text-sm font-normal text-neutral-400">
                  Escolha o dia e adicione quantos exercícios quiser
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelClass}>Título</label>
                  <div className="relative">
                    <Type size={18} className={iconClass} />
                    <input
                      type="text"
                      placeholder="Ex: Treino ABC - Hipertrofia"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Descrição</label>
                  <div className="relative">
                    <AlignLeft size={18} className={iconClass} />
                    <input
                      type="text"
                      placeholder="Ex: Foco em membros superiores"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={`${labelClass} flex items-center gap-2`}>
                    <CalendarDays size={15} /> Dia da semana
                  </label>
                  <DayPills value={selectedDay} onChange={setSelectedDay} counts={tempCounts} />
                </div>

                <div className="rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-base font-semibold">
                    <Dumbbell size={16} className="text-[#5b4de0]" />
                    Adicionar exercício · {dayFull(selectedDay)}
                  </h4>

                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Nome do exercício (Ex: Supino reto)"
                      value={exName}
                      onChange={(e) => setExName(e.target.value)}
                      className={smallInputClass}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Repeat size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="number"
                          placeholder="Séries"
                          value={exSets}
                          onChange={(e) => setExSets(e.target.value)}
                          className={`${smallInputClass} pl-9`}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Repetições (Ex: 10-12)"
                        value={exReps}
                        onChange={(e) => setExReps(e.target.value)}
                        className={smallInputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Timer size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Descanso (Ex: 60s)"
                          value={exRest}
                          onChange={(e) => setExRest(e.target.value)}
                          className={`${smallInputClass} pl-9`}
                        />
                      </div>
                      <div className="relative">
                        <StickyNote size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Notas"
                          value={exNotes}
                          onChange={(e) => setExNotes(e.target.value)}
                          className={`${smallInputClass} pl-9`}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddExerciseToState}
                      className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-white dark:text-neutral-900 transition hover:bg-neutral-700"
                    >
                      <Plus size={16} /> Adicionar em {dayFull(selectedDay)}
                    </button>
                  </div>
                </div>
              </div>

              {/* Coluna direita: resumo da ficha por dia */}
              <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 p-4 ring-1 ring-neutral-200/70 dark:ring-neutral-800">
                <p className="mb-3 text-sm font-semibold">
                  Resumo da ficha{" "}
                  <span className="font-normal text-neutral-400">
                    ({exercises.length} {exercises.length === 1 ? "exercício" : "exercícios"})
                  </span>
                </p>

                {tempGroups.length === 0 ? (
                  <p className="py-10 text-center text-sm text-neutral-400">
                    Escolha um dia e adicione exercícios.
                    <br />
                    Eles vão aparecer aqui, separados por dia.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {tempGroups.map((g) => (
                      <div key={g.key || "none"}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="rounded-full bg-[#e9e6ff] dark:bg-neutral-800 px-3 py-1 text-xs font-semibold text-[#5b4de0]">
                            {dayFull(g.key)}
                          </span>
                          <span className="text-xs text-neutral-400">{g.items.length}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {g.items.map(({ ex, idx }) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 rounded-xl bg-white dark:bg-neutral-900 px-3 py-2 text-sm shadow-sm dark:border dark:border-neutral-800"
                            >
                              <div className="min-w-0">
                                <strong className="block truncate font-medium">{ex.name}</strong>
                                <span className="text-xs text-neutral-400">
                                  {ex.sets}x{ex.reps}
                                  {ex.rest_time ? ` · descanso ${ex.rest_time}` : ""}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveTempExercise(idx)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 transition hover:bg-red-100"
                                aria-label="Remover exercício"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-[#7c6cf0] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#6a59e6]"
            >
              Salvar nova ficha
            </button>
          </form>

          {/* Lista de fichas */}
          <h3 className="mt-2 text-xl font-semibold md:col-span-4">Fichas cadastradas</h3>

          {workouts.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-neutral-900 p-8 text-center text-sm text-neutral-400 shadow-sm dark:border dark:border-neutral-800 md:col-span-4">
              Nenhuma ficha de treino cadastrada para este aluno.
            </div>
          ) : (
            workouts.map((w) => {
              const isEditing = editingId === w.id;
              const groups = groupByDay(w.exercises || []);

              const editCounts = countByDay(editExercises);
              const hasOrphans = (editCounts[""] || 0) > 0;
              const visibleEdit = editExercises
                .map((ex, idx) => ({ ex, idx }))
                .filter(({ ex }) => (editDay === "" ? !isKnownDay(ex.day) : ex.day === editDay));

              return (
                <div
                  key={w.id}
                  className={`rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm dark:border dark:border-neutral-800 ${
                    isEditing ? "md:col-span-4" : "md:col-span-2"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex flex-col gap-4">
                      <h4 className="text-lg font-semibold">Editando ficha</h4>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>Título</label>
                          <div className="relative">
                            <Type size={18} className={iconClass} />
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Título do treino"
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Descrição</label>
                          <div className="relative">
                            <AlignLeft size={18} className={iconClass} />
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Descrição"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className={`${labelClass} flex items-center gap-2`}>
                          <CalendarDays size={15} /> Dia da semana
                        </label>
                        <DayPills
                          value={editDay}
                          onChange={setEditDay}
                          counts={editCounts}
                          showNone={hasOrphans}
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        {visibleEdit.length === 0 && (
                          <p className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 py-6 text-center text-sm text-neutral-400">
                            Nenhum exercício em {dayFull(editDay)}.
                          </p>
                        )}

                        {visibleEdit.map(({ ex, idx }) => (
                          <div key={idx} className="flex flex-col gap-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={ex.name}
                                onChange={(e) => updateEditExercise(idx, "name", e.target.value)}
                                className={editInputClass}
                                placeholder="Exercício"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setEditExercises(editExercises.filter((_, i) => i !== idx))
                                }
                                className="flex w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 transition hover:bg-red-100"
                                aria-label="Remover exercício"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                              <input
                                type="number"
                                value={ex.sets}
                                onChange={(e) =>
                                  updateEditExercise(idx, "sets", parseInt(e.target.value) || 0)
                                }
                                className={editInputClass}
                                placeholder="Séries"
                              />
                              <input
                                type="text"
                                value={ex.reps}
                                onChange={(e) => updateEditExercise(idx, "reps", e.target.value)}
                                className={editInputClass}
                                placeholder="Repetições"
                              />
                              <input
                                type="text"
                                value={ex.rest_time || ""}
                                onChange={(e) => updateEditExercise(idx, "rest_time", e.target.value)}
                                className={editInputClass}
                                placeholder="Descanso"
                              />
                              <select
                                value={isKnownDay(ex.day) ? ex.day : ""}
                                onChange={(e) => updateEditExercise(idx, "day", e.target.value)}
                                className={editInputClass}
                              >
                                {!isKnownDay(ex.day) && <option value="">Sem dia</option>}
                                {DAYS.map((d) => (
                                  <option key={d.key} value={d.key}>
                                    {d.full}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addEditExercise}
                          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 py-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300 transition hover:border-[#7c6cf0] hover:text-[#5b4de0]"
                        >
                          <Plus size={16} /> Adicionar exercício em {dayFull(editDay || "seg")}
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(w.id)}
                          className="flex items-center gap-2 rounded-2xl bg-[#7c6cf0] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6a59e6]"
                        >
                          <Check size={16} /> Salvar alterações
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 transition hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        >
                          <X size={16} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9e6ff] dark:bg-neutral-800">
                            <Dumbbell size={18} className="text-[#5b4de0]" />
                          </span>
                          <div>
                            <h4 className="text-lg font-semibold leading-tight">{w.title}</h4>
                            {w.description && (
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">{w.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleStartEdit(w)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdf1c7] dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 transition hover:bg-amber-200"
                            aria-label="Editar ficha"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteWorkout(w.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 transition hover:bg-red-100"
                            aria-label="Excluir ficha"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        {groups.map((g) => (
                          <div key={g.key || "none"}>
                            <span className="mb-2 inline-block rounded-full bg-[#e9e6ff] dark:bg-neutral-800 px-3 py-1 text-xs font-semibold text-[#5b4de0]">
                              {dayFull(g.key)}
                            </span>
                            <div className="flex flex-col gap-2">
                              {g.items.map(({ ex, idx }) => (
                                <div key={idx} className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 text-sm">
                                  <div className="flex items-center justify-between gap-3">
                                    <strong className="font-medium">{ex.name}</strong>
                                    <span className="shrink-0 text-neutral-500 dark:text-neutral-400">
                                      {ex.sets}x{ex.reps}
                                      <span className="ml-2 text-xs text-neutral-400">
                                        descanso {ex.rest_time || "-"}
                                      </span>
                                    </span>
                                  </div>
                                  {ex.notes && (
                                    <p className="mt-1 text-xs text-neutral-400">Obs: {ex.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
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