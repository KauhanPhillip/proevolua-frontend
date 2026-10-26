import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    age: "",
    phone: "",
    cref: "",
    specialty: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
        age: parseInt(formData.age, 10),
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
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>ProEvolua - Cadastro do Professor</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <div style={styles.inputGroup}>
          <label>Nome Completo:</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Senha:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <label>Idade:</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ ...styles.inputGroup, flex: 2, marginLeft: "10px" }}>
            <label>Telefone / WhatsApp:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <label>CREF:</label>
            <input
              type="text"
              name="cref"
              placeholder="Ex: 000000-G/UF"
              value={formData.cref}
              onChange={handleChange}
            />
          </div>

          <div style={{ ...styles.inputGroup, flex: 1, marginLeft: "10px" }}>
            <label>Especialidade:</label>
            <input
              type="text"
              name="specialty"
              placeholder="Ex: Musculação"
              value={formData.specialty}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" style={styles.button}>
          Finalizar Cadastro
        </button>

        <p style={styles.footerText}>
          Já possui conta? <Link to="/" style={styles.link}>Faça login aqui</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#121212",
    color: "#fff",
    padding: "20px",
  },
  card: {
    backgroundColor: "#1e1e1e",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    textAlign: "left",
  },
  row: {
    display: "flex",
  },
  button: {
    padding: "12px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
    fontSize: "15px",
  },
  error: { color: "#ff4d4d", fontSize: "14px" },
  success: { color: "#4dff88", fontSize: "14px" },
  footerText: { marginTop: "10px", fontSize: "14px", textAlign: "center" },
  link: { color: "#007bff", textDecoration: "none" },
};