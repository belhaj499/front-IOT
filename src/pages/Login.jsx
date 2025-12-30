import { useState } from "react";
import { api, setToken } from "../lib/api.js";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      // ⚠️ IMPORTANT : /login (PAS /api/login)
      const res = await api.post("/login", {
        username,
        password,
      });

      // Sauvegarde du token
      setToken(res.data.token);

      // Redirection après login
      navigate("/dashboard");
    } catch (err) {
      setError("Identifiants invalides");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white rounded-2xl shadow p-6"
      >
        <h1 className="text-2xl font-semibold mb-4">
          Cold Chain Monitoring
        </h1>
        <p className="text-sm text-gray-600 mb-4">Connexion</p>

        {error && (
          <div className="mb-3 text-sm text-red-600">{error}</div>
        )}

        <label className="block text-sm mb-1">Username</label>
        <input
          className="w-full border rounded-xl p-2 mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          className="w-full border rounded-xl p-2 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full rounded-xl p-2 bg-black text-white"
        >
          Se connecter
        </button>

        <div className="text-xs text-gray-500 mt-4 space-y-1">
          <div>Comptes test :</div>
          <div>- admin / admin123</div>
          <div>- user1 / user123</div>
        </div>
      </form>
    </div>
  );
}
