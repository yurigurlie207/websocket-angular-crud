import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./user.model.js";

// Register function
export const registerUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing fields");
  const existing = await User.findOne({ where: { username } });
  if (existing) return res.status(400).send("User exists");
  const passwordHash = bcrypt.hashSync(password, 10);
  await User.create({ username, passwordHash });
  res.send("Registered");
};

// Login function
export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).send("Invalid credentials");
  }
  const token = jwt.sign({ username }, "SECRET_KEY");
  res.json({ token });
};