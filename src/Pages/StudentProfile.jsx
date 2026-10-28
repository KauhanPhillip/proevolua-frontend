import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ArrowLeft,
  Home,
  Mail,
  Calendar,
  Target,
  Flame,
  Scale,
  Ruler,
  Dumbbell,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  TrendingUp,
  Clock,
} from "lucide-react";

const inputClass =
  "w-full rounded-2xl bg-neutral-100 px-4 py-2.5 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0]";

const metricConfig = {
  weight: { label: "Peso", color: "#7c6cf0", unit: "kg" },
  body_fat: { label: "Gordura %", color: "#ff4d00", unit: "%" },
  waist: { label: "Cintura", color: "#16a34a", unit: "cm" },
  skeletal_muscle: { label: "Massa Muscular", color: "#2563eb", unit: "kg" },
};

const DAYS_ORDER = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const DAYS_NAMES = {
  seg: "Segunda-feira",
  ter: "Terça-feira",
  qua: "Quarta-feira",
  qui: "Quinta-feira",
  sex: "Sexta-feira",
  sab: "Sábado",
  dom: "Domingo",
  indefinido: "Outros Dias / Geral",
};

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-500">{label}</label>
      <input type="number" className={inputClass} {...props} />
    </div>
  );
}

export default function StudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("workouts");

  const [workouts, setWorkouts] = useState([]);
  const [assessments, setAssessments] = useState([]);

  // Estado para alternar a métrica do gráfico
  const [chartMetric, setChartMetric] = useState("weight");

  // Campos para nova avaliação (incluindo Bioimpedância)
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [bodyFatKg, setBodyFatKg] = useState("");
  const [leanMass, setLeanMass] = useState("");
  const [skeletalMuscle, setSkeletalMuscle] = useState("");
  const [totalBodyWater, setTotalBodyWater] = useState("");
  const [visceralFat, setVisceralFat] = useState("");
  const [boneMass, setBoneMass] = useState("");
  const [metabolicAge, setMetabolicAge] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [arms, setArms] = useState("");
  const [legs, setLegs] = useState("");

  // Estados para Edição Inline de Avaliação
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);
  const [editWeight, setEditWeight] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editBodyFat, setEditBodyFat] = useState("");
  const [editBodyFatKg, setEditBodyFatKg] = useState("");
  const [editLeanMass, setEditLeanMass] = useState("");
  const [editSkeletalMuscle, setEditSkeletalMuscle] = useState("");
  const [editTotalBodyWater, setEditTotalBodyWater] = useState("");
  const [editVisceralFat, setEditVisceralFat] = useState("");
  const [editBoneMass, setEditBoneMass] = useState("");
  const [editMetabolicAge, setEditMetabolicAge] = useState("");
  const [editChest, setEditChest] = useState("");
  const [editWaist, setEditWaist] = useState("");
  const [editArms, setEditArms] = useState("");
  const [editLegs, setEditLegs] = useState("");

  useEffect(() => {
    loadStudentData();
    loadWorkouts();
    loadAssessments();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      const res = await api.get(`/students/${studentId}`);
      setStudent(res.data);
    } catch (err) {
      console.error("Erro ao carregar aluno:", err);
    }
  };

  const loadWorkouts = async () => {
    try {
      const res = await api.get(`/students/${studentId}/workouts`);
      setWorkouts(res.data);
    } catch (err) {
      console.error("Erro ao carregar treinos:", err);
    }
  };

  const loadAssessments = async () => {
    try {
      const res = await api.get(`/students/${studentId}/assessments`);
      setAssessments(res.data);
    } catch (err) {
      console.error("Erro ao carregar avaliações:", err);
    }
  };

  const handleAddAssessment = async (e) => {
    e.preventDefault();
    if (!weight) {
      alert("Informe pelo menos o peso!");
      return;
    }

    try {
      await api.post("/assessments", {
        student_id: String(studentId),
        weight: parseFloat(weight),
        height: height ? parseFloat(height) : null,
        body_fat: bodyFat ? parseFloat(bodyFat) : null,
        body_fat_kg: bodyFatKg ? parseFloat(bodyFatKg) : null,
        lean_mass: leanMass ? parseFloat(leanMass) : null,
        skeletal_muscle: skeletalMuscle ? parseFloat(skeletalMuscle) : null,
        total_body_water: totalBodyWater ? parseFloat(totalBodyWater) : null,
        visceral_fat: visceralFat ? parseInt(visceralFat, 10) : null,
        bone_mass: boneMass ? parseFloat(boneMass) : null,
        metabolic_age: metabolicAge ? parseInt(metabolicAge, 10) : null,
        chest: chest ? parseFloat(chest) : null,
        waist: waist ? parseFloat(waist) : null,
        arms: arms ? parseFloat(arms) : null,
        legs: legs ? parseFloat(legs) : null,
      });

      setWeight("");
      setHeight("");
      setBodyFat("");
      setBodyFatKg("");
      setLeanMass("");
      setSkeletalMuscle("");
      setTotalBodyWater("");
      setVisceralFat("");
      setBoneMass("");
      setMetabolicAge("");
      setChest("");
      setWaist("");
      setArms("");
      setLegs("");
      loadAssessments();
      alert("Avaliação física registrada com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar avaliação:", err);
      alert("Erro ao salvar avaliação física.");
    }
  };

  const handleStartEditAssessment = (a) => {
    setEditingAssessmentId(a.id);
    setEditWeight(a.weight || "");
    setEditHeight(a.height || "");
    setEditBodyFat(a.body_fat || "");
    setEditBodyFatKg(a.body_fat_kg || "");
    setEditLeanMass(a.lean_mass || "");
    setEditSkeletalMuscle(a.skeletal_muscle || "");
    setEditTotalBodyWater(a.total_body_water || "");
    setEditVisceralFat(a.visceral_fat || "");
    setEditBoneMass(a.bone_mass || "");
    setEditMetabolicAge(a.metabolic_age || "");
    setEditChest(a.chest || "");
    setEditWaist(a.waist || "");
    setEditArms(a.arms || "");
    setEditLegs(a.legs || "");
  };

  const handleSaveEditAssessment = async (assessmentId) => {
    try {
      await api.put(`/assessments/${assessmentId}`, {
        weight: parseFloat(editWeight),
        height: editHeight ? parseFloat(editHeight) : null,
        body_fat: editBodyFat ? parseFloat(editBodyFat) : null,
        body_fat_kg: editBodyFatKg ? parseFloat(editBodyFatKg) : null,
        lean_mass: editLeanMass ? parseFloat(editLeanMass) : null,
        skeletal_muscle: editSkeletalMuscle ? parseFloat(editSkeletalMuscle) : null,
        total_body_water: editTotalBodyWater ? parseFloat(editTotalBodyWater) : null,
        visceral_fat: editVisceralFat ? parseInt(editVisceralFat, 10) : null,
        bone_mass: editBoneMass ? parseFloat(editBoneMass) : null,
        metabolic_age: editMetabolicAge ? parseInt(editMetabolicAge, 10) : null,
        chest: editChest ? parseFloat(editChest) : null,
        waist: editWaist ? parseFloat(editWaist) : null,
        arms: editArms ? parseFloat(editArms) : null,
        legs: editLegs ? parseFloat(editLegs) : null,
      });

      setEditingAssessmentId(null);
      loadAssessments();
      alert("Avaliação atualizada com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar avaliação:", err);
      alert("Erro ao atualizar avaliação.");
    }
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta avaliação física?")) return;

    try {
      await api.delete(`/assessments/${assessmentId}`);
      loadAssessments();
      alert("Avaliação excluída com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir avaliação:", err);
      alert("Erro ao excluir avaliação.");
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

  // Funções de Cálculo Automático (IMC e TMB)
  const calculateIMC = (w, h) => {
    if (!w || !h || h === 0) return null;
    const heightM = h > 3 ? h / 100 : h;
    return (w / (heightM * heightM)).toFixed(1);
  };

  const getIMCClass = (imc) => {
    if (!imc) return { text: "-", color: "#9ca3af" };
    const val = parseFloat(imc);
    if (val < 18.5) return { text: "Abaixo do peso", color: "#f59e0b" };
    if (val < 25) return { text: "Peso normal", color: "#22c55e" };
    if (val < 30) return { text: "Sobrepeso", color: "#fb923c" };
    return { text: "Obesidade", color: "#ef4444" };
  };

  const calculateTMB = (w, h, age) => {
    if (!w || !h || !age) return null;
    const heightCm = h <= 3 ? h * 100 : h;
    const tmb = 10 * w + 6.25 * heightCm - 5 * age + 5;
    return Math.round(tmb);
  };

  // Agrupar exercícios por dia da semana
  const groupExercisesByDay = (workoutsList) => {
    const grouped = {};
    workoutsList.forEach((w) => {
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

  // Gráfico de evolução (Recharts)
  const renderAdvancedChart = () => {
    const cfg = metricConfig[chartMetric];

    const sorted = [...assessments].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    const validData = sorted.filter(
      (a) => a[chartMetric] !== null && a[chartMetric] !== undefined && !isNaN(a[chartMetric])
    );

    const header = (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9e6ff]">
            <TrendingUp size={18} className="text-[#5b4de0]" />
          </span>
          <h4 className="text-xl font-semibold leading-tight">Painel de evolução</h4>
        </div>
        <div className="flex flex-wrap gap-1 rounded-full bg-neutral-100 p-1">
          {Object.entries(metricConfig).map(([key, c]) => (
            <button
              key={key}
              onClick={() => setChartMetric(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                chartMetric === key ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    );

    if (assessments.length < 2 || validData.length < 2) {
      return (
        <div className="rounded-3xl bg-white p-6 shadow-sm md:col-span-4">
          {header}
          <p className="py-8 text-center text-sm text-neutral-400">
            Cadastre pelo menos <strong>2 avaliações</strong>
            {assessments.length >= 2 ? " com essa medida" : ""} para gerar o gráfico de evolução.
          </p>
        </div>
      );
    }

    const values = validData.map((a) => Number(a[chartMetric]));
    const initialVal = values[0];
    const latestVal = values[values.length - 1];
    const diff = +(latestVal - initialVal).toFixed(1);
    const pad = cfg.unit === "kg" ? 2 : 1;
    const minV = Math.min(...values) - pad;
    const maxV = Math.max(...values) + pad;

    const data = validData.map((a) => ({
      date: new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      val: Number(a[chartMetric]),
    }));

    const diffColor =
      chartMetric === "weight" ? (diff <= 0 ? "text-green-600" : "text-red-500") : "text-[#5b4de0]";

    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm md:col-span-4">
        {header}

        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-neutral-100 p-3 text-center">
            <span className="block text-xs text-neutral-500">Inicial</span>
            <span className="text-lg font-semibold">
              {initialVal} <span className="text-sm font-normal text-neutral-400">{cfg.unit}</span>
            </span>
          </div>
          <div className="rounded-2xl bg-neutral-100 p-3 text-center">
            <span className="block text-xs text-neutral-500">Atual</span>
            <span className="text-lg font-semibold" style={{ color: cfg.color }}>
              {latestVal} <span className="text-sm font-normal text-neutral-400">{cfg.unit}</span>
            </span>
          </div>
          <div className="rounded-2xl bg-neutral-100 p-3 text-center">
            <span className="block text-xs text-neutral-500">Variação total</span>
            <span className={`text-lg font-semibold ${diffColor}`}>
              {diff > 0 ? `+${diff}` : diff}{" "}
              <span className="text-sm font-normal text-neutral-400">{cfg.unit}</span>
            </span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="evolutionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={cfg.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#eee" strokeDasharray="4 4" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <YAxis
                domain={[minV, maxV]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(v) => Math.round(v)}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.12)" }}
                formatter={(v) => [`${v} ${cfg.unit}`, cfg.label]}
              />
              <Area
                type="monotone"
                dataKey="val"
                stroke={cfg.color}
                strokeWidth={3}
                fill="url(#evolutionGradient)"
                dot={{ r: 5, fill: "#fff", stroke: cfg.color, strokeWidth: 3 }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ececec] font-sans text-neutral-500">
        Carregando dados do aluno...
      </div>
    );
  }

  // Última avaliação cadastrada para calcular os indicadores atuais
  const latestAssessment = assessments.length > 0 ? assessments[assessments.length - 1] : null;
  const currentHeight = latestAssessment?.height || null;
  const currentWeight = latestAssessment?.weight || null;
  const currentIMC = calculateIMC(currentWeight, currentHeight);
  const imcInfo = getIMCClass(currentIMC);
  const currentTMB = calculateTMB(currentWeight, currentHeight, student.age);
  const exercisesByDay = groupExercisesByDay(workouts);

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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {/* Cabeçalho do aluno */}
          <div
            className={`rounded-3xl bg-white p-6 shadow-sm ${
              latestAssessment ? "md:col-span-2" : "md:col-span-4"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e9e6ff] text-xl font-semibold text-[#5b4de0]">
                  {initials(student.name)}
                </span>
                <div>
                  <h2 className="text-2xl font-semibold leading-tight tracking-tight">{student.name}</h2>
                  <span className="mt-1 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold tracking-wide text-[#5b4de0]">
                    Matrícula: {formatId(student.id)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <span className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
                <Calendar size={14} /> {student.age || "-"} anos
              </span>
              <span className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
                <Mail size={14} /> {student.email || "Não informado"}
              </span>
              <span className="flex items-center gap-2 rounded-full bg-[#fdf1c7] px-3 py-1.5 font-medium text-amber-700">
                <Target size={14} /> {student.goal || "Objetivo não definido"}
              </span>
            </div>

            {latestAssessment && (
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="flex items-center gap-2 rounded-full bg-[#e9e6ff] px-3 py-1.5 font-medium text-[#5b4de0]">
                  <Scale size={14} /> {currentWeight} kg
                </span>
                <span className="flex items-center gap-2 rounded-full bg-[#e9e6ff] px-3 py-1.5 font-medium text-[#5b4de0]">
                  <Ruler size={14} /> {currentHeight ? `${currentHeight} m` : "Altura não inf."}
                </span>
              </div>
            )}
          </div>

          {/* IMC (card escuro) */}
          {latestAssessment && (
            <div className="flex flex-col justify-between rounded-3xl bg-neutral-900 p-6 text-white shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                <Scale size={20} />
              </div>
              <div>
                <p className="text-sm text-neutral-400">IMC atual</p>
                <p className="text-5xl font-semibold leading-none">{currentIMC || "-"}</p>
                <span
                  className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `${imcInfo.color}33`, color: imcInfo.color }}
                >
                  {imcInfo.text}
                </span>
              </div>
            </div>
          )}

          {/* TMB (card laranja) */}
          {latestAssessment && (
            <div className="flex flex-col justify-between rounded-3xl bg-[#ff4d00] p-6 text-white shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                <Flame size={20} />
              </div>
              <div>
                <p className="text-sm text-white/80">Metabolismo basal (TMB)</p>
                <p className="text-4xl font-semibold leading-none">
                  {currentTMB || "-"}
                  {currentTMB && <span className="ml-1 text-lg font-normal text-white/80">kcal</span>}
                </p>
                <p className="mt-2 text-xs text-white/80">Gasto calórico em repouso</p>
              </div>
            </div>
          )}

          {/* Abas */}
          <div className="rounded-3xl bg-white p-2 shadow-sm md:col-span-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                onClick={() => setActiveTab("workouts")}
                className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  activeTab === "workouts"
                    ? "bg-[#7c6cf0] text-white"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                }`}
              >
                <Dumbbell size={18} /> Fichas de treino ({workouts.length})
              </button>
              <button
                onClick={() => setActiveTab("assessments")}
                className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  activeTab === "assessments"
                    ? "bg-[#7c6cf0] text-white"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                }`}
              >
                <ClipboardList size={18} /> Avaliações &amp; medidas ({assessments.length})
              </button>
            </div>
          </div>

          {/* ABA DE TREINOS SEPARADOS POR DIAS */}
          {activeTab === "workouts" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-4">
                <h3 className="text-xl font-semibold">Fichas do aluno (por dia)</h3>
                <button
                  onClick={() => navigate(`/workouts/${studentId}`)}
                  className="flex items-center gap-2 rounded-full bg-[#7c6cf0] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6a59e6]"
                >
                  <Plus size={16} /> Gerenciar / Criar treinos
                </button>
              </div>

              {workouts.length === 0 ? (
                <div className="rounded-3xl bg-white p-8 text-center text-sm text-neutral-400 shadow-sm md:col-span-4">
                  Nenhuma ficha de treino cadastrada para este aluno.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:col-span-4">
                  {DAYS_ORDER.concat("indefinido").map((dayKey) => {
                    const dayExercises = exercisesByDay[dayKey] || [];
                    if (dayExercises.length === 0) return null;

                    return (
                      <div key={dayKey} className="rounded-3xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="rounded-full bg-[#e9e6ff] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#5b4de0]">
                            {DAYS_NAMES[dayKey] || dayKey}
                          </span>
                          <span className="text-xs text-neutral-400">{dayExercises.length} exercício(s)</span>
                        </div>

                        <div className="flex flex-col gap-2">
                          {dayExercises.map((ex, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-2xl bg-neutral-100 px-4 py-2.5 text-sm"
                            >
                              <div>
                                <strong className="font-medium">{ex.name}</strong>
                                <span className="block text-[11px] text-neutral-400">Ficha: {ex.workoutTitle}</span>
                              </div>
                              <span className="text-neutral-500 text-right">
                                {ex.sets}x{ex.reps}
                                {ex.rest_time && (
                                  <span className="ml-2 flex items-center gap-1 text-xs text-neutral-400 inline-flex">
                                    <Clock size={12} /> {ex.rest_time}
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ABA DE AVALIAÇÕES E MEDIDAS */}
          {activeTab === "assessments" && (
            <>
              {/* Formulário nova avaliação com Bioimpedância */}
              <form
                onSubmit={handleAddAssessment}
                className="rounded-3xl bg-white p-6 shadow-sm md:col-span-4"
              >
                <h3 className="mb-4 text-xl font-semibold leading-tight">
                  Registrar nova avaliação física &amp; Bioimpedância
                  <span className="block text-sm font-normal text-neutral-400">
                    Apenas o peso é obrigatório
                  </span>
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Peso (kg) *" step="0.1" placeholder="Ex: 78.5" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                  <Field label="Altura (m)" step="0.01" placeholder="Ex: 1.75" value={height} onChange={(e) => setHeight(e.target.value)} />
                  <Field label="Gordura corporal (%)" step="0.1" placeholder="Ex: 18" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <Field label="Massa gorda (kg)" step="0.1" placeholder="Ex: 12.5" value={bodyFatKg} onChange={(e) => setBodyFatKg(e.target.value)} />
                  <Field label="Massa magra (kg)" step="0.1" placeholder="Ex: 62.0" value={leanMass} onChange={(e) => setLeanMass(e.target.value)} />
                  <Field label="Massa muscular esc. (kg)" step="0.1" placeholder="Ex: 32.0" value={skeletalMuscle} onChange={(e) => setSkeletalMuscle(e.target.value)} />
                  <Field label="Água corporal (%)" step="0.1" placeholder="Ex: 55.0" value={totalBodyWater} onChange={(e) => setTotalBodyWater(e.target.value)} />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Gordura visceral (1-59)" step="1" placeholder="Ex: 5" value={visceralFat} onChange={(e) => setVisceralFat(e.target.value)} />
                  <Field label="Massa óssea (kg)" step="0.1" placeholder="Ex: 3.2" value={boneMass} onChange={(e) => setBoneMass(e.target.value)} />
                  <Field label="Idade metabólica" step="1" placeholder="Ex: 25" value={metabolicAge} onChange={(e) => setMetabolicAge(e.target.value)} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Peitoral (cm)" step="0.1" value={chest} onChange={(e) => setChest(e.target.value)} />
                  <Field label="Cintura (cm)" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} />
                  <Field label="Braços (cm)" step="0.1" value={arms} onChange={(e) => setArms(e.target.value)} />
                  <Field label="Pernas (cm)" step="0.1" value={legs} onChange={(e) => setLegs(e.target.value)} />
                </div>

                <button
                  type="submit"
                  className="mt-5 rounded-2xl bg-[#7c6cf0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6a59e6]"
                >
                  Salvar medidas
                </button>
              </form>

              {renderAdvancedChart()}

              <h3 className="mt-2 text-xl font-semibold md:col-span-4">Histórico de medidas</h3>

              {assessments.length === 0 ? (
                <div className="rounded-3xl bg-white p-8 text-center text-sm text-neutral-400 shadow-sm md:col-span-4">
                  Nenhuma avaliação cadastrada ainda.
                </div>
              ) : (
                assessments.map((a, idx) => {
                  const itemIMC = calculateIMC(a.weight, a.height);
                  const itemClass = getIMCClass(itemIMC);
                  const isEditing = editingAssessmentId === a.id;

                  return (
                    <div
                      key={a.id || idx}
                      className={`rounded-3xl bg-white p-6 shadow-sm ${
                        isEditing ? "md:col-span-4" : "md:col-span-2"
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex flex-col gap-3">
                          <h4 className="text-lg font-semibold">Editando avaliação</h4>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <Field label="Peso (kg)" step="0.1" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} />
                            <Field label="Altura (m)" step="0.01" value={editHeight} onChange={(e) => setEditHeight(e.target.value)} />
                            <Field label="% Gordura" step="0.1" value={editBodyFat} onChange={(e) => setEditBodyFat(e.target.value)} />
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                            <Field label="Massa gorda (kg)" step="0.1" value={editBodyFatKg} onChange={(e) => setEditBodyFatKg(e.target.value)} />
                            <Field label="Massa magra (kg)" step="0.1" value={editLeanMass} onChange={(e) => setEditLeanMass(e.target.value)} />
                            <Field label="Massa muscular (kg)" step="0.1" value={editSkeletalMuscle} onChange={(e) => setEditSkeletalMuscle(e.target.value)} />
                            <Field label="Água corporal (%)" step="0.1" value={editTotalBodyWater} onChange={(e) => setEditTotalBodyWater(e.target.value)} />
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <Field label="Gordura visceral" step="1" value={editVisceralFat} onChange={(e) => setEditVisceralFat(e.target.value)} />
                            <Field label="Massa óssea (kg)" step="0.1" value={editBoneMass} onChange={(e) => setEditBoneMass(e.target.value)} />
                            <Field label="Idade metabólica" step="1" value={editMetabolicAge} onChange={(e) => setEditMetabolicAge(e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <Field label="Peitoral (cm)" step="0.1" value={editChest} onChange={(e) => setEditChest(e.target.value)} />
                            <Field label="Cintura (cm)" step="0.1" value={editWaist} onChange={(e) => setEditWaist(e.target.value)} />
                            <Field label="Braços (cm)" step="0.1" value={editArms} onChange={(e) => setEditArms(e.target.value)} />
                            <Field label="Pernas (cm)" step="0.1" value={editLegs} onChange={(e) => setEditLegs(e.target.value)} />
                          </div>
                          <div className="mt-1 flex gap-2">
                            <button
                              onClick={() => handleSaveEditAssessment(a.id)}
                              className="flex items-center gap-2 rounded-2xl bg-[#7c6cf0] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6a59e6]"
                            >
                              <Check size={16} /> Salvar
                            </button>
                            <button
                              onClick={() => setEditingAssessmentId(null)}
                              className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-200"
                            >
                              <X size={16} /> Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#5b4de0]">
                                {a.created_at
                                  ? new Date(a.created_at).toLocaleDateString("pt-BR")
                                  : "Recente"}
                              </p>
                              {itemIMC && (
                                <span
                                  className="mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                                  style={{ backgroundColor: `${itemClass.color}22`, color: itemClass.color }}
                                >
                                  IMC {itemIMC} · {itemClass.text}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleStartEditAssessment(a)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdf1c7] text-amber-700 transition hover:bg-amber-200"
                                aria-label="Editar avaliação"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteAssessment(a.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                                aria-label="Excluir avaliação"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                            <div className="rounded-2xl bg-neutral-100 p-3">
                              <span className="block text-xs text-neutral-500">Peso</span>
                              <strong>{a.weight} kg</strong>
                            </div>
                            <div className="rounded-2xl bg-neutral-100 p-3">
                              <span className="block text-xs text-neutral-500">Altura</span>
                              <strong>{a.height || "-"} m</strong>
                            </div>
                            <div className="rounded-2xl bg-neutral-100 p-3">
                              <span className="block text-xs text-neutral-500">Gordura %</span>
                              <strong>{a.body_fat ? `${a.body_fat}%` : "-"}</strong>
                            </div>
                          </div>

                          {/* Seção bioimpedância se houver dados */}
                          {(a.body_fat_kg || a.lean_mass || a.skeletal_muscle || a.total_body_water) && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-2">
                              <div className="rounded-2xl bg-[#f8f7ff] p-3 border border-[#e9e6ff]">
                                <span className="block text-xs text-neutral-500">Massa Gorda</span>
                                <strong className="text-[#5b4de0]">{a.body_fat_kg ? `${a.body_fat_kg} kg` : "-"}</strong>
                              </div>
                              <div className="rounded-2xl bg-[#f8f7ff] p-3 border border-[#e9e6ff]">
                                <span className="block text-xs text-neutral-500">Massa Magra</span>
                                <strong className="text-[#5b4de0]">{a.lean_mass ? `${a.lean_mass} kg` : "-"}</strong>
                              </div>
                              <div className="rounded-2xl bg-[#f8f7ff] p-3 border border-[#e9e6ff]">
                                <span className="block text-xs text-neutral-500">Massa Muscular</span>
                                <strong className="text-[#5b4de0]">{a.skeletal_muscle ? `${a.skeletal_muscle} kg` : "-"}</strong>
                              </div>
                              <div className="rounded-2xl bg-[#f8f7ff] p-3 border border-[#e9e6ff]">
                                <span className="block text-xs text-neutral-500">Água Corporal</span>
                                <strong className="text-[#5b4de0]">{a.total_body_water ? `${a.total_body_water}%` : "-"}</strong>
                              </div>
                            </div>
                          )}

                          {(a.visceral_fat || a.bone_mass || a.metabolic_age) && (
                            <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                              <div className="rounded-2xl bg-neutral-100 p-3">
                                <span className="block text-xs text-neutral-500">Gord. Visceral</span>
                                <strong>{a.visceral_fat || "-"}</strong>
                              </div>
                              <div className="rounded-2xl bg-neutral-100 p-3">
                                <span className="block text-xs text-neutral-500">Massa Óssea</span>
                                <strong>{a.bone_mass ? `${a.bone_mass} kg` : "-"}</strong>
                              </div>
                              <div className="rounded-2xl bg-neutral-100 p-3">
                                <span className="block text-xs text-neutral-500">Idade Metab.</span>
                                <strong>{a.metabolic_age ? `${a.metabolic_age} anos` : "-"}</strong>
                              </div>
                            </div>
                          )}

                          <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
                            <div className="rounded-2xl bg-neutral-100 p-3">
                              <span className="block text-xs text-neutral-500">Peitoral</span>
                              <strong>{a.chest || "-"}</strong>
                            </div>
                            <div className="rounded-2xl bg-neutral-100 p-3">
                              <span className="block text-xs text-neutral-500">Cintura</span>
                              <strong>{a.waist || "-"}</strong>
                            </div>
                            <div className="rounded-2xl bg-neutral-100 p-3">
                              <span className="block text-xs text-neutral-500">Braços</span>
                              <strong>{a.arms || "-"}</strong>
                            </div>
                            <div className="rounded-2xl bg-neutral-100 p-3">
                              <span className="block text-xs text-neutral-500">Pernas</span>
                              <strong>{a.legs || "-"}</strong>
                            </div>
                          </div>
                          <p className="mt-2 text-right text-xs text-neutral-400">circunferências em cm</p>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}