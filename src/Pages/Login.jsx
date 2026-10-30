import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import api from "../services/api";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Dumbbell, TrendingUp, ClipboardCheck } from "lucide-react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function LoginContent({ googleEnabled }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const saveSession = (data) => {
    localStorage.setItem("token", data.access_token ?? "logged-in");
    if (data.professor_id !== undefined && data.professor_id !== null) {
      localStorage.setItem("professor_id", String(data.professor_id));
    }
    if (data.picture) localStorage.setItem("professor_picture", data.picture);
    else localStorage.removeItem("professor_picture");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      saveSession(response.data);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Email ou senha incorretos.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");

    try {
      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      saveSession(response.data);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Não foi possível entrar com o Google.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ececec] dark:bg-neutral-950 p-4 font-sans text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="grid w-full max-w-4xl grid-cols-1 gap-5 md:grid-cols-5">
        {/* Card de destaque (some no celular) */}
        <div className="relative hidden flex-col justify-between overflow-hidden rounded-3xl bg-neutral-900 dark:border dark:border-neutral-800 p-8 text-white shadow-sm md:col-span-2 md:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff4d00]">
            <Dumbbell size={22} />
          </div>

          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Pro<span className="text-[#ff4d00]">Evolua</span>
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Avaliações e treinos dos seus alunos em um só lugar.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm">
                <TrendingUp size={18} className="text-[#4ade80]" />
                Acompanhe a evolução
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm">
                <ClipboardCheck size={18} className="text-[#facc15]" />
                Monte treinos e avaliações
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#ff4d00]/20" />
        </div>

        {/* Card do formulário */}
        <div className="flex flex-col justify-center rounded-3xl bg-white dark:bg-neutral-900 p-8 shadow-sm dark:border dark:border-neutral-800 md:col-span-3 md:p-10">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff4d00] text-white">
              <Dumbbell size={18} />
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              Pro<span className="text-[#ff4d00]">Evolua</span>
            </span>
          </div>

          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Bem-vindo de volta
            <span className="block text-base font-normal text-neutral-400">
              Entre com a sua conta de professor
            </span>
          </h2>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-2xl bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-600 dark:text-neutral-300">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  required
                  className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 py-3 pl-11 pr-4 text-base outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0] dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-600 dark:text-neutral-300">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 py-3 pl-11 pr-12 text-base outline-none ring-2 ring-transparent transition focus:ring-[#7c6cf0] dark:text-white"
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

            <button
              type="submit"
              className="mt-2 rounded-2xl bg-[#7c6cf0] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#6a59e6]"
            >
              Entrar
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            ou
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <div className="flex flex-col gap-3">
            {!googleEnabled && import.meta.env.DEV && (
              <p className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-center text-xs text-amber-700 dark:text-amber-300">
                Login com Google desativado: o <strong>VITE_GOOGLE_CLIENT_ID</strong> não foi lido.
              </p>
            )}

            {googleEnabled && (
              <div className="flex justify-center overflow-hidden">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Não foi possível entrar com o Google.")}
                  theme="outline"
                  size="large"
                  shape="pill"
                  text="continue_with"
                  locale="pt-BR"
                  width="300"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-5 py-3.5 text-base font-semibold text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              Criar cadastro de professor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  if (!GOOGLE_CLIENT_ID) return <LoginContent googleEnabled={false} />;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginContent googleEnabled />
    </GoogleOAuthProvider>
  );
}