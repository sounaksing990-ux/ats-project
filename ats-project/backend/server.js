const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb://127.0.0.1:27017/resumeDB";
const JWT_SECRET = "secret123";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const User = mongoose.model("User", {
  email: String,
  password: String
});

const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send("No token");

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(400).send("Invalid token");
  }
};

app.get("/", (req, res) => res.send("API running"));

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ email, password: hash });
  res.send("Registered");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).send("Wrong password");

  const token = jwt.sign({ id: user._id }, JWT_SECRET);
  res.json({ token });
});

const extractSkills = (text) => {
  const skills = ["javascript", "python", "react", "node", "sql"];
  return skills.filter(s => text.toLowerCase().includes(s));
};

const extractExperience = (text) => {
  return (text.match(/\d+\s+years?/i) || ["0 years"])[0];
};

app.post("/analyze", auth, (req, res) => {
  const { jobDesc, resumes } = req.body;
  const jdWords = jobDesc.toLowerCase().split(/\W+/);

  let results = resumes.map(r => {
    const words = r.toLowerCase().split(/\W+/);
    const match = jdWords.filter(w => words.includes(w)).length;
    const score = (match / jdWords.length) * 100;

    return {
      score,
      skills: extractSkills(r),
      experience: extractExperience(r)
    };
  });

  results.sort((a, b) => b.score - a.score);
  res.json(results);
});

app.listen(5000, () => console.log("Server running on 5000"));