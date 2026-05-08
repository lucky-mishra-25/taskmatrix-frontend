import React, { useEffect, useState, useCallback } from "react";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ✅ ENV URL
  const BASE_URL = process.env.REACT_APP_API_URL;

  // =========================
  // REDIRECT IF NOT LOGGED IN
  // =========================
  useEffect(() => {
    if (!token) {
      window.location.href = "/";
    }
  }, [token]);

  // =========================
  // FETCH TASKS
  // =========================
  const fetchTasks = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("TASK DATA:", data);

      if (Array.isArray(data)) {
        setTasks(data);
      } else if (data.tasks) {
        setTasks(data.tasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error(err);
      setTasks([]);
    }

    setLoading(false);
  }, [BASE_URL, token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // =========================
  // ADD TASK
  // =========================
  const addTask = async () => {
    if (!input.trim()) return;

    try {
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: input }),
      });

      const newTask = await res.json();

      console.log("NEW TASK:", newTask);

      fetchTasks();

      setInput("");
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // EDIT TASK
  // =========================
  const editTask = async (id) => {
    const newTitle = prompt("Edit task:");

    if (!newTitle) return;

    try {
      await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // TOGGLE COMPLETE
  // =========================
  const toggleComplete = async (task) => {
    try {
      await fetch(`${BASE_URL}/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = async (id) => {
    try {
      await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // AI TASK GENERATION
  // =========================
  const generateTasks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/ai/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("AI DATA:", data);

      if (data.success && Array.isArray(data.tasks)) {
        for (let taskText of data.tasks) {
          await fetch(`${BASE_URL}/api/tasks`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: taskText,
            }),
          });
        }

        fetchTasks();
      } else {
        alert("AI failed to generate tasks");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("token");

    // ✅ FIXED
    window.location.href = "/";
  };

  // =========================
  // UI
  // =========================
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h2>Task Dashboard 🚀</h2>

      <button onClick={logout} style={{ float: "right" }}>
        Logout
      </button>

      {/* INPUT */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Enter task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            padding: "10px",
            marginRight: "10px",
            width: "60%",
          }}
        />

        <button onClick={addTask}>Add</button>

        <button
          onClick={generateTasks}
          style={{ marginLeft: "10px" }}
        >
          AI Tasks
        </button>

        <button
          onClick={() => (window.location.href = "/upgrade")}
          style={{
            marginLeft: "10px",
            background: "gold",
            padding: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Upgrade 💎
        </button>
      </div>

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* TASKS */}
      <div style={{ marginTop: "20px" }}>
        {Array.isArray(tasks) && tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task._id}
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "#f4f4f4",
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                onClick={() => toggleComplete(task)}
                style={{
                  textDecoration: task.completed
                    ? "line-through"
                    : "none",
                  cursor: "pointer",
                }}
              >
                {task.title}
              </span>

              <div>
                <button onClick={() => editTask(task._id)}>
                  ✏️
                </button>

                <button
                  onClick={() => deleteTask(task._id)}
                  style={{ marginLeft: "10px" }}
                >
                  ❌
                </button>
              </div>
            </div>
          ))
        ) : (
          !loading && <p>No tasks found 🚀</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;