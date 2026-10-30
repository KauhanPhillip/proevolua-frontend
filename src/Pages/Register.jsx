import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  BadgeCheck,
  Dumbbell,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Users,
  TrendingUp,
} from "lucide-react";

const inputClass =
  "w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 dark:text-white py-3 pl-11 pr-4 text-base outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0]";
const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-600 dark:text-neutral-300";

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    birth_date: "",
    phone: "",
    cref: "",
    specialty: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/professors", {
        ...formData,
        birth_date: formData.birth_date || null,
      });

      setSuccess("Cadastro realizado com sucesso! Redirecionando para o login...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Erro ao realizar cadastro. Tente novamente."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ececec] dark:bg-neutral-950 p-4 font-sans text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-5">
        {/* Card laranja de destaque (some no celular) */}
        <div className="relative hidden flex-col justify-between overflow-hidden rounded-3xl bg-[#ff4d00] p-8 text-white shadow-sm md:col-span-2 md:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Dumbbell size={22} />
          </div>

          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Pro<span className="text-neutral-900">Evolua</span>
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Crie a sua conta de professor e comece a acompanhar seus alunos.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/20 px-4 py-3 text-sm">
                <Users size={18} />
                Cadastre e organize seus alunos
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/20 px-4 py-3 text-sm">
                <TrendingUp size={18} />
                Acompanhe treinos e avaliações
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/15" />
        </div>

        {/* Card do formulário */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center rounded-3xl bg-white dark:bg-neutral-900 p-8 shadow-sm dark:border dark:border-neutral-800 md:col-span-3 md:p-10"
        >
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff4d00] text-white">
              <Dumbbell size={18} />
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              Pro<span className="text-[#ff4d00]">Evolua</span>
            </span>
          </div>

          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Cadastro do professor
            <span className="block text-base font-normal text-neutral-400">
              Preencha seus dados para começar
            </span>
          </h2>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-2xl bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mt-6 flex items-center gap-2 rounded-2xl bg-green-50 dark:bg-green-950/40 px-4 py-3 text-sm font-medium text-green-700 dark:text-green-300">
              <CheckCircle2 size={18} className="shrink-0" />
              {success}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label className={labelClass}>Nome completo</label>
              <div className="relative">
                <User size={18} className={iconClass} />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail size={18} className={iconClass} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="voce@email.com"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Senha</label>
              <div className="relative">
                <Lock size={18} className={iconClass} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Crie uma senha"
                  required
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-200"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <div className="sm:col-span-2">
                <label className={labelClass}>Data de Nascimento</label>
                <div className="relative">
                  <Calendar size={18} className={iconClass} />
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    required
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>CREF</label>
                <div className="relative">
                  <BadgeCheck size={18} className={iconClass} />
                  <input
                    type="text"
                    name="cref"
                    placeholder="Ex: 000000-G/UF"
                    value={formData.cref}
                    onChange={handleChange}
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
                    name="specialty"
                    placeholder="Ex: Musculação"
                    value={formData.specialty}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 rounded-2xl bg-[#7c6cf0] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#6a59e6]"
          >
            Finalizar cadastro
          </button>

          <p className="mt-5 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Já possui conta?{" "}
            <Link to="/" className="font-semibold text-[#5b4de0] hover:underline">
              Faça login aqui
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}