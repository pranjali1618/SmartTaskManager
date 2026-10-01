"use client";

import { useEffect, useState } from "react";

type Task = {
  id: number;
  user_id: number;
  name: string;
  priority: "High" | "Medium" | "Low";
  due_date: string | null;
  completed: boolean;
};

type User = {
  id: number;
  name: string;
  email: string;
};

export default function Dashboard() {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">(
    "Medium"
  );

  const [dueDate, setDueDate] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");   
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    window.location.href = "/login";
    return;
  }

  const userData = JSON.parse(savedUser);
  setUser(userData);
}, []);

  const getTasks = async () => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return;
    }

    const userData = JSON.parse(savedUser);

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${userData.id}`
      );

      const data = await response.json();

      setTasks(data);
    } catch (error) {
      alert("Unable to connect to backend.");
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (task.trim() === "") {
      return;
    }

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      alert("Please login first.");
      return;
    }

    const userData = JSON.parse(savedUser);

    try {
      const response = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id,
          name: task,
          priority: priority,
          due_date: dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setTasks([...tasks, data.task]);

      setTask("");
      setPriority("Medium");
      setDueDate("");
    } catch (error) {
      alert("Unable to connect to backend.");
    }
  };

  const toggleTask = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setTasks(
        tasks.map((item) =>
          item.id === id ? data.task : item
        )
      );
    } catch (error) {
      alert("Unable to connect to backend.");
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setTasks(tasks.filter((item) => item.id !== id));
    } catch (error) {
      alert("Unable to connect to backend.");
    }
  };

  const logout = () => {
   localStorage.removeItem("user");
   window.location.href = "/login";
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((item) => item.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const filteredTasks = tasks.filter((item) => {
  const matchesSearch = item.name
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesPriority =
    filterPriority === "All" ||
    item.priority === filterPriority;

  return matchesSearch && matchesPriority;
});

  return (
    
    <main>
      <h1>Smart Task Manager</h1>

      {user && (
        <p>
          Welcome, <strong>{user.name}</strong>
        </p>
      )}

      <h2>Dashboard</h2>

      <div
  style={{
    display: "flex",
    gap: "20px",
    margin: "20px 0",
    flexWrap: "wrap",
  }}
>
  <div
    style={{
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      minWidth: "180px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}
  >
    <h3>Total Tasks</h3>
    <p style={{ fontSize: "28px", fontWeight: "bold" }}>
      {totalTasks}
    </p>
  </div>

  <div
    style={{
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      minWidth: "180px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}
  >
    <h3>Pending</h3>
    <p style={{ fontSize: "28px", fontWeight: "bold" }}>
      {pendingTasks}
    </p>
  </div>

  <div
    style={{
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      minWidth: "180px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}
  >
    <h3>Completed</h3>
    <p style={{ fontSize: "28px", fontWeight: "bold" }}>
      {completedTasks}
    </p>
  </div>
</div>

      <button onClick={logout}>Logout</button>

      <form onSubmit={addTask}>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter a task"
        />

        <input
           type="date"
           value={dueDate}
           onChange={(e) => setDueDate(e.target.value)}
        />

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as "High" | "Medium" | "Low")
          }
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <button type="submit">Add Task</button>
      </form>

      <h3>My Tasks</h3>

      <div style={{ marginBottom: "20px" }}>
  <input
    type="text"
    placeholder="Search tasks..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <select
    value={filterPriority}
    onChange={(e) => setFilterPriority(e.target.value)}
  >
    <option value="All">All Priorities</option>
    <option value="High">High</option>
    <option value="Medium">Medium</option>
    <option value="Low">Low</option>
  </select>
</div>

      {filteredTasks.length === 0 ? (
        <p>No tasks added yet.</p>
      ) : (
        <ul>
          {filteredTasks.map((item) => (
            <li key={item.id}>
              <span
                style={{
                  textDecoration: item.completed
                    ? "line-through"
                    : "none",
                }}
              >
                {item.name} - {item.priority}
                {item.due_date && ` - Due: ${item.due_date}`}
              </span>{" "}

              <button onClick={() => toggleTask(item.id)}>
                {item.completed ? "Undo" : "Complete"}
              </button>{" "}

              <button onClick={() => deleteTask(item.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}