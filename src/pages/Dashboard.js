import React, { useEffect, useState, useCallback } from "react";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ✅ Production Backend URL
  const BASE_URL =
    process.env.REACT_APP_API_URL ||
    "https://taskmatrix-backend-wo86.onrender.com";

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

      // ✅ Handle different backend responses safely
      if (Array.isArray(data)) {
        setTasks(data);
      } else if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Fetch Tasks Error:", err);
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
        body: JSON.stringify({
          title: input,
        }),
      });

      const data = await res.json();

      console.log("ADD TASK:", data);

      setInput("");

      fetchTasks();
    } catch (err) {
      console.error("Add Task Error:", err);
    }
  };

  // =========================
  // EDIT TASK
  // =========================
  const editTask = async (id) => {
    const newTitle = prompt("Edit task:");

    if (!newTitle || !newTitle.trim()) return;

    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
        }),
      });

      const data = await res.json();

      console.log("EDIT TASK:", data);

      fetchTasks();
    } catch (err) {
      console.error("Edit Task Error:", err);
    }
  };

  // =========================
  // TOGGLE COMPLETE
  // =========================
  const toggleComplete = async (task) => {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      const data = await res.json();

      console.log("TOGGLE TASK:", data);

      fetchTasks();
    } catch (err) {
      console.error("Toggle Error:", err);
    }
  };

  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("DELETE TASK:", data);

      fetchTasks();
    } catch (err) {
      console.error("Delete Error:", err);
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
      console.error("AI Error:", err);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("token");

    window.location.href = "/";
  };

  // =========================
  // UI
  // =========================
  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h2>Task Dashboard 🚀</h2>

      <button
        onClick={logout}
        style={{
          float: "right",
          padding: "8px 15px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {/* INPUT SECTION */}
      <div style={{ marginTop: "30px" }}>
        <input
          type="text"
          placeholder="Enter task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            padding: "10px",
            width: "60%",
            marginRight: "10px",
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

      {/* TASK LIST */}
      <div style={{ marginTop: "30px" }}>
        {Array.isArray(tasks) && tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task._id}
              style={{
                padding: "15px",
                borderRadius: "10px",
                background: "#f4f4f4",
                marginBottom: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* TASK TITLE */}
              <span
                onClick={() => toggleComplete(task)}
                style={{
                  textDecoration: task.completed
                    ? "line-through"
                    : "none",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                {task.title || "Untitled Task"}
              </span>

              {/* ACTION BUTTONS */}
              <div>
                <button
                  onClick={() => editTask(task._id)}
                  style={{
                    marginRight: "10px",
                    cursor: "pointer",
                  }}
                >
                  ✏️
                </button>

                <button
                  onClick={() => deleteTask(task._id)}
                  style={{
                    cursor: "pointer",
                  }}
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