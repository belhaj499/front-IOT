import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

function toPoint(m) {
  return {
    time: m.timestamp ? new Date(m.timestamp).toLocaleString() : "",
    temperature: m.temperature,
    humidity: m.humidity,
  };
}

export default function Dashboard() {
  const [latest, setLatest] = useState(null);
  const [all, setAll] = useState([]);

  async function load() {
    const [l, list] = await Promise.all([
      api.get("/measurements/latest"),
      api.get("/measurements"),
    ]);

    setLatest(l.data);
    setAll(list.data || []);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const chartData = useMemo(() => {
    return (all || []).slice(-30).map(toPoint);
  }, [all]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="font-semibold mb-2">Dernière mesure</h3>
          {latest ? (
            <div className="text-sm space-y-1">
              <div>Température: <b>{latest.temperature}</b> °C</div>
              <div>Humidité: <b>{latest.humidity}</b> %</div>
              <div className="text-gray-500 break-all">Timestamp: {latest.timestamp}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Aucune mesure</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:col-span-2">
          <h3 className="font-semibold mb-2">Courbe (derniers points)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="temperature" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            (Affichage simple, derniers 30 points)
          </p>
        </div>
      </div>
    </div>
  );
}
