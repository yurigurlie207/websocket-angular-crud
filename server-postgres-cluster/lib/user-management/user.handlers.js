import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./user.model.js";

// Register function
export const registerUser = async (req, res) => {
  console.log('Registration request received:', req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    console.log('Missing fields');
    return res.status(400).json({ error: "Missing fields" });
  }
  
  try {
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      console.log('User already exists:', username);
      return res.status(400).json({ error: "User exists" });
    }
    
    const passwordHash = bcrypt.hashSync(password, 10);
    console.log('Creating user:', username);
    await User.create({ username, passwordHash });
    console.log('User created successfully:', username);
    res.json({ message: "Registered successfully" });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: "Database error" });
  }
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