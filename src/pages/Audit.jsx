import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Audit() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/api/auditlogs").then((r) => setList(r.data || []));
  }, []);

  const rows = (list || []).slice().reverse();

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Audit log</h2>

      <div className="bg-white rounded-2xl shadow p-4">
        <ul className="text-sm space-y-2">
          {rows.map((a) => (
            <li key={a.id} className="border rounded-xl p-2">
              <div className="text-gray-500 break-all">{a.date}</div>
              <div>{a.action}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
