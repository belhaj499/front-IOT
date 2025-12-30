import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function StatusBadge({ status }) {
  const styles = {
    OPEN: "bg-yellow-100 text-yellow-700 border-yellow-200",
    CLOSED: "bg-green-100 text-green-700 border-green-200",
    PENDING: "bg-blue-100 text-blue-700 border-blue-200",
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {status === "CLOSED" ? <CheckCircleIcon /> : <ClockIcon />}
      {status}
    </span>
  );
}

export default function Tickets() {
  const [list, setList] = useState([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("all");

  async function load() {
    try {
      const r = await api.get("/tickets");
      setList(r.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    if (!description.trim()) return;
    
    setCreating(true);
    try {
      await api.post("/tickets", { description });
      setDescription("");
      load();
    } finally {
      setCreating(false);
    }
  }

  async function close(id) {
    await api.put(`/tickets/${id}/close`);
    load();
  }

  const filteredRows = (list || [])
    .slice()
    .reverse()
    .filter(t => {
      if (filter === "all") return true;
      if (filter === "open") return t.status !== "CLOSED";
      if (filter === "closed") return t.status === "CLOSED";
      return true;
    });

  const stats = {
    total: list.length,
    open: list.filter(t => t.status !== "CLOSED").length,
    closed: list.filter(t => t.status === "CLOSED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 mt-1">Manage and track support requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <TicketIcon />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Tickets</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
            <ClockIcon />
          </div>
          <div>
            <p className="text-sm text-gray-500">Open</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircleIcon />
          </div>
          <div>
            <p className="text-sm text-gray-500">Closed</p>
            <p className="text-2xl font-bold text-green-600">{stats.closed}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create Ticket Form */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PlusIcon />
              Create New Ticket
            </h3>
            <form onSubmit={create}>
              <textarea
                className="input h-32 resize-none mb-4"
                placeholder="Describe the issue or request..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <button 
                type="submit"
                disabled={creating || !description.trim()}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <>
                    <PlusIcon />
                    Create Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Tickets List */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Ticket List</h3>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "open", label: "Open" },
                  { value: "closed", label: "Closed" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
            
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredRows.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <TicketIcon />
                  <p className="mt-2">No tickets found</p>
                </div>
              ) : (
                filteredRows.map((t) => (
                  <div key={t.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">#{t.id}</span>
                          <StatusBadge status={t.status} />
                        </div>
                        <p className="text-gray-700 mb-2">{t.description}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <ClockIcon />
                          {t.createdAt ? new Date(t.createdAt).toLocaleString("fr-FR") : "N/A"}
                        </p>
                      </div>
                      {t.status !== "CLOSED" && (
                        <button
                          onClick={() => close(t.id)}
                          className="btn btn-success text-sm py-1.5 px-3"
                        >
                          <CheckCircleIcon />
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
