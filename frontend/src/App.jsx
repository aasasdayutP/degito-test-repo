import { useEffect, useState } from "react";
import { getProjects, getClients, createProject, updateStatus } from "./api";

const STATUS_OPTIONS = ["planning", "in_progress", "completed"];

export default function App() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [newProject, setNewProject] = useState({ name: "", client_id: "" });
  const [error, setError] = useState("");
  const [searchClient, setSearchClient] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setError("");
        await fetchProjects(searchClient);
      } catch (err) {
        setError(err.message);
      }
    }, 150);
      
    return () => clearTimeout(timer);

  }, [searchClient]);

  async function fetchProjects(clientName = "") {
    const data = await getProjects(clientName);
    setProjects(data);
  }

  function fetchClients() {
    getClients().then(setClients);
  }

  async function handleStatusChange(projectId, newStatus) {
    await updateStatus(projectId, newStatus);
    fetchProjects();
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      setError("");

      await createProject({
        name: newProject.name,
        client_id: Number(newProject.client_id),
      });
      setNewProject({ name: "", client_id: "" });
      fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();

    try {
      setError("");
      await fetchProjects(searchClient);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Client Project Tracker</h1>
        <p>Internal tool for tracking active client projects.</p>
      </header>

      <section className="new-project">
        <h2>Add Project</h2>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Project name"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            required
          />
          <select
            value={newProject.client_id}
            onChange={(e) =>
              setNewProject({ ...newProject, client_id: e.target.value })
            }
            required
          >
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit">Add</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </section>

      <section className="project-list">
        <div className="project-list-header">
          <h2>Projects</h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by client name"
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>
        <table >
          <thead>
            <tr>
              <th>Project</th>
              <th>Client</th>
              <th>Status</th>
              <th>          </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.client_name}</td>
                <td>
                  <span className="status-badge">{p.status}</span>
                </td> 
                <td>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleStatusChange(p.id, e.target.value);
                      }
                      e.target.value = "";
                    }}
                  >
                    <option value="">Change status…</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
