import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  Search,
  Users,
  Target,
  ClipboardList,
  Activity,
  ChevronRight,
  Info,
  UserPlus,
  LogOut,
} from "lucide-react";

const BAR_COLORS = ["#7c6cf0", "#ff4d00", "#facc15", "#4ade80", "#38bdf8"];

export default function Dashboard() {
  const navigate = useNavigate();
  const professorId = localStorage.getItem("professor_id") || 5;

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await api.get(`/professors/${professorId}/students`);
      setStudents(response.data);
    } catch (err) {
      console.error("Erro ao carregar alunos no Dashboard:", err);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredStudents([]);
    } else {
      const results = students.filter(
        (s) =>
          s.name.toLowerCase().includes(value.toLowerCase()) ||
          String(s.id).includes(value)
      );
      setFilteredStudents(results);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth/login");
  };

  // Encurtador limpo de ID
  const formatId = (id) => `#${String(id).substring(0, 6).toUpperCase()}`;

  // ---------- Dados derivados ----------
  const withGoal = students.filter((s) => s.goal && String(s.goal).trim() !== "").length;
  const goalPercent = students.length ? Math.round((withGoal / students.length) * 100) : 0;

  const goalsChart = useMemo(() => {
    const count = {};
    students.forEach((s) => {
      const g = s.goal && String(s.goal).trim() !== "" ? String(s.goal).trim() : "Sem objetivo";
      count[g] = (count[g] || 0) + 1;
    });
    return Object.entries(count)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [students]);

  const recentStudents = students.slice(-5).reverse();

  const initials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");

  return (
    <div className="min-h-screen bg-[#ececec] p-4 md:p-8 font-sans text-neutral-900">
      <div className="mx-auto max-w-6xl">
        {/* Cabeçalho */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">ProEvolua</h1>
            <p className="text-sm text-neutral-500">Bem-vindo ao painel do professor!</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão de Cadastrar Aluno */}
            <button
              onClick={() => navigate("/students")}
              className="flex items-center gap-2 rounded-2xl bg-[#ff4d00] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e04400]"
            >
              <UserPlus size={18} /> Cadastrar aluno
            </button>

            {/* Botão de Sair de volta */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
            >
              <LogOut size={18} /> Sair
            </button>
          </div>
        </div>

        {/* Grade bento */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {/* Busca */}
          <div className="relative z-20 rounded-3xl bg-white p-6 shadow-sm md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold leading-tight">
                Buscar aluno
                <span className="block text-sm font-normal text-neutral-400">por nome ou ID</span>
              </h3>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <Info size={14} />
              </span>
            </div>

            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Digite o nome ou ID do aluno..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full rounded-2xl bg-neutral-100 py-3 pl-11 pr-4 text-base outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0]"
              />
            </div>

            {filteredStudents.length > 0 && (
              <div className="absolute left-6 right-6 top-[130px] max-h-64 overflow-y-auto rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => navigate(`/students/${student.id}/profile`)}
                    className="flex cursor-pointer items-center justify-between rounded-xl p-3 transition hover:bg-neutral-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9e6ff] text-sm font-semibold text-[#5b4de0]">
                        {initials(student.name)}
                      </span>
                      <div>
                        <strong className="text-sm">{student.name}</strong>{" "}
                        <span className="text-xs text-neutral-400">({formatId(student.id)})</span>
                        <p className="m-0 text-xs text-neutral-500">
                          {student.goal ? `Objetivo: ${student.goal}` : "Sem objetivo definido"}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#5b4de0]">
                      Ver perfil <ChevronRight size={14} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total de alunos (card escuro) */}
          <div className="flex flex-col justify-between rounded-3xl bg-neutral-900 p-6 text-white shadow-sm">
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

          {/* Status do sistema (card laranja) */}
          <div className="flex flex-col justify-between rounded-3xl bg-[#ff4d00] p-6 text-white shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <Activity size={20} />
            </div>
            <div>
              <h4 className="text-xl font-semibold leading-tight">Status do sistema</h4>
              <div className="mt-3 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                Ativo &amp; Sincronizado
              </div>
            </div>
          </div>

          {/* Anel: alunos com objetivo definido */}
          <div className="rounded-3xl bg-white p-6 shadow-sm md:col-span-2 md:row-span-1">
            <div className="flex items-center gap-4">
              <div className="relative h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="78%"
                    outerRadius="100%"
                    data={[{ value: goalPercent }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar
                      dataKey="value"
                      cornerRadius={20}
                      fill="#ff4d00"
                      background={{ fill: "#f1f1f1" }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold">{goalPercent}%</span>
                  <span className="text-xs text-neutral-400">com objetivo</span>
                </div>
              </div>
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf1c7]">
                  <Target size={18} className="text-amber-600" />
                </div>
                <h4 className="text-xl font-semibold leading-tight">Metas definidas</h4>
                <p className="mt-1 text-sm text-neutral-500">
                  <strong className="text-neutral-900">{withGoal}</strong> de{" "}
                  <strong className="text-neutral-900">{students.length}</strong> alunos já têm
                  objetivo cadastrado.
                </p>
              </div>
            </div>
          </div>

          {/* Barras: alunos por objetivo */}
          <div className="rounded-3xl bg-white p-6 shadow-sm md:col-span-2">
            <h4 className="mb-1 text-xl font-semibold leading-tight">Alunos por objetivo</h4>
            <p className="mb-2 text-sm text-neutral-400">Os 5 objetivos mais comuns</p>
            <div className="h-40">
              {goalsChart.length === 0 ? (
                <p className="pt-12 text-center text-sm text-neutral-400">Sem dados ainda</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={goalsChart} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      interval={0}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.12)" }}
                      formatter={(v) => [`${v} aluno(s)`, ""]}
                      labelFormatter={() => ""}
                    />
                    <Bar dataKey="total" radius={[12, 12, 12, 12]} maxBarSize={36}>
                      {goalsChart.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Alunos recentes */}
          <div className="rounded-3xl bg-white p-6 shadow-sm md:col-span-2">
            <h4 className="mb-4 text-xl font-semibold leading-tight">Alunos recentes</h4>
            {recentStudents.length === 0 ? (
              <p className="text-sm text-neutral-400">Nenhum aluno cadastrado.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {recentStudents.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/students/${s.id}/profile`)}
                    className="flex cursor-pointer items-center justify-between rounded-xl p-2 transition hover:bg-neutral-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9e6ff] text-xs font-semibold text-[#5b4de0]">
                        {initials(s.name)}
                      </span>
                      <div>
                        <p className="m-0 text-sm font-medium">{s.name}</p>
                        <p className="m-0 text-xs text-neutral-400">{s.goal || "Sem objetivo definido"}</p>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400">{formatId(s.id)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações rápidas */}
          <div className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm md:col-span-2">
            <div>
              <h4 className="text-xl font-semibold leading-tight">Ações rápidas</h4>
              <p className="mt-1 text-sm text-neutral-400">Acesse o que você mais usa</p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => navigate("/students")}
                className="flex items-center justify-between rounded-2xl bg-[#ff4d00] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#e04400]"
              >
                <span className="flex items-center gap-3">
                  <UserPlus size={20} /> Cadastrar novo aluno
                </span>
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => navigate("/students")}
                className="flex items-center justify-between rounded-2xl bg-[#7c6cf0] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#6a59e6]"
              >
                <span className="flex items-center gap-3">
                  <ClipboardList size={20} /> Gerenciar todos os alunos
                </span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}