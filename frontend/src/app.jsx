
import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState("");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    course: "",
    age: ""
  });
  const [message, setMessage] = useState("");

  const API = "http://localhost:5000/api";

  async function authenticate(e) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${API}/auth/${page === "register" ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user,
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Authentication failed");
      }

      const jwt = data.token || data.accessToken;
      if (!jwt) {
        throw new Error("No token returned. Check your backend response.");
      }

      setToken(jwt);
      setUser(data.user?.name || user);
      setPage("dashboard");
      setPassword("");
      await loadStudents(jwt);
    } catch (error) {
      setMessage(error.message || "Could not connect to the backend.");
    }
  }

  async function loadStudents(jwt = token) {
    try {
      const response = await fetch(`${API}/students`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load students");
      }

      setStudents(Array.isArray(data) ? data : data.students || []);
    } catch (error) {
      setMessage(error.message || "Could not load students.");
    }
  }

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function saveStudent(e) {
    e.preventDefault();
    setMessage("");

    try {
      const url = editingId
        ? `${API}/students/${editingId}`
        : `${API}/students`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...form, age: Number(form.age) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Could not save student");
      }

      setForm({ name: "", email: "", course: "", age: "" });
      setEditingId(null);
      setMessage(editingId ? "Student updated successfully." : "Student added successfully.");
      await loadStudents();
    } catch (error) {
      setMessage(error.message || "Could not save student.");
    }
  }

  function editStudent(student) {
    setForm({
      name: student.name || "",
      email: student.email || "",
      course: student.course || "",
      age: student.age ?? ""
    });
    setEditingId(student._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteStudent(id) {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const response = await fetch(`${API}/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Could not delete student");
      }

      setMessage("Student deleted successfully.");
      await loadStudents();
    } catch (error) {
      setMessage(error.message || "Could not delete student.");
    }
  }

  function logout() {
    setToken("");
    setStudents([]);
    setEmail("");
    setPassword("");
    setPage("login");
    setMessage("");
  }

  if (page !== "dashboard") {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand-icon">🎓</div>
          <h1>Student Management</h1>
          <p className="subtitle">Manage student records in one place</p>

          <div className="auth-tabs">
            <button
              className={page === "login" ? "active" : ""}
              onClick={() => { setPage("login"); setMessage(""); }}
            >
              Login
            </button>
            <button
              className={page === "register" ? "active" : ""}
              onClick={() => { setPage("register"); setMessage(""); }}
            >
              Register
            </button>
          </div>

          <form onSubmit={authenticate}>
            {page === "register" && (
              <label>
                Full Name
                <input
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </label>
            )}

            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={6}
                required
              />
            </label>

            {message && <p className="message">{message}</p>}

            <button className="primary-btn" type="submit">
              {page === "register" ? "Create Account" : "Login to Dashboard"}
            </button>
          </form>
          <p className="footer-note">Secure student record management</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon small">🎓</span>
          <div>
            <h2>Student Management</h2>
            <p>Administration Dashboard</p>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Welcome{user ? `, ${user}` : ""}!</h1>
          <p>Manage your student records efficiently.</p>
        </div>
        <div className="stat-card">
          <span>Total Students</span>
          <strong>{students.length}</strong>
        </div>
      </section>

      {message && <p className="notice">{message}</p>}

      <section className="panel">
        <h2>{editingId ? "Edit Student" : "Add New Student"}</h2>
        <form className="student-form" onSubmit={saveStudent}>
          <label>
            Student Name
            <input name="name" value={form.name} onChange={updateField} placeholder="Full name" required />
          </label>
          <label>
            Student Email
            <input name="email" type="email" value={form.email} onChange={updateField} placeholder="student@example.com" required />
          </label>
          <label>
            Course
            <input name="course" value={form.course} onChange={updateField} placeholder="e.g. Computer Science" required />
          </label>
          <label>
            Age
            <input name="age" type="number" min="1" max="120" value={form.age} onChange={updateField} placeholder="Age" required />
          </label>
          <div className="form-actions">
            <button className="primary-btn" type="submit">
              {editingId ? "Update Student" : "Add Student"}
            </button>
            {editingId && (
              <button
                className="cancel-btn"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", email: "", course: "", age: "" });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="table-heading">
          <div>
            <h2>Student Records</h2>
            <p>View and manage registered students</p>
          </div>
          <button className="refresh-btn" onClick={() => loadStudents()}>Refresh</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.course}</td>
                  <td>{student.age}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => editStudent(student)}>Edit</button>
                    <button className="delete-btn" onClick={() => deleteStudent(student._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty">
                    No student records yet. Add your first student above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <p className="copyright">Student Management System · Project Dashboard</p>
    </main>
  );
}

export default App;
