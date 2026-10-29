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
} from "lucide-react";

export default function PendingReviews() {
  const navigate = useNavigate();
  const professorId = localStorage.getItem("professor_id") || 5;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingStudents();
  }, []);

  const loadPendingStudents = async () => {
    try {
      const res = await api.get(`/professors/${professorId}/students`);
      const allStudents = res.data;

      const targetDaysAgo = new Date();
      targetDaysAgo.setDate(targetDaysAgo.getDate() - 25);

      const pending = allStudents.filter((s) => {
        // Se não tem nenhuma data de avaliação registrada, entra na lista
        if (!s.last_assessment_date) return true;

        // Converte a data da última avaliação e compara com o limite de 25 dias
        const lastAssessment = new Date(s.last_assessment_date);
        return lastAssessment < targetDaysAgo;
      });

      setStudents(pending);
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
      <div className="flex min-h-screen items-center justify-center bg-[#ececec] text-neutral-500 font-sans">
        Carregando lista de reavaliações...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ececec] p-4 font-sans text-neutral-900 md:p-8">
      <div className="mx-auto max-w-5xl">
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

        {/* Cabeçalho da página */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7c6cf0]/10 text-[#7c6cf0]">
              <AlertCircle size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Alunos para Reavaliação</h2>
              <p className="text-sm text-neutral-500">
                Lista de alunos com mais de 25 dias sem nova avaliação física registrada ({students.length})
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Alunos */}
        {students.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <p className="text-neutral-400 text-base">Nenhum aluno pendente de reavaliação no momento!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e9e6ff] text-lg font-semibold text-[#5b4de0]">
                    {initials(student.name)}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{student.name}</h3>
                      <span className="rounded-full bg-neutral-100 px-3 py-0.5 text-xs font-semibold text-[#5b4de0]">
                        {formatId(student.id)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
                        <Mail size={13} className="text-neutral-400" /> {student.email || "Não informado"}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
                        <Phone size={13} className="text-neutral-400" /> {student.phone || "Não informado"}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
                        <Calendar size={13} className="text-neutral-400" /> {student.age ? `${student.age} anos` : "-"}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#fdf1c7] px-3 py-1.5 font-medium text-amber-700">
                        <Target size={13} /> {student.goal || "Objetivo não definido"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t pt-4 md:border-t-0 md:pt-0">
                  <button
                    onClick={() => navigate(`/students/${student.id}/profile`)}
                    className="flex items-center gap-2 rounded-full bg-[#7c6cf0] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#6a59e6]"
                  >
                    <User size={14} /> Perfil
                  </button>

                  <button
                    onClick={() => navigate(`/workouts/${student.id}`)}
                    className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                  >
                    <Dumbbell size={14} /> Gerenciar treinos
                  </button>

                  <button
                    onClick={() => navigate(`/students`, { state: { editStudent: student } })}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdf1c7] text-amber-700 transition hover:bg-amber-200"
                    title="Editar aluno"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(student.id, student.name)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
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