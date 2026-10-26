import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState("");
  const navigate = useNavigate();

  // ID do professor para testes (depois pegamos do login)
  const professorId = "5"; 

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await api.get(`/professors/${professorId}/students`);
      setStudents(response.data);
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post("/students", {
        name,
        email,
        age: age ? parseInt(age) : null,
        goal,
        professor_id: professorId,
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

  return (
    <div style={styles.container}>
      <h2>Gestão de Alunos</h2>
      <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
        Voltar ao Dashboard
      </button>

      <form onSubmit={handleAddStudent} style={styles.form}>
        <h3>Cadastrar Novo Aluno</h3>
        <input
          type="text"
          placeholder="Nome do Aluno"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Idade"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Objetivo (Ex: Hipertrofia)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Adicionar Aluno</button>
      </form>

      <div style={styles.listContainer}>
        <h3>Meus Alunos</h3>
        {students.length === 0 ? (
          <p>Nenhum aluno cadastrado ainda.</p>
        ) : (
          students.map((student) => (
            <div key={student.id} style={styles.card}>
              <h4>{student.name}</h4>
              <p>Email: {student.email || "Não informado"}</p>
              <p>Idade: {student.age || "N/A"} anos</p>
              <p>Objetivo: {student.goal || "Não definido"}</p>
              
              {/* Botão para entrar na gestão de treinos do aluno */}
              <button 
                onClick={() => navigate(`/students/${student.id}/workouts`)} 
                style={styles.workoutButton}
              >
                Ver / Criar Treinos
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "30px", backgroundColor: "#121212", color: "#fff", minHeight: "100vh" },
  form: { backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px", marginBottom: "30px", display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" },
  input: { padding: "10px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#2a2a2a", color: "#fff" },
  button: { padding: "10px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" },
  workoutButton: { padding: "8px 12px", backgroundColor: "#17a2b8", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" },
  backButton: { padding: "8px 16px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "20px" },
  listContainer: { display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" },
  card: { backgroundColor: "#1e1e1e", padding: "15px", borderRadius: "8px", border: "1px solid #333" }
};