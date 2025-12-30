import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import History from "./pages/History.jsx";
import Tickets from "./pages/Tickets.jsx";
import Audit from "./pages/Audit.jsx";
import { setToken } from "./lib/api.js";

function isAuthed() {
  return !!localStorage.getItem("token");
}

function PrivateRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

function TopBar() {
  if (!isAuthed()) return null;
  return (
    <div className="w-full bg-white border-b">
      <div className="max-w-5xl mx-auto p-3 flex items-center justify-between text-sm">
        <div className="flex gap-3">
          <Link className="underline" to="/">Dashboard</Link>
          <Link className="underline" to="/history">Historique</Link>
          <Link className="underline" to="/tickets">Tickets</Link>
          <Link className="underline" to="/audit">Audit</Link>
          <a className="underline" href="http://localhost:8080/api/measurements/export/csv" target="_blank" rel="noreferrer">
            Export CSV
          </a>
        </div>
        <button
          className="underline"
          onClick={() => {
            setToken(null);
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/tickets" element={<PrivateRoute><Tickets /></PrivateRoute>} />
        <Route path="/audit" element={<PrivateRoute><Audit /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
