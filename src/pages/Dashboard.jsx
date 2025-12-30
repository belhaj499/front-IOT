import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// Temperature thresholds for cold chain
const TEMP_MIN = 2;
const TEMP_MAX = 8;

// Icons as SVG components
const ThermometerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-2.21 0-4-1.79-4-4 0-1.48.81-2.77 2-3.46V5c0-1.1.9-2 2-2s2 .9 2 2v6.54c1.19.69 2 1.98 2 3.46 0 2.21-1.79 4-4 4z" />
    <circle cx="9" cy="15" r="1.5" fill="currentColor" />
  </svg>
);

const DropletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-3.582-8-8 0-4.418 8-12 8-12s8 7.582 8 12c0 4.418-3.582 8-8 8z" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

function toPoint(m) {
  const date = m.timestamp ? new Date(m.timestamp) : new Date();
  return {
    time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    fullTime: date.toLocaleString("fr-FR"),
    temperature: m.temperature,
    humidity: m.humidity,
  };
}

function getTemperatureStatus(temp) {
  if (temp === null || temp === undefined) return { status: "unknown", label: "N/A", color: "gray" };
  if (temp < TEMP_MIN) return { status: "danger", label: "Too Cold", color: "blue" };
  if (temp > TEMP_MAX) return { status: "danger", label: "Too Hot", color: "red" };
  return { status: "normal", label: "Normal", color: "green" };
}

