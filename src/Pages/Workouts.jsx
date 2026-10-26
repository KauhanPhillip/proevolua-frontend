import { useState, useEffect } from "react";
import api from "../services/api";
import { useParams, useNavigate } from "react-router-dom";

export default function Workouts() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Lista temporária de exercícios para adicionar na ficha
  const [exercises, setExercises] = useState([]);
  const [exName, setExName] = useState("");
  const [exSets, setExSets] = useState("");
  const [exReps, setExReps] = useState("");
  const [exRest, setExRest] = useState("");
  const [exNotes, setExNotes] = useState("");

  useEffect(() => {
    loadWorkouts();
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
    };

    setExercises([...exercises, newEx]);
    // Limpar campos do exercício
    setExName("");
    setExSets("");
    setExReps("");
    setExRest("");
    setExNotes("");
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
        student_id: studentId,
        exercises,
      });

      setTitle("");
      setDescription("");
      setExercises([]);
      loadWorkouts();
      alert("Ficha de treino criada com sucesso!");
    } catch (err) {
      console.error("Erro ao criar ficha:", err);
      alert("Erro ao criar ficha de treino.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Gestão de Treinos do Aluno</h2>
      <button onClick={() => navigate("/students")} style={styles.backButton}>
        Voltar aos Alunos
      </button>

      {/* Formulário para Criar Ficha */}
      <form onSubmit={handleCreateWorkout} style={styles.form}>
        <h3>Nova Ficha de Treino</h3>
        <input
          type="text"
          placeholder="Título (Ex: Treino A - Hipertrofia)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Descrição (Ex: Foco em Membros Superiores)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.input}
        />

        <div style={styles.exerciseBox}>
          <h4>Adicionar Exercício à Ficha</h4>
          <input
            type="text"
            placeholder="Nome do Exercício (Ex: Supino Reto)"
            value={exName}
            onChange={(e) => setExName(e.target.value)}
            style={styles.input}
          />
          <div style={styles.row}>
            <input
              type="number"
              placeholder="Séries (Ex: 4)"
              value={exSets}
              onChange={(e) => setExSets(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Repetições (Ex: 10-12)"
              value={exReps}
              onChange={(e) => setExReps(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.row}>
            <input
              type="text"
              placeholder="Descanso (Ex: 60s)"
              value={exRest}
              onChange={(e) => setExRest(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Notas (Ex: Carga progressiva)"
              value={exNotes}
              onChange={(e) => setExNotes(e.target.value)}
              style={styles.input}
            />
          </div>
          <button type="button" onClick={handleAddExerciseToState} style={styles.subButton}>
            + Adicionar Exercício à Lista
          </button>
        </div>

        {/* Lista temporária dos exercícios adicionados */}
        {exercises.length > 0 && (
          <div style={styles.tempList}>
            <p><strong>Exercícios na Ficha ({exercises.length}):</strong></p>
            <ul>
              {exercises.map((ex, idx) => (
                <li key={idx}>
                  {ex.name} - {ex.sets}x{ex.reps} (Descanso: {ex.rest_time || "N/A"})
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" style={styles.button}>Salvar Ficha Completa</button>
      </form>

      {/* Listar Fichas Existentes */}
      <div style={styles.listContainer}>
        <h3>Fichas Cadastradas</h3>
        {workouts.length === 0 ? (
          <p>Nenhuma ficha de treino cadastrada para este aluno.</p>
        ) : (
          workouts.map((w) => (
            <div key={w.id} style={styles.card}>
              <h4>{w.title}</h4>
              <p>{w.description}</p>
              <ul>
                {w.exercises?.map((ex) => (
                  <li key={ex.id}>
                    <strong>{ex.name}</strong>: {ex.sets} séries x {ex.reps} reps | Descanso: {ex.rest_time || "-"}
                    {ex.notes && <span style={{display: "block", fontSize: "12px", color: "#aaa"}}>Obs: {ex.notes}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "30px", backgroundColor: "#121212", color: "#fff", minHeight: "100vh" },
  form: { backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px", marginBottom: "30px", display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" },
  input: { padding: "10px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#2a2a2a", color: "#fff", width: "100%" },
  row: { display: "flex", gap: "10px" },
  button: { padding: "12px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" },
  subButton: { padding: "8px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  backButton: { padding: "8px 16px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "20px" },
  exerciseBox: { border: "1px dashed #444", padding: "15px", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#181818" },
  tempList: { backgroundColor: "#252525", padding: "10px", borderRadius: "4px", fontSize: "14px" },
  listContainer: { display: "flex", flexDirection: "column", gap: "15px", maxWidth: "500px" },
  card: { backgroundColor: "#1e1e1e", padding: "15px", borderRadius: "8px", border: "1px solid #333" }
};