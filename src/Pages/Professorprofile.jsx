import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  ArrowLeft,
  Home,
  LogOut,
  User,
  Mail,
  Phone,
  Award,
  Dumbbell,
  Calendar,
  Users,
  ClipboardList,
  Target,
  AlertCircle,
  Check,
  ChevronRight,
  Clock,
} from "lucide-react";

const inputClass =
  "w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 dark:text-white py-3 pl-11 pr-4 text-base outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0]";
const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-600 dark:text-neutral-300";

const initials = (name = "") => {
  if (!name || typeof name !== "string") return "PR";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
};

const fmtDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("pt-BR");
  } catch {
    return "-";
  }
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

// Formata a data para DD/MM/YYYY
const formatDateDisplay = (dateString) => {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
};

export default function Professorprofile() {
  const navigate = useNavigate();
  const professorId = localStorage.getItem("professor_id");
  const picture = localStorage.getItem("professor_picture");

  const [professor, setProfessor] = useState(null);
  const [stats, setStats] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [cref, setCref] = useState("");
  const [specialty, setSpecialty] = useState("");

  useEffect(() => {
    if (professorId) {
      loadProfessor();
      loadStats();
    }
  }, [professorId]);

  const loadProfessor = async () => {
    try {
      const res = await api.get(`/professors/${professorId}`);
      const p = res.data || {};
      setProfessor(p);
      setFullName(p.full_name || "");
      setBirthDate(p.birth_date ? p.birth_date.substring(0, 10) : "");
      setPhone(p.phone || "");
      setCref(p.cref || "");
      setSpecialty(p.specialty || "");
    } catch (err) {
      console.error("Erro ao carregar professor:", err);
      setProfessor({});
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get(`/professors/${professorId}/stats`);
      setStats(res.data || {});
    } catch (err) {
      console.error("Erro ao carregar resumo:", err);
      setStats({});
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert("Informe o seu nome.");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/professors/${professorId}`, {
        full_name: fullName.trim(),
        birth_date: birthDate || null,
        phone: phone || null,
        cref: cref || null,
        specialty: specialty || null,
      });
      await loadProfessor();
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      alert("Erro ao atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth/login");
  };

  if (!professorId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ececec] dark:bg-neutral-950 p-4 font-sans text-neutral-900 dark:text-neutral-100">
        <div className="rounded-3xl bg-white dark:bg-neutral-900 p-8 text-center shadow-sm dark:border dark:border-neutral-800">
          <p className="mb-4 text-neutral-600 dark:text-neutral-400">Sessão não encontrada. Entre novamente.</p>
          <button
            onClick={() => navigate("/auth/login")}
            className="rounded-2xl bg-[#7c6cf0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6a59e6]"
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  if (!professor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ececec] dark:bg-neutral-950 font-sans text-neutral-500 dark:text-neutral-400">
        Carregando perfil...
      </div>
    );
  }

  const missing = [
    !professor.birth_date && "data de nascimento",
    !professor.phone && "telefone",
    !professor.cref && "CREF",
    !professor.specialty && "especialidade",
  ].filter(Boolean);

  let memberSince = null;
  try {
    if (professor.created_at) {
      memberSince = new Date(professor.created_at).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
    }
  } catch {
    memberSince = null;
  }

  const profAge = calculateAge(professor.birth_date);
  const needs = stats?.needs_reassessment || [];
  const recentStudents = stats?.recent_students || [];
  const recentAssessments = stats?.recent_assessments || [];

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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 dark:hover:bg-red-950/30 dark:border dark:border-neutral-800"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Meu perfil</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Seus dados e o resumo da sua atividade</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {missing.length > 0 && (
            <div className="flex items-start gap-3 rounded-3xl bg-amber-50 dark:bg-amber-950/40 p-5 text-sm text-amber-800 dark:text-amber-300 shadow-sm md:col-span-4 dark:border dark:border-amber-900/50">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p>
                <strong>Complete seu cadastro.</strong> Faltam: {missing.join(", ")}. O seu nome, CREF e
                telefone aparecem na assinatura dos PDFs que você exporta para os alunos.
              </p>
            </div>
          )}

          {/* Cabeçalho do professor */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm dark:border dark:border-neutral-800 md:col-span-2">
            <div className="flex items-center gap-4">
              {picture && !imgError ? (
                <img
                  src={picture}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e9e6ff] text-xl font-semibold text-[#5b4de0]">
                  {initials(professor.full_name)}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-semibold leading-tight tracking-tight">
                  {professor.full_name || "Professor"}
                </h2>
                <p className="text-sm text-neutral-400">
                  Professor{memberSince ? ` · desde ${memberSince}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <span className="flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-neutral-600 dark:text-neutral-300">
                <Calendar size={14} /> {professor.birth_date ? `${formatDateDisplay(professor.birth_date.substring(0, 10))}${profAge !== null ? ` (${profAge} anos)` : ""}` : "Data de nasc. não informada"}
              </span>
              <span className="flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-neutral-600 dark:text-neutral-300">
                <Mail size={14} /> {professor.email || "Sem e-mail"}
              </span>
              <span className="flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-neutral-600 dark:text-neutral-300">
                <Phone size={14} /> {professor.phone || "Sem telefone"}
              </span>
              <span className="flex items-center gap-2 rounded-full bg-[#fdf1c7] dark:bg-amber-950/40 px-3 py-1.5 font-medium text-amber-700 dark:text-amber-300">
                <Award size={14} /> {professor.cref ? `CREF ${professor.cref}` : "CREF não informado"}
              </span>
              {professor.specialty && (
                <span className="flex items-center gap-2 rounded-full bg-[#e9e6ff] px-3 py-1.5 font-medium text-[#5b4de0]">
                  <Dumbbell size={14} /> {professor.specialty}
                </span>
              )}
            </div>
          </div>

          {/* Alunos (card escuro) */}
          <div className="flex flex-col justify-between rounded-3xl bg-neutral-900 dark:border dark:border-neutral-800 p-6 text-white shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <Users size={20} />
            </div>
            <div>
              <p className="text-5xl font-semibold leading-none">{stats ? stats.total_students ?? 0 : "-"}</p>
              <p className="mt-2 text-sm text-neutral-400">Alunos cadastrados</p>
            </div>
          </div>

          {/* Fichas (card laranja) */}
          <div className="flex flex-col justify-between rounded-3xl bg-[#ff4d00] p-6 text-white shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <Dumbbell size={20} />
            </div>
            <div>
              <p className="text-5xl font-semibold leading-none">{stats ? stats.total_workouts ?? 0 : "-"}</p>
              <p className="mt-2 text-sm text-white/80">Fichas de treino criadas</p>
            </div>
          </div>

          {/* Formulário: meus dados */}
          <form
            onSubmit={handleSave}
            className="rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm dark:border dark:border-neutral-800 md:col-span-2 md:row-span-2"
          >
            <h3 className="mb-5 text-xl font-semibold leading-tight">
              Meus dados
              <span className="block text-sm font-normal text-neutral-400">
                O e-mail da conta não pode ser alterado
              </span>
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Nome completo</label>
                <div className="relative">
                  <User size={18} className={iconClass} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Data de Nascimento</label>
                  <div className="relative">
                    <Calendar size={18} className={iconClass} />
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className={labelClass}>Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone size={18} className={iconClass} />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(35) 99999-9999"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>CREF</label>
                  <div className="relative">
                    <Award size={18} className={iconClass} />
                    <input
                      type="text"
                      value={cref}
                      onChange={(e) => setCref(e.target.value)}
                      placeholder="Ex: 000000-G/MG"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Especialidade</label>
                  <div className="relative">
                    <Dumbbell size={18} className={iconClass} />
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="Ex: Musculação"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7c6cf0] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#6a59e6] disabled:opacity-60"
            >
              <Check size={18} /> {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>

          {/* Avaliações registradas */}
          <div className="flex flex-col justify-between rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm dark:border dark:border-neutral-800">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9e6ff] dark:bg-neutral-800">
              <ClipboardList size={20} className="text-[#5b4de0]" />
            </span>
            <div>
              <p className="text-5xl font-semibold leading-none">{stats ? stats.total_assessments ?? 0 : "-"}</p>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Avaliações registradas</p>
            </div>
          </div>

          {/* Alunos sem objetivo */}
          <div className="flex flex-col justify-between rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm dark:border dark:border-neutral-800">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fdf1c7] dark:bg-amber-950/40">
              <Target size={20} className="text-amber-600 dark:text-amber-400" />
            </span>
            <div>
              <p className="text-5xl font-semibold leading-none">{stats ? stats.students_without_goal ?? 0 : "-"}</p>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Alunos sem objetivo definido</p>
            </div>
          </div>

          {/* Precisam de reavaliação */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm dark:border dark:border-neutral-800 md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf1c7] dark:bg-amber-950/40">
                <Clock size={18} className="text-amber-600 dark:text-amber-400" />
              </span>
              <h4 className="text-xl font-semibold leading-tight">
                Precisam de reavaliação
                <span className="block text-sm font-normal text-neutral-400">
                  Sem avaliação há 30 dias ou mais
                </span>
              </h4>
            </div>

            {needs.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">
                {stats ? "Todos os alunos estão com a avaliação em dia." : "Carregando..."}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {needs.slice(0, 6).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/students/${s.id}/profile`)}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 text-sm transition hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    <span className="truncate font-medium">{s.name}</span>
                    <span className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-950/60 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                      {s.days === null ? "Nunca avaliado" : `${s.days} dias`}
                    </span>
                  </div>
                ))}
                {needs.length > 6 && (
                  <p className="pt-1 text-center text-xs text-neutral-400">+ {needs.length - 6} alunos</p>
                )}
              </div>
            )}
          </div>

          {/* Alunos recentes */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm dark:border dark:border-neutral-800 md:col-span-2">
            <h4 className="mb-4 text-xl font-semibold leading-tight">Alunos recentes</h4>
            {recentStudents.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">Nenhum aluno cadastrado ainda.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {recentStudents.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/students/${s.id}/profile`)}
                    className="flex cursor-pointer items-center justify-between rounded-xl p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
                    <ChevronRight size={16} className="text-neutral-300" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Últimas avaliações */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-sm dark:border dark:border-neutral-800 md:col-span-2">
            <h4 className="mb-4 text-xl font-semibold leading-tight">Últimas avaliações</h4>
            {recentAssessments.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">Nenhuma avaliação registrada ainda.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {recentAssessments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/students/${a.student_id}/profile`)}
                    className="flex cursor-pointer items-center justify-between rounded-xl p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9e6ff] text-xs font-semibold text-[#5b4de0]">
                        {initials(a.student_name || "")}
                      </span>
                      <div>
                        <p className="m-0 text-sm font-medium">{a.student_name || "Aluno"}</p>
                        <p className="m-0 text-xs text-neutral-400">{fmtDate(a.created_at)}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                      {a.weight ? `${a.weight} kg` : "-"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}