function StatCard({ title, value, unit, icon, gradient, status, subtitle }) {
  const isDanger = status === "danger";
  
  return (
    <div className={`card p-6 relative overflow-hidden ${isDanger ? "ring-2 ring-red-400" : ""}`}>
      {isDanger && (
        <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6">
          <div className="w-full h-full rounded-full bg-red-100 pulse-danger opacity-50"></div>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {value !== null && value !== undefined ? value.toFixed(1) : "--"}
            </span>
            <span className="text-lg text-gray-500">{unit}</span>
          </div>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`stat-icon ${gradient}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, label }) {
  const styles = {
    normal: "badge-success",
    danger: "badge-danger",
    warning: "badge-warning",
    unknown: "bg-gray-100 text-gray-600",
  };
  
  return (
    <span className={`badge ${styles[status] || styles.unknown}`}>
      {status === "normal" ? <CheckIcon /> : status === "danger" ? <AlertIcon /> : null}
      <span className="ml-1">{label}</span>
    </span>
  );
}

function AlertBanner({ temperature }) {
  const tempStatus = getTemperatureStatus(temperature);
  
  if (tempStatus.status !== "danger") return null;
  
  const isCold = temperature < TEMP_MIN;
  
  return (
    <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${isCold ? "bg-blue-50 border border-blue-200" : "bg-red-50 border border-red-200"}`}>
      <div className={`p-2 rounded-lg ${isCold ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}>
        <AlertIcon />
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold ${isCold ? "text-blue-800" : "text-red-800"}`}>
          Temperature Alert!
        </h4>
        <p className={`text-sm ${isCold ? "text-blue-600" : "text-red-600"}`}>
          {isCold 
            ? `Temperature is below ${TEMP_MIN}°C. Risk of freezing damage.`
            : `Temperature is above ${TEMP_MAX}°C. Cold chain integrity at risk.`
          }
        </p>
      </div>
      <div className={`text-2xl font-bold ${isCold ? "text-blue-600" : "text-red-600"}`}>
        {temperature?.toFixed(1)}°C
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
      <p className="text-xs text-gray-500 mb-2">{payload[0]?.payload?.fullTime || label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold">{entry.value?.toFixed(1)}{entry.name === "Temperature" ? "°C" : "%"}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [latest, setLatest] = useState(null);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  async function load() {
    try {
      const [l, list] = await Promise.all([
        api.get("/measurements/latest"),
        api.get("/measurements"),
      ]);

      setLatest(l.data);
      setAll(list.data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to load measurements:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const chartData = useMemo(() => {
    return (all || []).slice(-50).map(toPoint);
  }, [all]);

  const tempStatus = getTemperatureStatus(latest?.temperature);

  const stats = useMemo(() => {
    if (!all || all.length === 0) return null;
    const temps = all.map(m => m.temperature).filter(t => t !== null && t !== undefined);
    const humids = all.map(m => m.humidity).filter(h => h !== null && h !== undefined);
    
    return {
      avgTemp: temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null,
      minTemp: temps.length ? Math.min(...temps) : null,
      maxTemp: temps.length ? Math.max(...temps) : null,
      avgHumidity: humids.length ? humids.reduce((a, b) => a + b, 0) / humids.length : null,
      totalReadings: all.length,
    };
  }, [all]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cold Chain Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time temperature and humidity monitoring</p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <StatusBadge status={tempStatus.status} label={tempStatus.label} />
          {lastUpdate && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <ClockIcon />
              Updated {lastUpdate.toLocaleTimeString("fr-FR")}
            </span>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      <AlertBanner temperature={latest?.temperature} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Temperature"
          value={latest?.temperature}
          unit="°C"
          icon={<ThermometerIcon />}
          gradient={tempStatus.status === "danger" ? "gradient-red" : "gradient-blue"}
          status={tempStatus.status}
          subtitle={`Safe range: ${TEMP_MIN}°C - ${TEMP_MAX}°C`}
        />
        <StatCard
          title="Humidity"
          value={latest?.humidity}
          unit="%"
          icon={<DropletIcon />}
          gradient="gradient-cyan"
          subtitle="Relative humidity"
        />
        <StatCard
          title="Avg Temperature"
          value={stats?.avgTemp}
          unit="°C"
          icon={<ActivityIcon />}
          gradient="gradient-green"
          subtitle={`Min: ${stats?.minTemp?.toFixed(1) || "--"}°C / Max: ${stats?.maxTemp?.toFixed(1) || "--"}°C`}
        />
        <StatCard
          title="Total Readings"
          value={stats?.totalReadings}
          unit=""
          icon={<ClockIcon />}
          gradient="gradient-orange"
          subtitle="All time measurements"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Temperature Chart */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Temperature Over Time</h3>
            <span className="badge badge-info">Last 50 readings</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `${value}°C`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#tempGradient)"
                  dot={false}
                  activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                />
                {/* Reference lines for safe zone */}
                <Line
                  type="monotone"
                  dataKey={() => TEMP_MIN}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                  name={`Min (${TEMP_MIN}°C)`}
                />
                <Line
                  type="monotone"
                  dataKey={() => TEMP_MAX}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                  name={`Max (${TEMP_MAX}°C)`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-red-500" style={{ borderStyle: "dashed" }}></span>
              Safe zone limits ({TEMP_MIN}°C - {TEMP_MAX}°C)
            </span>
          </div>
        </div>

        {/* Humidity Chart */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Humidity Over Time</h3>
            <span className="badge badge-info">Last 50 readings</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="humidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#humidGradient)"
                  dot={false}
                  activeDot={{ r: 6, fill: "#06b6d4", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Latest Measurement Details */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Latest Measurement Details</h3>
          {latest?.timestamp && (
            <span className="text-sm text-gray-500">
              {new Date(latest.timestamp).toLocaleString("fr-FR")}
            </span>
          )}
        </div>
        {latest ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Temperature</p>
              <p className={`text-2xl font-bold ${
                tempStatus.status === "danger" 
                  ? (latest.temperature < TEMP_MIN ? "text-blue-600" : "text-red-600")
                  : "text-green-600"
              }`}>
                {latest.temperature?.toFixed(2)}°C
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Humidity</p>
              <p className="text-2xl font-bold text-cyan-600">
                {latest.humidity?.toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={tempStatus.status} label={tempStatus.label} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No measurements available</p>
          </div>
        )}
      </div>
    </div>
  );
}
