import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Tickets() {
  const [list, setList] = useState([]);
  const [description, setDescription] = useState("");

  async function load() {
    const r = await api.get("/api/tickets");
    setList(r.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    await api.post("/api/tickets", { description });
    setDescription("");
    load();
  }

  async function close(id) {
    await api.put(`/api/tickets/${id}/close`);
    load();
  }

  const rows = (list || []).slice().reverse();

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Tickets</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <form onSubmit={create} className="bg-white rounded-2xl shadow p-4">
          <h3 className="font-semibold mb-2">Créer un ticket</h3>
          <textarea
            className="w-full border rounded-xl p-2 h-28"
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="mt-3 rounded-xl bg-black text-white px-4 py-2">
            Créer
          </button>
        </form>

        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="font-semibold mb-2">Liste</h3>
          <div className="space-y-2">
            {rows.map((t) => (
              <div key={t.id} className="border rounded-xl p-3">
                <div className="text-xs text-gray-500">
                  #{t.id} — {t.status} — {t.createdAt}
                </div>
                <div className="mt-1">{t.description}</div>
                {t.status !== "CLOSED" && (
                  <button
                    onClick={() => close(t.id)}
                    className="mt-2 text-sm underline"
                  >
                    Clôturer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
