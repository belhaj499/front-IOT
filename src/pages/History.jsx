import { useEffect, useState, useMemo } from "react";
import { api } from "../lib/api.js";

const TEMP_MIN = 2;
const TEMP_MAX = 8;

const ThermometerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-2.21 0-4-1.79-4-4 0-1.48.81-2.77 2-3.46V5c0-1.1.9-2 2-2s2 .9 2 2v6.54c1.19.69 2 1.98 2 3.46 0 2.21-1.79 4-4 4z" />
  </svg>
);

const DropletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-3.582-8-8 0-4.418 8-12 8-12s8 7.582 8 12c0 4.418-3.582 8-8 8z" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

function getTemperatureStatus(temp) {
  if (temp === null || temp === undefined) return { status: "unknown", label: "N/A" };
  if (temp < TEMP_MIN) return { status: "cold", label: "Too Cold" };
  if (temp > TEMP_MAX) return { status: "hot", label: "Too Hot" };
  return { status: "normal", label: "Normal" };
}

function StatusBadge({ status }) {
  const styles = {
    normal: "bg-green-100 text-green-700",
    cold: "bg-blue-100 text-blue-700",
    hot: "bg-red-100 text-red-700",
    unknown: "bg-gray-100 text-gray-600",
  };
  
  const icons = {
    normal: <CheckIcon />,
    cold: <AlertIcon />,
    hot: <AlertIcon />,
    unknown: null,
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.unknown}`}>
      {icons[status]}
      {status === "normal" ? "OK" : status === "cold" ? "Cold" : status === "hot" ? "Hot" : "N/A"}
    </span>
  );
}

export default function History() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const itemsPerPage = 15;

  useEffect(() => {
    setLoading(true);
    api.get("/measurements")
      .then((r) => setList(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    let rows = (list || []).slice().reverse();
    
    if (filter !== "all") {
      rows = rows.filter(m => {
        const status = getTemperatureStatus(m.temperature).status;
        if (filter === "alerts") return status === "cold" || status === "hot";
        return status === filter;
      });
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      rows = rows.filter(m => 
        m.id?.toString().includes(searchLower) ||
        m.temperature?.toString().includes(searchLower) ||
        m.humidity?.toString().includes(searchLower) ||
        m.timestamp?.toLowerCase().includes(searchLower)
      );
    }
    
    return rows;
  }, [list, search, filter]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    const all = list || [];
    const alerts = all.filter(m => {
      const status = getTemperatureStatus(m.temperature).status;
      return status === "cold" || status === "hot";
    });
    return {
      total: all.length,
      alerts: alerts.length,
      normal: all.length - alerts.length,
    };
  }, [list]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Measurement History</h1>
          <p className="text-gray-500 mt-1">View all recorded temperature and humidity data</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <ThermometerIcon />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Readings</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
            <CheckIcon />
          </div>
          <div>
            <p className="text-sm text-gray-500">Normal Readings</p>
            <p className="text-2xl font-bold text-green-600">{stats.normal}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <AlertIcon />
          </div>
          <div>
            <p className="text-sm text-gray-500">Alert Readings</p>
            <p className="text-2xl font-bold text-red-600">{stats.alerts}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search by ID, temperature, humidity, or timestamp..."
              className="input pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "all", label: "All" },
              { value: "normal", label: "Normal" },
              { value: "alerts", label: "Alerts" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setFilter(f.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Temperature</th>
                <th>Humidity</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No measurements found
                  </td>
                </tr>
              ) : (
                paginatedRows.map((m) => {
                  const tempStatus = getTemperatureStatus(m.temperature);
                  return (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="font-medium text-gray-900">#{m.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${
                            tempStatus.status === "cold" ? "text-blue-600" :
                            tempStatus.status === "hot" ? "text-red-600" :
                            "text-gray-900"
                          }`}>
                            {m.temperature?.toFixed(2)}°C
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <DropletIcon />
                          <span className="text-cyan-600 font-medium">{m.humidity?.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={tempStatus.status} />
                      </td>
                      <td className="text-gray-500 text-sm">
                        {m.timestamp ? new Date(m.timestamp).toLocaleString("fr-FR") : "N/A"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
