import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>ProEvolua - Painel do Professor</h2>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Sair
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.welcomeCard}>
          <h3>Bem-vindo ao ProEvolua!</h3>
          <p>Aqui podes gerir os teus alunos, montar treinos e acompanhar a evolução física.</p>
        </div>

        <div style={styles.grid}>
          {/* AQUI ESTÁ A MUDANÇA: Agora redireciona para /students */}
          <div style={styles.cardOption} onClick={() => navigate("/students")}>
            <h4>Gerir Alunos</h4>
            <p>Cadastrar e listar alunos</p>
          </div>

          <div style={styles.cardOption} onClick={() => alert("Módulo de Treinos em breve!")}>
            <h4>Fichas de Treino</h4>
            <p>Criar rotinas de exercícios</p>
          </div>

          <div style={styles.cardOption} onClick={() => alert("Módulo de Avaliação em breve!")}>
            <h4>Avaliação Física</h4>
            <p>Medidas e dobras cutâneas</p>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#121212",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    backgroundColor: "#1e1e1e",
    borderBottom: "1px solid #333",
  },
  logoutButton: {
    padding: "8px 16px",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  main: {
    padding: "40px",
    maxWidth: "1000px",
    margin: "0 auto",
    width: "100%",
  },
  welcomeCard: {
    backgroundColor: "#1e1e1e",
    padding: "25px",
    borderRadius: "8px",
    marginBottom: "30px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  cardOption: {
    backgroundColor: "#1e1e1e",
    padding: "25px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "1px solid #333",
    transition: "0.2s",
    textAlign: "center",
  },
};