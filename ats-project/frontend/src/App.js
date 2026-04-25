import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [resumes, setResumes] = useState("");
  const [results, setResults] = useState([]);

  const register = async () => {
    await axios.post(API + "/register", { email, password });
    alert("Registered");
  };

  const login = async () => {
    const res = await axios.post(API + "/login", { email, password });
    setToken(res.data.token);
  };

  const analyze = async () => {
    const res = await axios.post(
      API + "/analyze",
      { jobDesc, resumes: resumes.split("\n\n") },
      { headers: { Authorization: token } }
    );
    setResults(res.data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>ATS Resume Screening</h2>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

      <br /><br />

      <button onClick={register}>Register</button>
      <button onClick={login}>Login</button>

      {token && (
        <>
          <textarea placeholder="Job Description" onChange={e => setJobDesc(e.target.value)} />
          <br /><br />
          <textarea placeholder="Resumes (separate by blank line)" onChange={e => setResumes(e.target.value)} />
          <br /><br />
          <button onClick={analyze}>Analyze</button>

          {results.map((r, i) => (
            <div key={i}>
              <h3>{r.score.toFixed(2)}%</h3>
              <p>Skills: {r.skills.join(", ")}</p>
              <p>Experience: {r.experience}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}