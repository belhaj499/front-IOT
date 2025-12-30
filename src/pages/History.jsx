import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function History() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/api/measurements").then((r) => setList(r.data || []));
  }, []);

  const rows = (list || []).slice().reverse();

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Historique des mesures</h2>

      <div className="bg-white rounded-2xl shadow p-4 overflow-auto">
        <table className="min-w-[780px] w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">ID</th>
              <th>Temp (°C)</th>
              <th>Hum (%)</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-b">
                <td className="py-2">{m.id}</td>
                <td>{m.temperature}</td>
                <td>{m.humidity}</td>
                <td className="text-gray-600 break-all">{m.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
